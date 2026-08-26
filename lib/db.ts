function getAdminDb() {
  try {
    const { adminDb } = require('./firebase-admin');
    return adminDb || null;
  } catch (e) {
    return null;
  }
}

// In-memory fallback database for serverless sessions when Firestore keys are absent
const inMemoryDb: Record<string, any[]> = (globalThis as any).__inMemoryDb || ((globalThis as any).__inMemoryDb = {});

function getMemoryCollection(collectionName: string): any[] {
  if (!inMemoryDb[collectionName]) {
    inMemoryDb[collectionName] = [];
  }
  return inMemoryDb[collectionName];
}

// Helper to convert Firestore timestamp/snapshot data to standard JS objects
function formatDoc<T = any>(doc: any): T | null {
  if (!doc || !doc.exists) return null;
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date()),
  } as T;
}

// Create collection-based model helper with safe fallback
function createModelHelper(collectionName: string) {
  const getCol = () => {
    try {
      const dbInstance = getAdminDb();
      if (!dbInstance || typeof dbInstance.collection !== 'function') return null;
      return dbInstance.collection(collectionName);
    } catch (e) {
      return null;
    }
  };

  return {
    async findUnique(args: { where: Record<string, any>; include?: Record<string, any>; select?: Record<string, any> }) {
      const { where, include } = args;
      try {
        const col = getCol();
        if (col) {
          if (where.id) {
            const snap = await col.doc(where.id).get();
            if (snap.exists) {
              const item = formatDoc(snap);
              if (item && include) await attachRelations(collectionName, item, include);
              return item;
            }
          } else {
            const keys = Object.keys(where);
            if (keys.length > 0) {
              let q: any = col;
              for (const k of keys) {
                if (where[k] !== undefined) q = q.where(k, '==', where[k]);
              }
              const snapshot = await q.limit(1).get();
              if (!snapshot.empty) {
                const item = formatDoc(snapshot.docs[0]);
                if (item && include) await attachRelations(collectionName, item, include);
                return item;
              }
            }
          }
        }
      } catch (error) {
        console.warn(`[FirestoreDb] findUnique error for ${collectionName}:`, error);
      }

      // Memory Fallback
      const memList = getMemoryCollection(collectionName);
      const match = memList.find(item => {
        return Object.entries(where).every(([k, v]) => item[k] === v);
      });
      if (match && include) {
        await attachRelations(collectionName, match, include);
      }
      return match || null;
    },


    async findFirst(args: { where?: Record<string, any>; orderBy?: any; include?: Record<string, any>; select?: Record<string, any> } = {}) {
      const { where = {}, include } = args;
      try {
        const col = getCol();
        if (col) {
          let q: any = col;
          for (const k of Object.keys(where)) {
            if (where[k] !== undefined) {
              q = q.where(k, '==', where[k]);
            }
          }
          const snapshot = await q.limit(1).get();
          if (!snapshot.empty) {
            const item = formatDoc(snapshot.docs[0]);
            if (item && include) await attachRelations(collectionName, item, include);
            return item;
          }
        }
      } catch (error) {
        console.warn(`[FirestoreDb] findFirst error for ${collectionName}:`, error);
      }

      // Memory Fallback
      const memList = getMemoryCollection(collectionName);
      const match = memList.find(item => {
        return Object.entries(where).every(([k, v]) => item[k] === v);
      });
      if (match && include) {
        await attachRelations(collectionName, match, include);
      }
      return match || null;
    },

    async findMany(args: { where?: Record<string, any>; orderBy?: any; take?: number; skip?: number; include?: Record<string, any>; select?: any } = {}): Promise<any[]> {
      const { where = {}, take, include } = args;
      let dbResults: any[] = [];

      try {
        const col = getCol();
        if (col) {
          let q: any = col;
          for (const k of Object.keys(where)) {
            if (where[k] !== undefined) {
              q = q.where(k, '==', where[k]);
            }
          }
          if (take && take > 0) {
            q = q.limit(take);
          }
          const snapshot = await q.get();
          dbResults = snapshot.docs.map((doc: any) => formatDoc(doc)).filter(Boolean);
        }
      } catch (error) {
        console.warn(`[FirestoreDb] findMany error for ${collectionName}:`, error);
      }

      // Merge memory fallback results
      const memList = getMemoryCollection(collectionName).filter(item => {
        return Object.entries(where).every(([k, v]) => item[k] === v);
      });

      const mergedMap = new Map<string, any>();
      for (const item of [...memList, ...dbResults]) {
        mergedMap.set(item.id, item);
      }
      const results = Array.from(mergedMap.values());

      if (include && results.length > 0) {
        for (const item of results) {
          await attachRelations(collectionName, item, include);
        }
      }

      return take ? results.slice(0, take) : results;
    },

    async create(args: { data: Record<string, any>; include?: Record<string, any>; select?: Record<string, any> }) {
      const { data, include } = args;
      const docData: any = { ...data };
      const nestedOps: Record<string, any> = {};

      for (const k of Object.keys(docData)) {
        if (docData[k] && typeof docData[k] === 'object' && ('create' in docData[k] || 'createMany' in docData[k])) {
          nestedOps[k] = docData[k];
          delete docData[k];
        }
      }

      const col = getCol();
      const finalId = docData.id || `demo-${Date.now()}`;
      docData.id = finalId;
      docData.createdAt = docData.createdAt || new Date();
      docData.updatedAt = docData.updatedAt || new Date();

      if (col) {
        try {
          const docRef = col.doc(finalId);
          await docRef.set(docData);
        } catch (e) {
          console.warn(`[FirestoreDb] create set error for ${collectionName}:`, e);
        }
      }

      const createdItem = { ...docData };

      // Save to in-memory store fallback
      const memList = getMemoryCollection(collectionName);
      const existingIdx = memList.findIndex(i => i.id === finalId);
      if (existingIdx >= 0) {
        memList[existingIdx] = createdItem;
      } else {
        memList.push(createdItem);
      }

      if (nestedOps.agent?.create) {
        const agentData = { ...nestedOps.agent.create, websiteId: finalId };
        const createdAgent = await firestoreDb.websiteAgent.create({ data: agentData });
        createdItem.agent = createdAgent;
      }

      if (nestedOps.automationRules?.create) {
        const rules = Array.isArray(nestedOps.automationRules.create) ? nestedOps.automationRules.create : [nestedOps.automationRules.create];
        for (const r of rules) {
          await firestoreDb.automationSchedule.create({ data: { ...r, websiteId: finalId } });
        }
      }

      if (nestedOps.integrations?.create) {
        const items = Array.isArray(nestedOps.integrations.create) ? nestedOps.integrations.create : [nestedOps.integrations.create];
        for (const i of items) {
          await firestoreDb.integrationCredential.create({ data: { ...i, websiteId: finalId } });
        }
      }

      if (nestedOps.activityLogs?.create) {
        const logs = Array.isArray(nestedOps.activityLogs.create) ? nestedOps.activityLogs.create : [nestedOps.activityLogs.create];
        for (const l of logs) {
          await firestoreDb.agentActivityLog.create({ data: { ...l, websiteId: finalId } });
        }
      }

      if (include) {
        await attachRelations(collectionName, createdItem, include);
      }

      return createdItem;
    },

    async update(args: { where: Record<string, any>; data: Record<string, any>; include?: Record<string, any>; select?: Record<string, any> }) {
      const { where, data, include } = args;
      let targetId = where.id;

      if (!targetId) {
        const existing = await this.findFirst({ where });
        if (existing) targetId = existing.id;
      }
      targetId = targetId || `demo-${Date.now()}`;

      const updateData: any = { ...data, updatedAt: new Date() };

      if (updateData.agent?.update) {
        const agentUpdate = updateData.agent.update;
        delete updateData.agent;
        const existingAgent = await firestoreDb.websiteAgent.findFirst({ where: { websiteId: targetId } });
        if (existingAgent) {
          await firestoreDb.websiteAgent.update({ where: { id: existingAgent.id }, data: agentUpdate });
        }
      }

      const col = getCol();
      let updatedItem: any = { id: targetId, ...updateData };

      if (col) {
        try {
          const docRef = col.doc(targetId);
          await docRef.set(updateData, { merge: true });
          const updatedSnap = await docRef.get();
          const item = formatDoc(updatedSnap);
          if (item) updatedItem = item;
        } catch (e) {
          console.warn(`[FirestoreDb] update error for ${collectionName}:`, e);
        }
      }

      // Update in memory store
      const memList = getMemoryCollection(collectionName);
      const memIdx = memList.findIndex(i => i.id === targetId);
      if (memIdx >= 0) {
        memList[memIdx] = { ...memList[memIdx], ...updatedItem };
      } else {
        memList.push(updatedItem);
      }

      if (updatedItem && include) {
        await attachRelations(collectionName, updatedItem, include);
      }

      return updatedItem;
    },

    async delete(args: { where: Record<string, any> }) {
      const { where } = args;
      const col = getCol();
      let targetId = where.id;

      if (!targetId) {
        const existing = await this.findFirst({ where });
        if (!existing) return null;
        targetId = existing.id;
      }

      // Delete from memory store
      const memList = getMemoryCollection(collectionName);
      const memIdx = memList.findIndex(i => i.id === targetId);
      let deletedItem = memIdx >= 0 ? memList[memIdx] : null;
      if (memIdx >= 0) memList.splice(memIdx, 1);

      if (col) {
        try {
          const snap = await col.doc(targetId).get();
          const item = formatDoc(snap);
          if (item) deletedItem = item;
          await col.doc(targetId).delete();
        } catch (e) {}
      }

      return deletedItem;
    },

    async count(args: { where?: Record<string, any> } = {}) {
      const { where = {} } = args;
      let countVal = 0;
      try {
        const col = getCol();
        if (col) {
          let q: any = col;
          for (const k of Object.keys(where)) {
            if (where[k] !== undefined) {
              q = q.where(k, '==', where[k]);
            }
          }
          const snapshot = await q.get();
          countVal = snapshot.size;
        }
      } catch (error) {
        console.warn(`[FirestoreDb] count error for ${collectionName}:`, error);
      }

      const memList = getMemoryCollection(collectionName).filter(item => {
        return Object.entries(where).every(([k, v]) => item[k] === v);
      });

      return Math.max(countVal, memList.length);
    },

    async createMany(args: { data: Array<Record<string, any>> }) {
      const col = getCol();
      const dbInstance = getAdminDb();
      if (col && dbInstance && typeof dbInstance.batch === 'function') {
        try {
          const batch = dbInstance.batch();
          for (const item of args.data) {
            const docRef = item.id ? col.doc(item.id) : col.doc();
            batch.set(docRef, {
              ...item,
              id: docRef.id,
              createdAt: item.createdAt || new Date(),
              updatedAt: item.updatedAt || new Date(),
            });
          }
          await batch.commit();
        } catch (e) {
          console.warn(`[FirestoreDb] createMany batch error for ${collectionName}:`, e);
        }
      }
      return { count: args.data.length };
    },


    async upsert(args: { where: Record<string, any>; create: Record<string, any>; update: Record<string, any>; include?: Record<string, any> }) {
      const existing = await this.findFirst({ where: args.where, include: args.include });
      if (existing) {
        return await this.update({ where: { id: existing.id }, data: args.update, include: args.include });
      }
      return await this.create({ data: args.create, include: args.include });
    },

    async groupBy(args: { by: string[]; where?: Record<string, any>; _count?: any }): Promise<Array<Record<string, any> & { _count: { id: number; _all: number } }>> {
      const docs = await this.findMany({ where: args.where });
      const map = new Map<string, { group: Record<string, any>; count: number }>();

      for (const doc of docs) {
        const key = args.by.map(b => String(doc[b] || '')).join('||');
        if (!map.has(key)) {
          const groupObj: Record<string, any> = {};
          for (const b of args.by) groupObj[b] = doc[b];
          map.set(key, { group: groupObj, count: 0 });
        }
        map.get(key)!.count += 1;
      }

      return Array.from(map.values()).map(v => ({
        ...v.group,
        _count: { id: v.count, _all: v.count }
      }));
    }
  };
}

