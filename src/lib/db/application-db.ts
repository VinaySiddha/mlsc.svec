import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  writeBatch,
  Query,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';

export function buildFilteredQuery(params: {
  panelDomain?: string;
  search?: string;
  searchBy?: string;
  status?: string;
  year?: string;
  branch?: string;
  domain?: string;
  attendedOnly?: boolean;
  sortByRecommended?: string;
}) {
  const { panelDomain, search, searchBy, status, year, branch, domain, attendedOnly, sortByRecommended } = params;
  let q: Query<DocumentData> = collection(db, 'applications');
  const constraints: QueryConstraint[] = [
    where("isArchived", "==", false)
  ];

  const nonTechDomains = ['event_management', 'public_relations', 'media_marketing', 'creativity'];

  if (domain && domain !== 'all') {
    const isNonTech = nonTechDomains.includes(domain);
    constraints.push(where(isNonTech ? 'nonTechnicalDomain' : 'technicalDomain', '==', domain));
  }

  if (status && status !== 'all') {
    constraints.push(where('status', '==', status));
  }
  if (year) constraints.push(where('yearOfStudy', '==', year));
  if (branch) constraints.push(where('branch', '==', branch));
  if (attendedOnly) constraints.push(where('interviewAttended', '==', true));
  if (sortByRecommended === 'true') {
    constraints.push(where('isRecommended', '==', true));
  }

  if (search) {
    const searchTermLower = search.toLowerCase();
    const searchField = searchBy === 'name' ? 'name_lowercase' : 'rollNo_lowercase';
    constraints.push(where(searchField, '==', searchTermLower));
  }

  if (constraints.length > 0) {
    q = query(q, ...constraints);
  }

  return q;
}

export class ApplicationDb {
  static async checkEmailExists(email: string, chapter: string = '3.0') {
    const applicationsRef = collection(db, "applications");
    const emailQuery = query(applicationsRef, where("email", "==", email));
    const snapshot = await getDocs(emailQuery);
    if (snapshot.empty) return false;
    return snapshot.docs.some(doc => {
      const docChapter = doc.data().chapter || '3.0';
      return docChapter === chapter;
    });
  }

  static async checkRollNoExists(rollNoLowercase: string, chapter: string = '3.0') {
    const applicationsRef = collection(db, "applications");
    const rollNoQuery = query(applicationsRef, where("rollNo_lowercase", "==", rollNoLowercase));
    const snapshot = await getDocs(rollNoQuery);
    if (snapshot.empty) return false;
    return snapshot.docs.some(doc => {
      const docChapter = doc.data().chapter || '3.0';
      return docChapter === chapter;
    });
  }

  static async addApplication(newApplication: any) {
    const applicationsRef = collection(db, "applications");
    const docRef = await addDoc(applicationsRef, newApplication);
    await updateDoc(docRef, { firestoreId: docRef.id });
    return docRef;
  }

  static async updateApplicationDoc(idOrRefId: string, dataToUpdate: any) {
    if (!idOrRefId) throw new Error("No application ID provided.");
    
    // First try direct firestoreId
    const directDocRef = doc(db, 'applications', idOrRefId);
    const directSnap = await getDoc(directDocRef);
    if (directSnap.exists()) {
      await updateDoc(directDocRef, dataToUpdate);
      return;
    }

    // Fallback search by reference ID (id field)
    const q = query(collection(db, 'applications'), where('id', '==', idOrRefId), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      await updateDoc(querySnapshot.docs[0].ref, dataToUpdate);
      return;
    }

    throw new Error(`Application not found with ID: ${idOrRefId}`);
  }

  static async deleteApplicationDoc(idOrRefId: string) {
    if (!idOrRefId) throw new Error("No application ID provided.");
    
    const directDocRef = doc(db, 'applications', idOrRefId);
    const directSnap = await getDoc(directDocRef);
    if (directSnap.exists()) {
      await deleteDoc(directDocRef);
      return;
    }

    const q = query(collection(db, 'applications'), where('id', '==', idOrRefId), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      await deleteDoc(querySnapshot.docs[0].ref);
      return;
    }

    throw new Error(`Application not found with ID: ${idOrRefId}`);
  }

