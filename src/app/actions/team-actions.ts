'use server';

import { unstable_cache, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { TeamService } from '@/lib/services/team-service';
import { getAdminStorage } from '@/lib/firebase-admin';
import {
  teamCategorySchema,
  teamMemberSchema,
  teamMemberUpdateSchema,
  completeOnboardingSchema,
} from '@/schemas/team';
import { logActivityAction, logErrorAction } from './log-actions';

export async function createTeamCategory(values: any) {
  const parsed = teamCategorySchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid data." };
  try {
    await TeamService.createTeamCategory(parsed.data);
    // Log activity
    await logActivityAction(
      `Team Category Created`,
      `Admin created new team category: "${parsed.data.name}"`,
      undefined,
      "Admin"
    );
    revalidateTag('team-members', 'max');
    return { success: true };
  } catch (error: any) {
    await logErrorAction(
      `Category Creation Failed`,
      `Failed to create team category "${parsed.data?.name || "Unknown"}". Error: ${error.message || error}`
    );
    return { error: "Failed to create category." };
  }
}

export async function getTeamCategories() {
  try {
    const categories = await TeamService.getTeamCategories();
    return { categories };
  } catch (e) {
    return { error: "Failed to fetch categories." };
  }
}

export async function getTeamCategoryById(id: string) {
  try {
    const category = await TeamService.getTeamCategoryById(id);
    if (!category) return { error: 'Category not found.' };
    return { category };
  } catch (e) {
    return { error: "Failed to fetch category." };
  }
}

export async function updateTeamCategory(id: string, values: any) {
  const parsed = teamCategorySchema.safeParse(values);
  if (!parsed.success) return { error: 'Invalid data.' };
  try {
    await TeamService.updateTeamCategory(id, parsed.data);
    revalidateTag('team-members', 'max');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to update category.' };
  }
}

export async function deleteTeamCategory(id: string) {
  try {
    await TeamService.deleteTeamCategory(id);
    revalidateTag('team-members', 'max');
    return { success: true };
  } catch (e) {
    return { error: "Failed to delete category." };
  }
}

export async function inviteTeamMember(values: any) {
  const parsed = teamMemberSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid input values." };
  }
  try {
    const cookieStore = await cookies();
    const adminChapter = cookieStore.get('admin_chapter')?.value || '3.0';
    await TeamService.inviteTeamMember({ ...parsed.data, chapter: adminChapter });
    // Log activity
    await logActivityAction(
      `Team Member Invited`,
      `Admin invited ${parsed.data.name} (${parsed.data.email}) to join the team as ${parsed.data.role} in chapter ${adminChapter}`,
      undefined,
      "Admin",
      parsed.data.email
    );
    return { success: true };
  } catch (error: any) {
    await logErrorAction(
      `Team Invitation Failed`,
      `Failed to invite ${parsed.data?.name || "Unknown"}. Error: ${error.message || error}`
    );
    return { error: error.message || "Failed to invite member." };
  }
}


export async function deleteTeamMember(id: string) {
  try {
    const member = await TeamService.getTeamMemberById(id);
    if (member && member.image) {
      try {
        const bucket = getAdminStorage().bucket();
        const relativePath = member.image.split('/o/')[1]?.split('?')[0];
        if (relativePath) {
          const filePath = decodeURIComponent(relativePath);
          const file = bucket.file(filePath);
          await file.delete();
        }
      } catch (err) {
        console.error("Failed to delete member profile photo from storage:", err);
      }
    }

    await TeamService.deleteTeamMember(id);
    revalidateTag('team-members', 'max');
    return { success: true };
  } catch (error) {
    console.error("Error deleting team member:", error);
    return { error: "Failed to delete team member." };
  }
}

export async function resendInvitation(memberId: string) {
  try {
    await TeamService.resendInvitation(memberId);
    return { success: true };
  } catch (error: any) {
    console.error("Error resending invitation:", error);
    return { error: error.message || "Failed to resend invitation." };
  }
}