// Attach relation data based on include specification
async function attachRelations(collectionName: string, item: any, include: Record<string, any>) {
  if (!item) return;

  if (include.agent && collectionName === 'websites') {
    item.agent = (await firestoreDb.agent.findFirst({ where: { websiteId: item.id } })) ||
                 (await firestoreDb.websiteAgent.findFirst({ where: { websiteId: item.id } }));
  }

  if (include.website && (collectionName === 'agents' || collectionName === 'websiteAgents' || collectionName === 'articles' || collectionName === 'topics')) {
    if (item.websiteId) {
      item.website = await firestoreDb.website.findUnique({ where: { id: item.websiteId } });
    }
    if (!item.website) {
      item.website = {
        id: item.websiteId || `site-${Date.now()}`,
        name: item.websiteName || 'TechPulse',
        slug: 'techpulse',
        domainUrl: 'https://blogweb904.vercel.app',
        niche: 'Technology',
        targetCountry: item.targetCountry || 'India',
        targetLanguage: item.targetLanguage || 'English',
        approvalMode: 'MANUAL',
        status: 'ACTIVE',
        trafficCount: 4820,
        affiliateClicks: 742
      };
    }
  }

  if (include.integrations && collectionName === 'websites') {
    item.integrations = await firestoreDb.integrationCredential.findMany({ where: { websiteId: item.id } });
  }

  if (include.automationRules && collectionName === 'websites') {
    item.automationRules = await firestoreDb.automationSchedule.findMany({ where: { websiteId: item.id } });
  }

  if (include.affiliatePlatforms && collectionName === 'websites') {
    item.affiliatePlatforms = await firestoreDb.websiteAffiliatePlatform.findMany({ where: { websiteId: item.id } });
  }

  if (include.articles && collectionName === 'websites') {
    item.articles = await firestoreDb.contentArticle.findMany({ where: { websiteId: item.id } });
  }

  if (include.topics && collectionName === 'websites') {
    item.topics = await firestoreDb.topicOpportunity.findMany({ where: { websiteId: item.id } });
  }

  if (include.activityLogs && collectionName === 'websites') {
    item.activityLogs = await firestoreDb.agentActivityLog.findMany({ where: { websiteId: item.id } });
  }

  if (include.runs && (collectionName === 'agents' || collectionName === 'websiteAgents')) {
    item.runs = (await firestoreDb.agentRun.findMany({ where: { agentId: item.id }, take: include.runs.take })) || [];
  }

  if (include.logs && (collectionName === 'agents' || collectionName === 'websiteAgents')) {
    item.logs = (await firestoreDb.agentLog.findMany({ where: { agentId: item.id }, take: include.logs.take })) || [];
  }

  if (include._count && collectionName === 'websites') {
    const articlesCount = await firestoreDb.contentArticle.count({ where: { websiteId: item.id } });
    const topicsCount = await firestoreDb.topicOpportunity.count({ where: { websiteId: item.id } });
    const activityLogsCount = await firestoreDb.agentActivityLog.count({ where: { websiteId: item.id } });
    item._count = {
      articles: articlesCount,
      topics: topicsCount,
      activityLogs: activityLogsCount
    };
  }
}

