import { BaseAffiliateAdapter } from './base-adapter';
import {
  AffiliatePlatformType,
  AffiliatePlatformConfig,
  AffiliateAdapterResult
} from '../types';

export class AmazonAdapter extends BaseAffiliateAdapter {
  platformType: AffiliatePlatformType = 'AMAZON';
  platformName = 'Amazon Associates';

  verifyProductUrl(url: string): boolean {
    if (!super.verifyProductUrl(url)) return false;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      return (
        host.includes('amazon.in') ||
        host.includes('amazon.com') ||
        host.includes('amazon.co.uk') ||
        host.includes('amazon.ca') ||
        host.includes('amazon.de') ||
        host.includes('amazon.fr') ||
        host.includes('amazon.it') ||
        host.includes('amazon.es') ||
        host.includes('amazon.co.jp') ||
        host.includes('amzn.to') ||
        host.includes('amzn.in')
      );
    } catch {
      return false;
    }
  }

  extractAsin(url: string): string | null {
    if (!url) return null;
    const match = url.match(/(?:\/dp\/|\/gp\/product\/|\/ASIN\/)([A-Z0-9]{10})/i);
    return match ? match[1].toUpperCase() : null;
  }

  generateAffiliateUrl(rawUrl: string, config: AffiliatePlatformConfig): AffiliateAdapterResult {
    if (!config.trackingId || config.trackingId.trim() === '') {
      return this.linkRequiredResult('Amazon Associate Tracking ID / Tag is not configured for this website.');
    }

    if (!rawUrl || rawUrl.trim() === '') {
      return this.linkRequiredResult('Product URL is missing.');
    }

    const trimmedUrl = rawUrl.trim();

    // Check if it's already an amzn.to / amzn.in short link
    if (trimmedUrl.includes('amzn.to/') || trimmedUrl.includes('amzn.in/')) {
      return {
        success: true,
        affiliateUrl: trimmedUrl,
        isVerified: true,
        status: 'VERIFIED',
        message: 'Pre-shortened Amazon affiliate link verified'
      };
    }

    try {
      const parsed = new URL(trimmedUrl);
      const asin = this.extractAsin(trimmedUrl);
      const tag = config.trackingId.trim();

      if (asin) {
        // Construct canonical clean product affiliate URL
        const hostname = parsed.hostname.includes('amazon.') ? parsed.hostname : (config.country === 'India' ? 'www.amazon.in' : 'www.amazon.com');
        const cleanAffiliateUrl = `https://${hostname}/dp/${asin}?tag=${tag}`;
        return {
          success: true,
          affiliateUrl: cleanAffiliateUrl,
          isVerified: true,
          status: 'VERIFIED',
          message: `ASIN ${asin} tagged with ${tag}`
        };
      }

      // If not standard ASIN path, append or replace tag parameter
      parsed.searchParams.set('tag', tag);
      return {
        success: true,
        affiliateUrl: parsed.toString(),
        isVerified: true,
        status: 'VERIFIED'
      };
    } catch (e: any) {
      return this.notSupportedResult(`Invalid URL format: ${e.message}`);
    }
  }
}
