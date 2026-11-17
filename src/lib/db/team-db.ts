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
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { sql } from '@/lib/new-db/client';

export class TeamDb {
  // Categories Db Operations
  static async addTeamCategory(values: any) {
    if (process.env.DATA_PROVIDER === 'new') {
      const [row] = await sql`
        INSERT INTO team_categories (name, description, display_order)
        VALUES (${values.name}, ${values.description || null}, ${values.order || 0})
        RETURNING *
      `;
      return { id: row.id, ...row };
    }
    return await addDoc(collection(db, 'teamCategories'), values);
  }

  static async getTeamCategoriesOrdered() {
    if (process.env.DATA_PROVIDER === 'new') {
      const rows = await sql`SELECT * FROM team_categories ORDER BY display_order ASC`;
      return rows.map(r => ({ id: r.id, name: r.name, description: r.description, order: r.display_order }));
    }
    const q = query(collection(db, 'teamCategories'), orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  }

  static async getTeamCategoryDoc(id: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      const [row] = await sql`SELECT * FROM team_categories WHERE id = ${id} LIMIT 1`;
      return {
        exists: () => !!row,
        id: row?.id,
        data: () => row ? { id: row.id, name: row.name, description: row.description, order: row.display_order } : undefined,
      } as any;
    }
    return await getDoc(doc(db, 'teamCategories', id));
  }

  static async updateTeamCategoryDoc(id: string, values: any) {
    if (process.env.DATA_PROVIDER === 'new') {
      await sql`
        UPDATE team_categories
        SET name = COALESCE(${values.name || null}, name),
            description = COALESCE(${values.description || null}, description),
            display_order = COALESCE(${values.order ?? null}, display_order)
        WHERE id = ${id}
      `;
      return;
    }
    await updateDoc(doc(db, 'teamCategories', id), values);
  }

