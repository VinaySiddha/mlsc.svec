import { randomBytes } from 'crypto';
import { uploadFile } from '@/lib/storage';
import { sendInvitationEmail } from '@/ai/flows/send-invitation-email';
import { sendProfileConfirmationEmail, ProfileConfirmationEmailInput } from '@/ai/flows/send-profile-confirmation-email';
import { TeamMember, TeamCategory } from '@/types';
import { TeamDb } from '@/lib/db/team-db';

export class TeamService {
  static async createTeamCategory(values: any) {
    await TeamDb.addTeamCategory(values);
  }

  static async getTeamCategories() {
    return await TeamDb.getTeamCategoriesOrdered() as TeamCategory[];
  }

  static async getTeamCategoryById(id: string) {
    const docSnap = await TeamDb.getTeamCategoryDoc(id);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as TeamCategory;
  }

  static async updateTeamCategory(id: string, values: any) {
    await TeamDb.updateTeamCategoryDoc(id, values);
  }

  static async deleteTeamCategory(id: string) {
    await TeamDb.deleteTeamCategoryDoc(id);
  }

  static async inviteTeamMember(values: any) {
    const { email, name, role, categoryId } = values;

    const emailExists = await TeamDb.checkEmailExists(email);
    if (emailExists) {
      throw new Error("A team member with this email already exists.");
    }

    const onboardingToken = randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newMemberData = {
      email,
      name,
      role,
      categoryId,
      status: 'pending',
      onboardingToken,
      tokenExpiresAt: tokenExpiresAt.toISOString(),
      image: '',
      linkedin: '',
    };

    await TeamDb.addTeamMember(newMemberData);

    // Send invitation email in background
    (async () => {
      try {
        await sendInvitationEmail({
          name,
          email,
          role,
          onboardingToken,
        });
      } catch (emailError) {
        console.error(`Invitation email sending failed for ${email}:`, emailError);
      }
    })();
  }

  static async resendInvitation(memberId: string) {
    const memberDoc = await TeamDb.getTeamMemberDoc(memberId);
    if (!memberDoc.exists()) {
      throw new Error("Team member not found.");
    }
    const member = memberDoc.data() as TeamMember;

    if (member.status !== 'pending') {
      throw new Error("This member is already active. Use the 'Send Edit Link' option instead.");
    }

    const onboardingToken = randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await TeamDb.updateTeamMemberDoc(memberId, {
      onboardingToken,
      tokenExpiresAt: tokenExpiresAt.toISOString(),
      status: 'pending',
    });

    await sendInvitationEmail({
      name: member.name,
      email: member.email,
      role: member.role,
      onboardingToken,
    });
  }

  static async sendProfileEditLink(memberId: string) {
    const memberDoc = await TeamDb.getTeamMemberDoc(memberId);

    if (!memberDoc.exists()) {
      throw new Error("Team member not found.");
    }
    const member = { id: memberDoc.id, ...memberDoc.data() } as TeamMember;

    if (member.status !== 'active') {
      throw new Error("Cannot send edit link to a pending member. Please resend their invitation instead.");
    }

    await sendProfileConfirmationEmail({
      name: member.name,
      email: member.email,
      memberId: member.id,
      editLink: `https://mlscsvec.in/profile/edit/${member.id}`,
    });
  }

  static async bulkResendInvitations() {
    const pendingSnapshot = await TeamDb.getPendingMembers();

    if (pendingSnapshot.empty) {
      return 0;
    }

    const updates: { memberId: string; onboardingToken: string; tokenExpiresAt: string; }[] = [];
    const emailsToSend: { name: string; email: string; role: string; onboardingToken: string; }[] = [];

    for (const memberDoc of pendingSnapshot.docs) {
      const member = memberDoc.data() as TeamMember;
      const onboardingToken = randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      updates.push({
        memberId: memberDoc.id,
        onboardingToken,
        tokenExpiresAt: tokenExpiresAt.toISOString(),
      });

      emailsToSend.push({
        name: member.name,
        email: member.email,
        role: member.role,
        onboardingToken,
      });
    }

    await TeamDb.bulkUpdateOnboardingTokens(updates);

    for (const emailData of emailsToSend) {
      await sendInvitationEmail(emailData);
    }

    return updates.length;
  }

