'use server';

import { getApplicationById } from '@/app/actions/application-actions';

export async function trackApplicationAction(referenceId: string) {
  if (!referenceId || referenceId.trim().length < 5) {
    return { error: 'Please enter a valid Reference ID.' };
  }

  const result = await getApplicationById(referenceId.trim().toUpperCase());
  if (result.error || !result.application) {
    return { error: 'No application found with that Reference ID. Please check and try again.' };
  }

  const app = result.application;

  // Only expose safe public fields — never expose scores, remarks, or panel data
  return {
    application: {
      id: app.id,
      name: app.name,
      email: app.email,
      technicalDomain: app.technicalDomain,
      nonTechnicalDomain: app.nonTechnicalDomain,
      status: app.status || 'Received',
      submittedAt: app.submittedAt,
    },
  };
}
