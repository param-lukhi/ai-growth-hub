import { BaseAffiliateAdapter } from './base-adapter';
import {
  AffiliatePlatformType,
  AffiliatePlatformConfig,
  AffiliateAdapterResult
} from '../types';

export class FlipkartAdapter extends BaseAffiliateAdapter {
  platformType: AffiliatePlatformType = 'FLIPKART';
  platformName = 'Flipkart Affiliate';

  verifyProductUrl(url: string): boolean {
    if (!super.verifyProductUrl(url)) return false;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      return host.includes('flipkart.com') || host.includes('fkrt.it') || host.includes('dl.flipkart.com');
    } catch {
      return false;
    }
  }

  generateAffiliateUrl(rawUrl: string, config: AffiliatePlatformConfig): AffiliateAdapterResult {
    if (!config.trackingId || config.trackingId.trim() === '') {
      return this.linkRequiredResult('Flipkart Affiliate ID / Tag is not configured for this website.');
    }

    if (!rawUrl || rawUrl.trim() === '') {
      return this.linkRequiredResult('Product URL is missing.');
    }

    const trimmedUrl = rawUrl.trim();

    if (trimmedUrl.includes('fkrt.it/')) {
      return {
        success: true,
        affiliateUrl: trimmedUrl,
        isVerified: true,
        status: 'VERIFIED',
        message: 'Pre-shortened Flipkart affiliate link'
      };
    }

    try {
      const parsed = new URL(trimmedUrl);
      const affid = config.trackingId.trim();

      if (config.deepLinkTemplate && config.deepLinkTemplate.includes('{{URL}}')) {
        const encodedUrl = encodeURIComponent(trimmedUrl);
        const templatedUrl = config.deepLinkTemplate
          .replace('{{URL}}', encodedUrl)
          .replace('{{AFFID}}', affid);
        return {
          success: true,
          affiliateUrl: templatedUrl,
          isVerified: true,
          status: 'VERIFIED'
        };
      }

      parsed.searchParams.set('affid', affid);
      return {
        success: true,
        affiliateUrl: parsed.toString(),
        isVerified: true,
        status: 'VERIFIED',
        message: `Flipkart product tagged with affid=${affid}`
      };
    } catch (e: any) {
      return this.notSupportedResult(`Invalid URL format: ${e.message}`);
    }
  }
}
