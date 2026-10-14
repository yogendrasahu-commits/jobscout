import nodemailer from 'nodemailer';

/**
 * Creates and returns an active email transporter.
 * Supports custom SMTP, Gmail App Passwords, or auto-fallback to Ethereal / simulated mode.
 */
export async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
  }

  // Fallback to simulated / logging mode
  return null;
}

/**
 * Sends a formal Job Offer Letter to the candidate's email.
 */
export async function sendOfferLetterEmail({
  candidateEmail,
  candidateName,
  employerName,
  companyName,
  jobTitle,
  salary,
  joiningDate,
  location,
  terms,
  refNo
}) {
  if (!candidateEmail || !candidateEmail.includes('@')) {
    return {
      success: false,
      error: 'Valid candidate email is required to send offer letter'
    };
  }

  const senderEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'offers@jobscout.io';
  const effectiveCompany = companyName || employerName || 'Hiring Enterprise';
  const effectiveRefNo = refNo || `OFFER-${Date.now().toString().slice(-6)}`;
  const effectiveJoiningDate = joiningDate || 'Immediate / Within 10 Days';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Formal Offer of Employment - ${effectiveCompany}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 24px; color: #334155; }
    .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); padding: 36px 32px; color: #ffffff; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 12px; }
    .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #1e293b; }
    .salutation { font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #0f172a; }
    .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; }
    .details-row:last-child { border-bottom: none; }
    .details-label { color: #64748b; font-size: 13px; font-weight: 600; }
    .details-value { color: #0f172a; font-size: 13px; font-weight: 700; text-align: right; }
    .highlight { color: #059669; font-weight: 800; font-size: 16px; }
    .terms-box { background: #f1f5f9; border-left: 4px solid #4f46e5; padding: 14px 18px; border-radius: 4px 8px 8px 4px; font-size: 12px; color: #475569; margin: 20px 0; line-height: 1.5; }
    .btn-container { text-align: center; margin: 32px 0 24px; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35); }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Official Offer Letter</span>
      <h1>${effectiveCompany}</h1>
      <p>Employment Offer & Appointment Confirmation</p>
    </div>

    <div class="content">
      <div class="salutation">Dear ${candidateName || 'Candidate'},</div>
      <p>
        Following your successful application and discussions via <strong>JobScout Live Platform</strong>, we are delighted to offer you the position of <strong>${jobTitle}</strong> at <strong>${effectiveCompany}</strong>!
      </p>

      <p>
        We were genuinely impressed with your skills and background and believe your contributions will be pivotal to our team's growth and success.
      </p>

      <div class="details-card">
        <div class="details-row">
          <span class="details-label">Reference ID:</span>
          <span class="details-value font-mono">${effectiveRefNo}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Designation:</span>
          <span class="details-value">${jobTitle}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Total Compensation (CTC):</span>
          <span class="details-value highlight">${salary}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Joining Date:</span>
          <span class="details-value">${effectiveJoiningDate}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Work Location / Hub:</span>
          <span class="details-value">${location || 'Mumbai BKC (Hybrid/Onsite)'}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Issuing Authority:</span>
          <span class="details-value">${employerName || effectiveCompany}</span>
        </div>
      </div>

      ${terms ? `
      <div class="terms-box">
        <strong>Terms & Conditions of Employment:</strong><br>
        ${String(terms).replace(/\n/g, '<br>')}
      </div>
      ` : ''}

      <p>
        Please log in to your <strong>JobScout Account</strong> to view the formal printable letterhead, download your PDF copy, and confirm your acceptance.
      </p>

      <div class="btn-container">
        <a href="https://jobscout.onrender.com" class="btn">View & Accept Offer in JobScout</a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
        Warm regards,<br>
        <strong>Talent Acquisition Team</strong><br>
        ${effectiveCompany}
      </p>
    </div>

    <div class="footer">
      This is an automated formal offer dispatch from JobScout on behalf of ${effectiveCompany}.<br>
      Reference: ${effectiveRefNo} • Sent to: ${candidateEmail}
    </div>
  </div>
</body>
</html>
  `;

  try {
    const transporter = await getTransporter();

    if (transporter) {
      const info = await transporter.sendMail({
        from: `"${effectiveCompany}" <${senderEmail}>`,
        to: candidateEmail,
        subject: `🎉 Job Offer Letter: ${jobTitle} at ${effectiveCompany}`,
        text: `Dear ${candidateName},\n\nCongratulations! You have received a formal offer for ${jobTitle} at ${effectiveCompany} with CTC of ${salary}.\nJoining Date: ${effectiveJoiningDate}.\nReference: ${effectiveRefNo}.\n\nPlease check your JobScout portal to review and accept the offer.`,
        html: htmlContent
      });

      console.log(`[EmailService] Offer letter email sent to ${candidateEmail}. MessageId: ${info.messageId}`);
      return {
        success: true,
        sentReal: true,
        messageId: info.messageId,
        candidateEmail
      };
    } else {
      // Realistic simulation mode (when no SMTP credentials are in .env yet)
      console.log(`[EmailService] Simulated Offer Letter Email dispatched successfully to: ${candidateEmail}`);
      console.log(`[EmailService] Subject: 🎉 Job Offer Letter: ${jobTitle} at ${effectiveCompany}`);
      return {
        success: true,
        sentReal: false,
        simulated: true,
        candidateEmail,
        message: `Offer letter email dispatched to ${candidateEmail} (Simulated mode active; copy available in candidate dashboard).`
      };
    }
  } catch (err) {
    console.error(`[EmailService] Failed to send email to ${candidateEmail}:`, err);
    return {
      success: false,
      error: err.message || 'Failed to dispatch email'
    };
  }
}
