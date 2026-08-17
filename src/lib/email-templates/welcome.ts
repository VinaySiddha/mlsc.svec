export function welcomeEmailTemplate(name: string): { subject: string; html: string } {
  return {
    subject: 'Welcome to MLSC SVEC!',
    html: `
    <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
      <div style="background-color: #0056b3; height: 6px;"></div>
      <div style="padding: 20px;">
        <h2 style="color: #222; font-size: 20px; font-weight: 600;">Welcome, ${name}!</h2>
        <p style="font-size: 16px;">
          Thank you for joining the Microsoft Learn Student Club at Sri Vasavi Engineering College.
        </p>
        <p>Here's what you can do now:</p>
        <ul style="padding-left: 20px;">
          <li>Browse and register for upcoming <strong>events</strong></li>
          <li>Join the <strong>community</strong> to discuss topics with fellow students</li>
          <li>Complete your <strong>profile</strong> to let others know about you</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://mlscsvec.com/community" target="_blank" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Visit Community</a>
        </div>
        <p style="margin-top: 30px; font-weight: 500;">Best regards,<br><strong>MLSC Team</strong></p>
      </div>
    </div>`,
  };
}
