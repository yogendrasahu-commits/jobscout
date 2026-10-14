import nodemailer from 'nodemailer';
import { db } from './db.js';

/**
 * Creates and returns an active email transporter.
 * Supports custom SMTP, Gmail App Passwords, or auto-fallback to simulated mode.
 */
export async function getTransporter() {
  const dbConfig = db.getEmailConfig ? db.getEmailConfig() : {};

  // Custom SMTP takes precedence if all fields exist
  const host = (dbConfig.smtpHost || process.env.SMTP_HOST || '').trim();
  const port = Number(dbConfig.smtpPort || process.env.SMTP_PORT) || 587;
  const smtpUser = (dbConfig.smtpUser || process.env.SMTP_USER || '').trim();
  const smtpPass = (dbConfig.smtpPass || process.env.SMTP_PASS || '').trim();

  if (host && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: smtpUser, pass: smtpPass }
    });
  }

  // Gmail App Password
  const rawGmailUser = (dbConfig.gmailUser || process.env.GMAIL_USER || '').trim();
  const rawGmailPass = (dbConfig.gmailPass || process.env.GMAIL_PASS || '').replace(/\s+/g, '');

  if (rawGmailUser && rawGmailPass) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: rawGmailUser,
        pass: rawGmailPass
      }
    });
  }

  // Fallback to simulated / logging mode
  return null;
}

/**
 * Verifies email credentials by pinging the SMTP server
 */
export async function verifyEmailConfig(config) {
  let transporter;
  const host = (config.smtpHost || '').trim();
  const port = Number(config.smtpPort) || 587;
  const smtpUser = (config.smtpUser || '').trim();
  const smtpPass = (config.smtpPass || '').trim();

  const gmailUser = (config.gmailUser || '').trim();
  const gmailPass = (config.gmailPass || '').replace(/\s+/g, '');

  if (host && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: smtpUser, pass: smtpPass }
    });
  } else if (gmailUser && gmailPass) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass }
    });
  } else {
    throw new Error('Please provide either Gmail User & App Password, or full SMTP host credentials');
  }

  // Test connection
  await transporter.verify();
  return true;
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

  const dbConfig = db.getEmailConfig ? db.getEmailConfig() : {};
  const senderEmail = (dbConfig.emailFrom || process.env.EMAIL_FROM || dbConfig.gmailUser || process.env.GMAIL_USER || dbConfig.smtpUser || process.env.SMTP_USER || 'offers@jobscout.io').trim();
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
    .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2); position: relative; }
    .watermark { position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 54px; font-weight: 900; color: rgba(15, 23, 42, 0.05); text-transform: uppercase; letter-spacing: 4px; pointer-events: none; z-index: 1; text-align: center; width: 100%; white-space: nowrap; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); padding: 36px 32px; color: #ffffff; text-align: center; position: relative; z-index: 2; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 12px; }
    .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #1e293b; position: relative; z-index: 2; }
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
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; position: relative; z-index: 2; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Company Name Watermark in Email -->
    <div class="watermark">${effectiveCompany}</div>

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
          <span class="details-label">Company Name:</span>
          <span class="details-value">${effectiveCompany}</span>
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
        Please log in to your <strong>JobScout Account</strong> to view the formal printable letterhead (with Company Watermark), download your signed PDF copy, and confirm your acceptance.
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
      const fromHeader = senderEmail.includes('<') ? senderEmail : `"${effectiveCompany}" <${senderEmail}>`;
      const info = await transporter.sendMail({
        from: fromHeader,
        to: candidateEmail,
        subject: `🎉 Job Offer Letter: ${jobTitle} at ${effectiveCompany}`,
        text: `Dear ${candidateName},\n\nCongratulations! You have received a formal offer for ${jobTitle} at ${effectiveCompany} with CTC of ${salary}.\nJoining Date: ${effectiveJoiningDate}.\nReference: ${effectiveRefNo}.\n\nPlease check your JobScout portal to review, view printable letterhead with ${effectiveCompany} watermark, and accept the offer.`,
        html: htmlContent,
        attachments: [
          {
            filename: `Offer_Letter_${effectiveRefNo}.html`,
            content: htmlContent,
            contentType: 'text/html'
          }
        ]
      });

      console.log(`[EmailService] REAL offer letter email sent to ${candidateEmail}. MessageId: ${info.messageId}`);
      return {
        success: true,
        sentReal: true,
        messageId: info.messageId,
        candidateEmail,
        message: `Official Offer Letter successfully delivered to ${candidateEmail} inbox!`
      };
    } else {
      // Simulation mode
      console.log(`[EmailService] Simulated Offer Letter Email dispatched to: ${candidateEmail}`);
      console.log(`[EmailService] Note: To send real email to candidate Gmail, configure Gmail User & App Password in Email Settings.`);
      return {
        success: true,
        sentReal: false,
        simulated: true,
        candidateEmail,
        message: `Offer letter issued in portal! To deliver directly to recipient's Gmail inbox, connect your Gmail App Password in Email Settings.`
      };
    }
  } catch (err) {
    console.error(`[EmailService] Failed to send email to ${candidateEmail}:`, err);
    return {
      success: false,
      sentReal: false,
      error: `Email sending failed: ${err.message}`
    };
  }
}