  static async deleteTeamCategoryDoc(id: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      await sql`DELETE FROM team_categories WHERE id = ${id}`;
      return;
    }
    await deleteDoc(doc(db, 'teamCategories', id));
  }

  // Members Db Operations
  static async checkEmailExists(email: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      const res = await sql`SELECT 1 FROM team_members WHERE email = ${email} LIMIT 1`;
      return res.length > 0;
    }
    const q = query(collection(db, 'teamMembers'), where('email', '==', email));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  static async addTeamMember(newMemberData: any) {
    if (process.env.DATA_PROVIDER === 'new') {
      const [row] = await sql`
        INSERT INTO team_members (
          name, email, role, category_id, image_url, linkedin_url, github_url, twitter_url, status, onboarding_token
        ) VALUES (
          ${newMemberData.name}, ${newMemberData.email}, ${newMemberData.role || ''}, ${newMemberData.categoryId || null},
          ${newMemberData.imageUrl || null}, ${newMemberData.linkedinUrl || null}, ${newMemberData.githubUrl || null},
          ${newMemberData.twitterUrl || null}, ${newMemberData.status || 'pending'}, ${newMemberData.onboardingToken || null}
        )
        RETURNING *
      `;
      return { id: row.id, ...row };
    }
    return await addDoc(collection(db, 'teamMembers'), newMemberData);
  }

  static async getTeamMemberDoc(id: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      const [row] = await sql`SELECT * FROM team_members WHERE id = ${id} LIMIT 1`;
      return {
        exists: () => !!row,
        id: row?.id,
        data: () => row ? {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          categoryId: row.category_id,
          imageUrl: row.image_url,
          linkedinUrl: row.linkedin_url,
          githubUrl: row.github_url,
          twitterUrl: row.twitter_url,
          status: row.status,
          onboardingToken: row.onboarding_token,
          createdAt: row.created_at,
        } : undefined,
      } as any;
    }
    return await getDoc(doc(db, 'teamMembers', id));
  }

  static async updateTeamMemberDoc(id: string, dataToUpdate: any) {
    if (process.env.DATA_PROVIDER === 'new') {
      await sql`
        UPDATE team_members
        SET name = COALESCE(${dataToUpdate.name || null}, name),
            role = COALESCE(${dataToUpdate.role || null}, role),
            category_id = COALESCE(${dataToUpdate.categoryId || null}, category_id),
            image_url = COALESCE(${dataToUpdate.imageUrl || null}, image_url),
            linkedin_url = COALESCE(${dataToUpdate.linkedinUrl || null}, linkedin_url),
            github_url = COALESCE(${dataToUpdate.githubUrl || null}, github_url),
            twitter_url = COALESCE(${dataToUpdate.twitterUrl || null}, twitter_url),
            status = COALESCE(${dataToUpdate.status || null}, status),
            updated_at = NOW()
        WHERE id = ${id}
      `;
      return;
    }
    await updateDoc(doc(db, 'teamMembers', id), dataToUpdate);
  }

  static async deleteTeamMemberDoc(id: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      await sql`DELETE FROM team_members WHERE id = ${id}`;
      return;
    }
    await deleteDoc(doc(db, 'teamMembers', id));
  }

  static async getPendingMembers(): Promise<QuerySnapshot<DocumentData>> {
    if (process.env.DATA_PROVIDER === 'new') {
      const rows = await sql`SELECT * FROM team_members WHERE status = 'pending' ORDER BY created_at DESC`;
      const docs = rows.map(r => ({
        id: r.id,
        ref: { id: r.id } as any,
        exists: () => true,
        data: () => ({ id: r.id, name: r.name, email: r.email, role: r.role, categoryId: r.category_id, status: r.status } as DocumentData),
      }));
      return { docs, empty: docs.length === 0, size: docs.length, forEach: (fn: any) => docs.forEach(fn) } as unknown as QuerySnapshot<DocumentData>;
    }
    const q = query(collection(db, 'teamMembers'), where('status', '==', 'pending'));
    return await getDocs(q);
  }

  static async getActiveMembers(): Promise<QuerySnapshot<DocumentData>> {
    if (process.env.DATA_PROVIDER === 'new') {
      const rows = await sql`SELECT * FROM team_members WHERE status = 'active' ORDER BY name ASC`;
      const docs = rows.map(r => ({
        id: r.id,
        ref: { id: r.id } as any,
        exists: () => true,
        data: () => ({
          id: r.id,
          name: r.name,
          email: r.email,
          role: r.role,
          categoryId: r.category_id,
          imageUrl: r.image_url,
          linkedinUrl: r.linkedin_url,
          githubUrl: r.github_url,
          twitterUrl: r.twitter_url,
          status: r.status,
        } as DocumentData),
      }));
      return { docs, empty: docs.length === 0, size: docs.length, forEach: (fn: any) => docs.forEach(fn) } as unknown as QuerySnapshot<DocumentData>;
    }
    const q = query(collection(db, 'teamMembers'), where('status', '==', 'active'));
    return await getDocs(q);
  }

  static async getAllMembersDocs(): Promise<QuerySnapshot<DocumentData>> {
    if (process.env.DATA_PROVIDER === 'new') {
      const rows = await sql`SELECT * FROM team_members ORDER BY created_at DESC`;
      const docs = rows.map(r => ({
        id: r.id,
        ref: { id: r.id } as any,
        exists: () => true,
        data: () => ({ id: r.id, name: r.name, email: r.email, role: r.role, status: r.status } as DocumentData),
      }));
      return { docs, empty: docs.length === 0, size: docs.length, forEach: (fn: any) => docs.forEach(fn) } as unknown as QuerySnapshot<DocumentData>;
    }
    return await getDocs(collection(db, 'teamMembers'));
  }

  static async getTeamMemberByToken(token: string) {
    if (process.env.DATA_PROVIDER === 'new') {
      const [row] = await sql`SELECT * FROM team_members WHERE onboarding_token = ${token} LIMIT 1`;
      if (!row) return null;
      return {
        id: row.id,
        exists: () => true,
        data: () => ({
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          onboardingToken: row.onboarding_token,
          status: row.status,
        }),
      } as any;
    }
    const q = query(collection(db, 'teamMembers'), where('onboardingToken', '==', token));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0];
  }

  static async bulkUpdateOnboardingTokens(updates: { memberId: string; onboardingToken: string; tokenExpiresAt: string; }[]) {
    if (process.env.DATA_PROVIDER === 'new') {
      for (const update of updates) {
        await sql`
          UPDATE team_members
          SET onboarding_token = ${update.onboardingToken}, updated_at = NOW()
          WHERE id = ${update.memberId}
        `;
      }
      return;
    }
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