  static async bulkSendProfileEditLinks() {
    const activeSnapshot = await TeamDb.getActiveMembers();

    if (activeSnapshot.empty) {
      return 0;
    }

    let count = 0;
    for (const memberDoc of activeSnapshot.docs) {
      const member = { id: memberDoc.id, ...memberDoc.data() } as TeamMember;
      await sendProfileConfirmationEmail({
        name: member.name,
        email: member.email,
        memberId: member.id,
        editLink: `https://mlscsvec.in/profile/edit/${member.id}`,
      });
      count++;
    }

    return count;
  }

  static async updateTeamMember(id: string, updateData: any, imageFile: File | null) {
    const dataToUpdate = { ...updateData };

    if (imageFile && imageFile.size > 0) {
      const url = await uploadFile(imageFile, `profile-images/${id}`);
      dataToUpdate.image = url;
    }

    await TeamDb.updateTeamMemberDoc(id, dataToUpdate);
  }

  static async getTeamMemberByToken(token: string) {
    const memberDoc = await TeamDb.getTeamMemberByToken(token);

    if (!memberDoc) {
      return null;
    }

    const member = { id: memberDoc.id, ...memberDoc.data() } as TeamMember;

    const now = new Date();
    if (!member.tokenExpiresAt) {
      throw new Error("Invalid token expiration date.");
    }
    const expiresAt = new Date(member.tokenExpiresAt);

    if (now > expiresAt) {
      throw new Error("This onboarding link has expired.");
    }

    return member;
  }

  static async completeOnboarding(token: string, linkedin: string, imageFile: File) {
    const member = await this.getTeamMemberByToken(token);
    if (!member) {
      throw new Error("Failed to validate token.");
    }

    const imageUrl = await uploadFile(imageFile, `profile-images/${member.id}`);

    const updatedMemberData = {
      image: imageUrl,
      linkedin,
      status: 'active',
      onboardingToken: '',
      tokenExpiresAt: '',
    };

    await TeamDb.updateTeamMemberDoc(member.id, updatedMemberData);

    const updatedMember = { ...member, ...updatedMemberData };

    (async () => {
      try {
        const emailInput: ProfileConfirmationEmailInput = {
          name: updatedMember.name,
          email: updatedMember.email,
          memberId: member.id,
          editLink: `https://mlscsvec.in/profile/edit/${member.id}`,
        };
        await sendProfileConfirmationEmail(emailInput);
      } catch (emailError) {
        console.error(`Profile confirmation email sending failed for ${updatedMember.email}:`, emailError);
      }
    })();

    return updatedMember;
  }

  static async getRawTeamMembers() {
    const [activeMembersSnapshot, teamCategoriesSnapshot] = await Promise.all([
      TeamDb.getActiveMembers(),
      TeamDb.getTeamCategoriesOrdered()
    ]);
    const teamMembers = activeMembersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
    const teamCategoriesData = teamCategoriesSnapshot as TeamCategory[];

    return teamCategoriesData.map(category => ({
      ...category,
      members: teamMembers.filter(member => member.categoryId === category.id)
    }));
  }

  static async getAllTeamMembersWithCategory() {
    const membersSnapshot = await TeamDb.getAllMembersDocs();
    const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));

    const categories = await TeamDb.getTeamCategoriesOrdered();
    const categoryMap = new Map(categories.map(c => [c.id, { name: c.name, subDomain: c.subDomain }]));

    return members.map(member => ({
      ...member,
      categoryName: categoryMap.get(member.categoryId)?.name || 'Uncategorized',
      subDomain: categoryMap.get(member.categoryId)?.subDomain || 'N/A',
    }));
  }

  static async getTeamMemberById(id: string) {
    const docSnap = await TeamDb.getTeamMemberDoc(id);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as TeamMember;
  }

  static async deleteTeamMember(id: string) {
    await TeamDb.deleteTeamMemberDoc(id);
  }
}