export async function sendProfileEditLink(memberId: string) {
  try {
    await TeamService.sendProfileEditLink(memberId);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending profile edit link:", error);
    return { error: error.message || "Failed to send profile edit link." };
  }
}

export async function bulkResendInvitations() {
  try {
    const count = await TeamService.bulkResendInvitations();
    return { success: true, count };
  } catch (error) {
    console.error("Error bulk resending invitations:", error);
    return { error: "Failed to resend all invitations." };
  }
}

export async function bulkSendProfileEditLinks() {
  try {
    const count = await TeamService.bulkSendProfileEditLinks();
    return { success: true, count };
  } catch (error) {
    console.error("Error bulk sending edit links:", error);
    return { error: "Failed to send all edit links." };
  }
}

export async function updateTeamMember(id: string, formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const imageFile = formData.get('image') as File | null;

  const updatePayloadSchema = teamMemberUpdateSchema.omit({ image: true });
  const parsed = updatePayloadSchema.safeParse(values);

  if (!parsed.success) {
    console.error("Update validation error:", parsed.error.flatten().fieldErrors);
    return { error: "Invalid data provided." };
  }

  try {
    await TeamService.updateTeamMember(id, parsed.data, imageFile);
    revalidateTag('team-members', 'max');
    return { success: true };
  } catch (error: any) {
    if (error?.code === 'storage/unauthorized') {
      return { error: "Permission denied. Please ensure the 'Storage Object Admin' role is granted." };
    }
    console.error("Error updating team member:", error);
    return { error: error.message || "Failed to update team member." };
  }
}

export async function getTeamMemberByToken(token: string) {
  try {
    const member = await TeamService.getTeamMemberByToken(token);
    if (!member) return { error: "Failed to validate onboarding link." };
    return { member };
  } catch (e: any) {
    console.error("Error fetching member by token:", e);
    return { error: e.message || "Failed to validate onboarding link." };
  }
}

export async function completeOnboarding(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const imageFile = formData.get('image') as File;

  const parsed = completeOnboardingSchema.omit({ image: true }).safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data provided." };
  }

  const { token, linkedin } = parsed.data;

  try {
    const updatedMember = await TeamService.completeOnboarding(token, linkedin || '', imageFile);
    // Log real-time system activity
    await logActivityAction(
      `Onboarding Completed`,
      `Team member ${updatedMember.name} completed onboarding and activated their profile.`,
      updatedMember.id,
      updatedMember.name,
      updatedMember.email
    );
    revalidateTag('team-members', 'max');
    return { success: true, member: updatedMember };
  } catch (e: any) {
    console.error("Error completing onboarding:", e);
    await logErrorAction(
      `Onboarding Failed`,
      `Failed to complete onboarding for token ${token.substring(0, 8)}... Error: ${e.message || e}`
    );
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return { error: `Failed to activate profile: ${errorMessage}` };
  }
}


const getCachedTeamMembers = unstable_cache(
  async () => TeamService.getRawTeamMembers(),
  ['team-members-list'],
  { tags: ['team-members', 'global-settings'], revalidate: 60 }
);

export async function getTeamMembers() {
  try {
    const team = await getCachedTeamMembers();
    return { membersByCategory: team };
  } catch (e) {
    console.error("Error fetching active team members:", e);
    return { error: "Failed to fetch team members." };
  }
}

export async function getAllTeamMembersWithCategory() {
  try {
    const cookieStore = await cookies();
    const adminChapter = cookieStore.get('admin_chapter')?.value || '3.0';
    const members = await TeamService.getAllTeamMembersWithCategory(adminChapter);
    return { members };
  } catch (e) {
    console.error("Error fetching all team members:", e);
    return { error: "Failed to fetch team members." };
  }
}

export async function getTeamMemberById(id: string) {
  try {
    const member = await TeamService.getTeamMemberById(id);
    if (!member) return { error: 'Member not found.' };
    return { member };
  } catch (e) {
    return { error: 'Failed to fetch member.' };
  }
}