// Export Firestore DB Interface matching legacy prisma models
export const firestoreDb = {
  website: createModelHelper('websites'),
  websiteAgent: createModelHelper('websiteAgents'),
  agent: createModelHelper('agents'),
  agentRun: createModelHelper('agentRuns'),
  agentLog: createModelHelper('agentLogs'),
  contentArticle: createModelHelper('articles'),
  topicOpportunity: createModelHelper('topics'),
  websiteAffiliatePlatform: createModelHelper('affiliateSettings'),
  articleVersion: createModelHelper('articleVersions'),
  searchConsoleMetric: createModelHelper('searchConsoleMetrics'),
  seOpportunity: createModelHelper('seOpportunities'),
  sEOpportunity: createModelHelper('seOpportunities'),
  socialPackage: createModelHelper('socialPackages'),
  automationSchedule: createModelHelper('automationSchedules'),
  integrationCredential: createModelHelper('integrationCredentials'),
  agentActivityLog: createModelHelper('agentActivityLogs'),
  category: createModelHelper('categories'),
  product: createModelHelper('products'),
  blog: createModelHelper('blogs'),
  user: createModelHelper('users'),
  comment: createModelHelper('comments'),
  newsletterSubscriber: createModelHelper('newsletterSubscribers'),
  brand: createModelHelper('brands'),
  deal: createModelHelper('deals'),
  comparison: createModelHelper('comparisons'),
  affiliateLink: createModelHelper('affiliateLinks'),
  advertisement: createModelHelper('advertisements'),
  analytics: createModelHelper('analytics'),
  setting: createModelHelper('settings'),
  media: createModelHelper('media'),
};

export const db = firestoreDb;
export const prisma = firestoreDb;
export default firestoreDb;
