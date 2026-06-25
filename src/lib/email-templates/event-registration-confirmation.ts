export function eventRegistrationConfirmationTemplate(data: {
  customerName: string;
  eventTitle: string;
  amount: number;
  orderId: string;
  date: string;
  venue: string;
  time: string;
  eventLink?: string;
}): { subject: string; html: string } {
  return {
    subject: `Registration Confirmed: ${data.eventTitle} — MLSC SVEC`,
    html: `
    <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #34A853; height: 6px;"></div>
      <div style="padding: 30px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #34A853; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">MLSC SVEC</h1>
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin: 5px 0 0 0; font-weight: 700;">Official Event Registration</p>
        </div>
        
        <h2 style="color: #222; font-size: 18px; font-weight: 700; margin-top: 0;">Seat Confirmed, ${data.customerName}!</h2>
        <p style="font-size: 14px; color: #555;">
          Your registration for the upcoming event <strong style="color: #34A853;">${data.eventTitle}</strong> has been successfully verified.
          ${data.amount > 0 ? `We have received your registration payment of <strong style="color: #34A853;">₹${data.amount}</strong>.` : `This is a free entry registration.`}
        </p>

        <div style="margin: 25px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #f0f0f0;">
          <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 1px solid #eee; padding-bottom: 8px;">Event & Pass Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #777; font-weight: 500;">Event Title:</td>
              <td style="padding: 6px 0; text-align: right; color: #222; font-weight: 700;">${data.eventTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #777; font-weight: 500;">Date:</td>
              <td style="padding: 6px 0; text-align: right; color: #222; font-weight: 600;">${data.date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #777; font-weight: 500;">Time:</td>
              <td style="padding: 6px 0; text-align: right; color: #222; font-weight: 600;">${data.time}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #777; font-weight: 500;">Venue:</td>
              <td style="padding: 6px 0; text-align: right; color: #222; font-weight: 600;">${data.venue}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #777; font-weight: 500;">Ticket Reference:</td>
              <td style="padding: 6px 0; text-align: right; color: #222; font-family: monospace; font-weight: 700; font-size: 11px;">${data.orderId}</td>
            </tr>
            ${data.amount > 0 ? `
            <tr>
              <td style="padding: 6px 0; color: #777; font-weight: 500;">Fee Paid:</td>
              <td style="padding: 6px 0; text-align: right; color: #34A853; font-weight: 700;">₹${data.amount}.00</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <p style="font-size: 13px; color: #666; text-align: center; margin: 25px 0;">
          Please present this email or your Ticket Reference ID at the entry desk for scanning.
        </p>

        <div style="text-align: center; margin: 25px 0; padding: 20px; background-color: #fcfcfc; border-radius: 12px; border: 2px dashed #34A853; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
          <p style="margin: 0 0 12px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #34A853; font-weight: 800;">Digital Entrance Ticket</p>
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.orderId)}&margin=10&color=333333" 
            alt="QR Code Pass" 
            style="width: 150px; height: 150px; display: block; margin: auto; border: 1px solid #f0f0f0; border-radius: 8px; background-color: #ffffff;" 
          />
          <p style="margin: 12px 0 0 0; font-family: monospace; font-size: 13px; color: #111; font-weight: 700; letter-spacing: 0.5px;">${data.orderId}</p>
          <p style="margin: 6px 0 0 0; font-size: 10px; color: #666; font-weight: 500;">Present this QR code on your mobile device at the venue entrance desk for entry verification.</p>
        </div>

        ${data.eventLink ? `
        <div style="text-align: center; margin: 25px 0 15px 0; padding: 18px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #166534; font-weight: 600;">Important: Join the Event WhatsApp Group</p>
          <a href="${data.eventLink}" target="_blank" style="display: inline-block; background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border: none;">Join WhatsApp Group</a>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 25px 0 10px 0;">
          <a href="https://mlscsvec.in/events" target="_blank" style="display: inline-block; background-color: #34A853; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">View Event Details</a>
        </div>

        <p style="margin-top: 30px; font-size: 13px; color: #444; border-top: 1px solid #eee; padding-top: 20px;">
          Warm regards,<br>
          <strong>MLSC SVEC</strong><br>
          <span style="color: #888; font-size: 11px;">Admin</span>
        </p>
      </div>
    </div>`
  };
}
