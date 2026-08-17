export function eventAnnouncementTemplate(eventName: string, eventDate: string, description: string): { subject: string; html: string } {
  return {
    subject: `New Event: ${eventName}`,
    html: `
    <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
      <div style="background-color: #0056b3; height: 6px;"></div>
      <div style="padding: 20px;">
        <h2 style="color: #222; font-size: 20px; font-weight: 600;">New Event Alert!</h2>
        <p style="font-size: 16px;">
          We're excited to announce a new event: <strong>${eventName}</strong>
        </p>
        <div style="background-color: #f1f5f9; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Event:</strong> ${eventName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${eventDate}</p>
          <p style="margin: 0;">${description}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://mlscsvec.com/events" target="_blank" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Events</a>
        </div>
        <p style="font-size: 12px; color: #888; margin-top: 30px;">You're receiving this because you have email notifications enabled. Manage preferences in your profile settings.</p>
      </div>
    </div>`,
  };
}
