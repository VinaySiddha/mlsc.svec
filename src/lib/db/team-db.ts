import { getAdminFirestore } from '@/lib/firebase-admin';

export class TeamDb {
  private static get db() {
    return getAdminFirestore();
  }

  // Categories Db Operations
  static async addTeamCategory(values: any) {
    return await this.db.collection('teamCategories').add(values);
  }

  static async getTeamCategoriesOrdered() {
    const snapshot = await this.db.collection('teamCategories').orderBy('order').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  }

  static async getTeamCategoryDoc(id: string) {
    return await this.db.collection('teamCategories').doc(id).get();
  }

  static async updateTeamCategoryDoc(id: string, values: any) {
    await this.db.collection('teamCategories').doc(id).update(values);
  }

  static async deleteTeamCategoryDoc(id: string) {
    await this.db.collection('teamCategories').doc(id).delete();
  }

  // Members Db Operations
  static async checkEmailExists(email: string) {
    const snapshot = await this.db.collection('teamMembers').where('email', '==', email).get();
    return !snapshot.empty;
  }

  static async addTeamMember(newMemberData: any) {
    return await this.db.collection('teamMembers').add(newMemberData);
  }

  static async getTeamMemberDoc(id: string) {
    return await this.db.collection('teamMembers').doc(id).get();
  }

  static async updateTeamMemberDoc(id: string, dataToUpdate: any) {
    await this.db.collection('teamMembers').doc(id).update(dataToUpdate);
  }

  static async deleteTeamMemberDoc(id: string) {
    await this.db.collection('teamMembers').doc(id).delete();
  }

  static async getPendingMembers() {
    return await this.db.collection('teamMembers').where('status', '==', 'pending').get();
  }

  static async getActiveMembers() {
    return await this.db.collection('teamMembers').where('status', '==', 'active').get();
  }

  static async getAllMembersDocs() {
    return await this.db.collection('teamMembers').get();
  }

  static async getTeamMemberByToken(token: string) {
    const snapshot = await this.db.collection('teamMembers').where('onboardingToken', '==', token).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0];
  }

  static async bulkUpdateOnboardingTokens(updates: { memberId: string; onboardingToken: string; tokenExpiresAt: string; }[]) {
    const batch = this.db.batch();
    for (const update of updates) {
      const docRef = this.db.collection('teamMembers').doc(update.memberId);
      batch.update(docRef, {
        onboardingToken: update.onboardingToken,
        tokenExpiresAt: update.tokenExpiresAt,
      });
    }
    await batch.commit();
  }
}