/**
 * Sends notification to employer when candidate accepts the offer letter.
 */
export async function sendOfferAcceptedEmail({
  employerEmail,
  employerName,
  companyName,
  candidateName,
  candidateEmail,
  jobTitle,
  salary,
  joiningDate,
  refNo
}) {
  if (!employerEmail || !employerEmail.includes('@')) return { success: false };

  const dbConfig = db.getEmailConfig ? db.getEmailConfig() : {};
  const senderEmail = (dbConfig.emailFrom || process.env.EMAIL_FROM || dbConfig.gmailUser || process.env.GMAIL_USER || dbConfig.smtpUser || process.env.SMTP_USER || 'offers@jobscout.io').trim();
  const effectiveCompany = companyName || employerName || 'Hiring Enterprise';
  const effectiveRefNo = refNo || `OFFER-${Date.now().toString().slice(-6)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Offer Accepted - ${candidateName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 24px; color: #334155; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2); }
    .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px; color: #ffffff; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
    .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #1e293b; }
    .card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .btn { display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤝 Offer Accepted!</h1>
      <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Candidate has formally accepted your Job Offer</p>
    </div>
    <div class="content">
      <p>Dear <strong>${employerName || effectiveCompany}</strong>,</p>
      <p>Great news! <strong>${candidateName}</strong> has officially accepted your offer letter for the position of <strong>${jobTitle}</strong> at <strong>${effectiveCompany}</strong>.</p>
      
      <div class="card">
        <div class="row"><span>Candidate:</span><strong>${candidateName} (${candidateEmail})</strong></div>
        <div class="row"><span>Position:</span><strong>${jobTitle}</strong></div>
        <div class="row"><span>Offered CTC:</span><strong>${salary}</strong></div>
        <div class="row"><span>Joining Date:</span><strong>${joiningDate || 'Immediate'}</strong></div>
        <div class="row"><span>Offer Reference:</span><strong style="font-family: monospace;">${effectiveRefNo}</strong></div>
        <div class="row"><span>Status:</span><strong style="color: #059669;">Officially Hired (स्वीकृत)</strong></div>
      </div>

      <div style="text-align: center;">
        <a href="https://jobscout.onrender.com" class="btn">View Candidate in JobScout Dashboard</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const transporter = await getTransporter();
    if (transporter) {
      const fromHeader = senderEmail.includes('<') ? senderEmail : `"${effectiveCompany}" <${senderEmail}>`;
      await transporter.sendMail({
        from: fromHeader,
        to: employerEmail,
        subject: `🤝 Offer Accepted: ${candidateName} has accepted offer for ${jobTitle} at ${effectiveCompany}`,
        text: `Congratulations! ${candidateName} has accepted your job offer for ${jobTitle} at ${effectiveCompany}.\nReference: ${effectiveRefNo}`,
        html
      });
      console.log(`[EmailService] Offer accepted email sent to employer: ${employerEmail}`);
      return { success: true, sentReal: true };
    }
  } catch (err) {
    console.warn(`[EmailService] Failed to send offer accepted email:`, err);
  }
  return { success: true, sentReal: false };
}

