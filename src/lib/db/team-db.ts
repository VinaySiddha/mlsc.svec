import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';

export class TeamDb {
  // Categories Db Operations
  static async addTeamCategory(values: any) {
    return await addDoc(collection(db, 'teamCategories'), values);
  }

  static async getTeamCategoriesOrdered() {
    const q = query(collection(db, 'teamCategories'), orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  }

  static async getTeamCategoryDoc(id: string) {
    const docRef = doc(db, 'teamCategories', id);
    return await getDoc(docRef);
  }

  static async updateTeamCategoryDoc(id: string, values: any) {
    await updateDoc(doc(db, 'teamCategories', id), values);
  }

  static async deleteTeamCategoryDoc(id: string) {
    await deleteDoc(doc(db, 'teamCategories', id));
  }

  // Members Db Operations
  static async checkEmailExists(email: string) {
    const q = query(collection(db, 'teamMembers'), where('email', '==', email));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  static async addTeamMember(newMemberData: any) {
    return await addDoc(collection(db, 'teamMembers'), newMemberData);
  }

  static async getTeamMemberDoc(id: string) {
    const docRef = doc(db, 'teamMembers', id);
    return await getDoc(docRef);
  }

  static async updateTeamMemberDoc(id: string, dataToUpdate: any) {
    const docRef = doc(db, "teamMembers", id);
    await updateDoc(docRef, dataToUpdate);
  }

  static async deleteTeamMemberDoc(id: string) {
    await deleteDoc(doc(db, 'teamMembers', id));
  }

  static async getPendingMembers() {
    const q = query(collection(db, 'teamMembers'), where('status', '==', 'pending'));
    return await getDocs(q);
  }

  static async getActiveMembers() {
    const q = query(collection(db, 'teamMembers'), where('status', '==', 'active'));
    return await getDocs(q);
  }

  static async getAllMembersDocs() {
    return await getDocs(collection(db, "teamMembers"));
  }

  static async getTeamMemberByToken(token: string) {
    const q = query(collection(db, 'teamMembers'), where('onboardingToken', '==', token));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0];
  }

  static async bulkUpdateOnboardingTokens(updates: { memberId: string; onboardingToken: string; tokenExpiresAt: string; }[]) {
    const batch = writeBatch(db);
    for (const update of updates) {
      const docRef = doc(db, 'teamMembers', update.memberId);
      batch.update(docRef, {
        onboardingToken: update.onboardingToken,
        tokenExpiresAt: update.tokenExpiresAt,
      });
    }
    await batch.commit();
  }
}