  static async getApplicationByRefId(refId: string) {
    const q = query(collection(db, 'applications'), where('id', '==', refId), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const docSnap = querySnapshot.docs[0];
    return { firestoreId: docSnap.id, ...docSnap.data() } as any;
  }

  static async getApplicationDoc(firestoreId: string) {
    return await getDoc(doc(db, 'applications', firestoreId));
  }

  static async getPanels() {
    const panelsCol = collection(db, 'panels');
    const panelSnapshot = await getDocs(panelsCol);
    return panelSnapshot.docs.map(doc => doc.data());
  }

  static async getApplicationsCount(q: Query<DocumentData>) {
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }

  static async getApplicationsDocs(q: Query<DocumentData>) {
    return await getDocs(q);
  }

  static async getDeadline() {
    const settingsRef = doc(db, 'settings', 'global');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists() && settingsSnap.data().deadline) {
      return settingsSnap.data().deadline;
    }
    return null;
  }

  static async setDeadline(deadline: string) {
    const settingsRef = doc(db, 'settings', 'global');
    await setDoc(settingsRef, { deadline }, { merge: true });
  }

  static async getHiringStatus() {
    const settingsRef = doc(db, 'settings', 'global');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      return settingsSnap.data().isHiringOpen || false;
    }
    return false;
  }

  static async setHiringStatus(isOpen: boolean) {
    const settingsRef = doc(db, 'settings', 'global');
    await setDoc(settingsRef, { isHiringOpen: isOpen }, { merge: true });
  }

  static async getAllApplicationsDocs() {
    const applicationsRef = collection(db, 'applications');
    return await getDocs(applicationsRef);
  }

  static async getHiredCandidatesDocs() {
    const q = query(collection(db, 'applications'), where('status', '==', 'Hired'));
    return await getDocs(q);
  }

  static async getTeamCategoriesDocs() {
    const categoriesRef = collection(db, 'teamCategories');
    return await getDocs(categoriesRef);
  }

  static async executeBulkStatusUpdate(querySnapshot: any, newStatus: string) {
    const batch = writeBatch(db);
    const applicantsToEmail: any[] = [];

    querySnapshot.docs.forEach((documentSnapshot: any) => {
      const data = documentSnapshot.data();
      if (data.status !== newStatus) {
        batch.update(documentSnapshot.ref, { status: newStatus });
        applicantsToEmail.push({
          name: data.name,
          email: data.email,
          status: newStatus,
          referenceId: data.id,
        });
      }
    });

    await batch.commit();
    return applicantsToEmail;
  }

  static async executeBulkUpdateFromCsv(hiredRollNos: Set<string>, defaultCategoryId: string | null) {
    const allApplicationsSnapshot = await getDocs(collection(db, 'applications'));
    const batch = writeBatch(db);
    const applicantsToEmail: any[] = [];
    const membersToInvite: any[] = [];

    for (const doc of allApplicationsSnapshot.docs) {
      const app = doc.data();
      const isHired = hiredRollNos.has(app.rollNo_lowercase);

      if (isHired) {
        if (app.status !== 'Hired') {
          batch.update(doc.ref, { status: 'Hired' });
          if (defaultCategoryId) {
            membersToInvite.push({
              name: app.name,
              email: app.email,
              role: 'Team Member',
              categoryId: defaultCategoryId
            });
          }
        }
      } else {
        if (app.status !== 'Hired' && app.status !== 'Rejected') {
          batch.update(doc.ref, { status: 'Rejected' });
          applicantsToEmail.push({
            name: app.name,
            email: app.email,
            status: 'Rejected',
            referenceId: app.id,
          });
        }
      }
    }

    await batch.commit();
    return { applicantsToEmail, membersToInvite };
  }

  static async executeFinalizeHiringCycle(
    activeMembersSnapshot: any,
    hiredAppsSnapshot: any,
    allActiveAppsSnapshot: any,
    defaultCategoryId: string
  ) {
    const categoriesRef = collection(db, 'teamCategories');
    let batch = writeBatch(db);
    let operationCount = 0;

    const commitBatchIfNeeded = async () => {
      if (operationCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    };

    // 1. Archive active team members
    for (const docSnap of activeMembersSnapshot.docs) {
      batch.update(docSnap.ref, { status: 'alumni' });
      operationCount++;
      await commitBatchIfNeeded();
    }

    // 2. Prep hired members list
    const membersToInvite: any[] = [];
    for (const docSnap of hiredAppsSnapshot.docs) {
      const app = docSnap.data();
      const catQuery = query(categoriesRef, where('subDomain', '==', app.technicalDomain));
      const catSnapshot = await getDocs(catQuery);
      const categoryId = !catSnapshot.empty ? catSnapshot.docs[0].id : defaultCategoryId;

      membersToInvite.push({
        name: app.name,
        email: app.email,
        role: 'Team Member',
        categoryId
      });
    }

    // 3. Archive all active apps
    for (const docSnap of allActiveAppsSnapshot.docs) {
      batch.update(docSnap.ref, { isArchived: true });
      operationCount++;
      await commitBatchIfNeeded();
    }

    if (operationCount > 0) {
      await batch.commit();
    }

    return membersToInvite;
  }

  static async getGlobalSettingsDoc() {
    return await getDoc(doc(db, 'settings', 'global'));
  }

  static async getActiveChapter() {
    const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
    if (settingsSnap.exists() && settingsSnap.data().activeChapter) {
      return settingsSnap.data().activeChapter;
    }
    return '3.0';
  }

  static async getDomainPanelMembers(domain: string) {
    const usersRef = collection(db, "users");
    try {
      const q = query(
        usersRef, 
        where("role", "in", ["panel", "common_panel"])
      );
      const snapshot = await getDocs(q);
      const allPanels = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() } as any))
        .filter(user => !user.disabled && user.email);

      // First check for domain-matched panels
      const domainMatches = allPanels.filter(p => p.role === 'panel' && p.domain === domain);
      if (domainMatches.length > 0) {
        return domainMatches;
      }

      // Fallback to common panel members if no domain-specific panel exists
      const commonMatches = allPanels.filter(p => p.role === 'common_panel');
      if (commonMatches.length > 0) {
        return commonMatches;
      }

      return allPanels;
    } catch (e) {
      console.error("Error fetching domain panel members:", e);
      return [];
    }
  }

  static async getPanelAssignmentCounts(domain: string, activeChapter: string) {
    const appsRef = collection(db, "applications");
    const q = query(
      appsRef,
      where("isArchived", "==", false),
      where("chapter", "==", activeChapter)
    );
    // Since we can't easily query by domain and chapter and group by without a composite index,
    // we'll just fetch active apps in the chapter and filter/count manually. This is fast enough for ~500 apps.
    const snapshot = await getDocs(q);
    const counts: Record<string, number> = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.assignedTo && data.technicalDomain === domain) {
        counts[data.assignedTo] = (counts[data.assignedTo] || 0) + 1;
      }
    });
    return counts;
  }

  static async setActiveChapter(chapter: string) {
    const settingsRef = doc(db, 'settings', 'global');
    await setDoc(settingsRef, { activeChapter: chapter }, { merge: true });
  }

  static async getChapterSettings(chapter: string) {
    const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
    if (settingsSnap.exists() && settingsSnap.data().chapters?.[chapter]) {
      return settingsSnap.data().chapters[chapter];
    }
    return {
      isHiringOpen: false,
      isTeamVisible: true,
    };
  }

  static async updateChapterSettings(chapter: string, values: { isHiringOpen?: boolean; isTeamVisible?: boolean }) {
    const settingsRef = doc(db, 'settings', 'global');
    const settingsSnap = await getDoc(settingsRef);
    const chapters = settingsSnap.exists() ? settingsSnap.data().chapters || {} : {};
    
    // Seed default configurations for legacy chapters if they do not exist
    if (!chapters['3.0']) {
      chapters['3.0'] = { isHiringOpen: false, isTeamVisible: true };
    }
    if (!chapters['4.0']) {
      chapters['4.0'] = { isHiringOpen: true, isTeamVisible: true };
    }

    chapters[chapter] = {
      ...(chapters[chapter] || { isHiringOpen: false, isTeamVisible: true }),
      ...values,
    };
    await setDoc(settingsRef, { chapters }, { merge: true });
  }
}
