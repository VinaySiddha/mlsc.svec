import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export class JobDb {
  static async getLastFetchTimeDoc() {
    const metaRef = doc(db, 'jobs_meta', 'lastFetch');
    return await getDoc(metaRef);
  }

  static async updateLastFetchTime(now: Date) {
    const metaRef = doc(db, 'jobs_meta', 'lastFetch');
    await setDoc(metaRef, { timestamp: Timestamp.fromDate(now) });
  }

  static async getExistingJobs(limitNum = 200) {
    const jobsRef = collection(db, "jobs");
    const q = query(jobsRef, orderBy('created_at', 'desc'), limit(limitNum));
    return await getDocs(q);
  }

  static async saveJobsBatch(jobsData: any[]) {
    const jobsRef = collection(db, "jobs");
    const batch = writeBatch(db);

    for (const job of jobsData) {
      const newJobRef = doc(jobsRef);
      batch.set(newJobRef, {
        ...job,
        created_at: serverTimestamp()
      });
    }

    await batch.commit();
  }

  static async getLatestJobs(limitNum = 50) {
    const jobsQuery = query(collection(db, "jobs"), orderBy("posted_on", "desc"), limit(limitNum));
    const jobsSnapshot = await getDocs(jobsQuery);
    return jobsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        posted_on: data.posted_on.toDate().toISOString(),
      };
    });
  }
}
