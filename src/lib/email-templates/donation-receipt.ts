export function donationReceiptEmailTemplate(data: {
  customerName: string;
  amount: number;
  orderId: string;
  date: string;
  purpose?: string;
}): { subject: string; html: string } {
  const purposeText = data.purpose ? ` for "${data.purpose}"` : '';
  const subjectLine = data.purpose 
    ? `Payment Receipt - ${data.purpose} - MLSC SVEC`
    : 'Donation Receipt - Thank you for supporting MLSC SVEC';

  return {
    subject: subjectLine,
    html: `
    <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #7C3AED; height: 6px;"></div>
      <div style="padding: 30px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #7C3AED; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">MLSC SVEC</h1>
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin: 5px 0 0 0; font-weight: 700;">Community Fundraising Portal</p>
        </div>
        
        <h2 style="color: #222; font-size: 18px; font-weight: 700; margin-top: 0;">Thank you, ${data.customerName}!</h2>
        <p style="font-size: 14px; color: #555;">
          We have successfully received your contribution/payment of <strong style="color: #7C3AED; font-size: 16px;">₹${data.amount}</strong>${purposeText} to the Microsoft Learn Student Chapter SVEC. Your support directly helps us fund cloud server hosting, hands-on hardware workshop kits, and prizes for student hackathons.
        </p>

        <div style="margin: 25px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #f0f0f0;">
          <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 1px solid #eee; padding-bottom: 8px;">Transaction Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #777; font-weight: 500;">Receipt Number:</td>
              <td style="padding: 6px 0; text-align: right; color: #222; font-family: monospace; font-weight: 700;">${data.orderId}</td>
            </tr>
            ${data.purpose ? `
            <tr>
              <td style="padding: 6px 0; color: #777; font-weight: 500;">Purpose:</td>
              <td style="padding: 6px 0; text-align: right; color: #222; font-weight: 700; text-transform: uppercase; font-size: 11px; tracking-wide: 0.5px;">${data.purpose}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 6px 0; color: #777; font-weight: 500;">Amount Received:</td>
              <td style="padding: 6px 0; text-align: right; color: #7C3AED; font-weight: 700; font-size: 14px;">₹${data.amount}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #777; font-weight: 500;">Date:</td>
              <td style="padding: 6px 0; text-align: right; color: #222; font-weight: 600;">${data.date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #777; font-weight: 500;">Payment Gateway:</td>
              <td style="padding: 6px 0; text-align: right; color: #222; font-weight: 600;">Cashfree PG</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #777; font-weight: 500;">Status:</td>
              <td style="padding: 6px 0; text-align: right; color: #10B981; font-weight: 700; text-transform: uppercase;">Successful</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #666; text-align: center; margin: 25px 0;">
          As a supporter, you are featured on our website's supporters ledger. Thank you for empowering student developers!
        </p>

        <div style="text-align: center; margin: 25px 0 10px 0;">
          <a href="https://mlscsvec.com/study" target="_blank" style="display: inline-block; background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Explore Roadmaps</a>
        </div>

        <p style="margin-top: 30px; font-size: 13px; color: #444; border-t: 1px solid #eee; padding-top: 20px;">
          Warm regards,<br>
          <strong>MLSC SVEC</strong><br>
          <span style="color: #888; font-size: 11px;">Admin</span>
        </p>
      </div>
    </div>`,
  };
}
