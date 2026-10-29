// WhatsApp & Telegram Instant Alerts Service for JobScout
// Supports direct deep-links, automated server-side Meta/Twilio/Telegram bot dispatch, and real-time Socket.IO events.

import { db } from './db.js';

/**
 * Sanitizes phone numbers into clean international E.164 format (without + for wa.me)
 * Defaults Indian 10-digit numbers to +91 country code.
 */
export function formatWhatsAppPhone(rawPhone) {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Generates an instant WhatsApp Click-to-Chat URL
 */
export function generateWhatsAppUrl(phone, text) {
  const cleanPhone = formatWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(text || '');
  if (!cleanPhone) {
    return `https://wa.me/?text=${encodedText}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Generates an instant Telegram Share/Chat link
 */
export function generateTelegramUrl(text, url = 'https://jobscout.io') {
  const encodedText = encodeURIComponent(text || '');
  const encodedUrl = encodeURIComponent(url || '');
  return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
}

/**
 * Sends automated server-side message to WhatsApp via Meta Cloud API, Twilio, or Gateway Webhook.
 */
export async function sendWhatsAppAutomatedMessage({ phone, message }) {
  const cleanPhone = formatWhatsAppPhone(phone);
  if (!cleanPhone) {
    return { success: false, reason: 'INVALID_PHONE', error: 'Invalid phone number format' };
  }

  const alertConfig = db.getAlertConfig ? db.getAlertConfig() : {};

  // 1. Meta / WhatsApp Cloud API (Official)
  const metaToken = (alertConfig.whatsappToken || process.env.WHATSAPP_TOKEN || '').trim();
  const phoneId = (alertConfig.whatsappPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();

  if (metaToken && phoneId) {
    try {
      const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { preview_url: true, body: message }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Meta Cloud API error');
      }

      console.log('[WhatsAppService] Meta Cloud API delivered message to:', cleanPhone);
      return {
        success: true,
        delivered: true,
        provider: 'meta_cloud',
        messageId: data.messages?.[0]?.id
      };
    } catch (err) {
      console.warn('[WhatsAppService] Meta Cloud delivery failed:', err.message);
    }
  }

  // 2. Twilio WhatsApp API
  const twilioSid = (alertConfig.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID || '').trim();
  const twilioToken = (alertConfig.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN || '').trim();
  const twilioFrom = (alertConfig.twilioFromNumber || process.env.TWILIO_WHATSAPP_NUMBER || '').trim();

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const params = new URLSearchParams();
      params.append('From', twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`);
      params.append('To', `whatsapp:+${cleanPhone}`);
      params.append('Body', message);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ` + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Twilio WhatsApp error');

      console.log('[WhatsAppService] Twilio WhatsApp delivered to:', cleanPhone);
      return {
        success: true,
        delivered: true,
        provider: 'twilio',
        messageId: data.sid
      };
    } catch (err) {
      console.warn('[WhatsAppService] Twilio WhatsApp failed:', err.message);
    }
  }

  // 3. Custom Gateway / UltraMsg / Webhook
  const gatewayUrl = (alertConfig.gatewayUrl || process.env.WHATSAPP_GATEWAY_URL || '').trim();
  const gatewayToken = (alertConfig.gatewayToken || process.env.WHATSAPP_GATEWAY_TOKEN || '').trim();

  if (gatewayUrl) {
    try {
      const res = await fetch(gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(gatewayToken ? { 'Authorization': `Bearer ${gatewayToken}` } : {})
        },
        body: JSON.stringify({
          to: cleanPhone,
          phone: cleanPhone,
          message,
          token: gatewayToken
        })
      });

      const data = await res.json();
      console.log('[WhatsAppService] Gateway webhook delivered to:', cleanPhone);
      return {
        success: true,
        delivered: true,
        provider: 'gateway',
        data
      };
    } catch (err) {
      console.warn('[WhatsAppService] Custom gateway failed:', err.message);
    }
  }

  return {
    success: false,
    delivered: false,
    reason: 'NO_GATEWAY_CONFIGURED',
    message: 'No server-side WhatsApp gateway credentials configured. Generated direct Click-to-Chat card.'
  };
}

/**
 * Sends a Telegram message using official Telegram Bot API (if BOT_TOKEN & CHAT_ID configured)
 * Supports user-level bot token or system-wide alertConfig bot token.
 */
export async function sendTelegramBotMessage({ botToken, chatId, message, parseMode = 'Markdown' }) {
  const alertConfig = db.getAlertConfig ? db.getAlertConfig() : {};
  const token = (botToken || alertConfig.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const rawChat = (chatId || alertConfig.telegramDefaultChatId || process.env.TELEGRAM_CHAT_ID || '').trim();

  if (!token || !rawChat) {
    console.log('[TelegramService] Telegram Bot not configured. Simulated dispatch:', message.slice(0, 80));
    return {
      success: false,
      delivered: false,
      reason: 'MISSING_CREDENTIALS',
      message: 'Telegram Bot Token or Chat ID not configured'
    };
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: rawChat,
        text: message,
        parse_mode: parseMode
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.description || 'Telegram API returned error');
    }

    console.log('[TelegramService] Telegram Bot alert delivered to chat:', rawChat);
    return {
      success: true,
      delivered: true,
      messageId: data.result?.message_id,
      channel: 'telegram'
    };
  } catch (err) {
    console.warn('[TelegramService] Telegram delivery failed:', err.message);
    return {
      success: false,
      delivered: false,
      error: err.message,
      channel: 'telegram'
    };
  }
}

/**
 * Dispatches an automated multi-channel alert (WhatsApp + Telegram + In-App Socket.IO)
 */
export async function dispatchCandidateAlert({
  candidatePhone,
  candidateName,
  employerName,
  jobTitle,
  type, // 'application_submitted' | 'interview_invite' | 'offer_issued' | 'status_update' | 'custom'
  details = {},
  io
}) {
  const safeName = candidateName || 'Candidate';
  const safeCompany = employerName || 'Hiring Team';
  const safeTitle = jobTitle || 'Position';

  let alertText = '';
  let whatsappHeadline = '';

  switch (type) {
    case 'application_submitted': {
      whatsappHeadline = '📋 Job Application Submitted!';
      alertText = `*JobScout Application Received*\n\n` +
        `Hello *${safeName}*,\n\n` +
        `Your application for *${safeTitle}* at *${safeCompany}* has been successfully recorded!\n\n` +
        `🏢 *Company:* ${safeCompany}\n` +
        `💼 *Role:* ${safeTitle}\n` +
        `📄 *Application ID:* ${details.applicationId || 'JS-' + Date.now().toString().slice(-6)}\n` +
        `📅 *Date:* ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\n` +
        `You will receive instant notifications here as soon as the hiring team reviews your CV or schedules an interview.\n\n` +
        `👉 View Application: https://jobscout.io/applications\n\n` +
        `— *JobScout FastTrack Careers*`;
      break;
    }

    case 'offer_issued': {
      const salary = details.salary || 'Competitive CTC';
      const refNo = details.refNo || 'JS-OFFER';
      whatsappHeadline = '🎉 Formal Job Offer Letter Dispatched!';
      alertText = `*JobScout Official Job Offer*\n\n` +
        `Dear *${safeName}*,\n\n` +
        `Congratulations! *${safeCompany}* has officially issued your formal Job Offer Letter for the position of *${safeTitle}*.\n\n` +
        `💼 *Compensation:* ${salary}\n` +
        `📄 *Reference ID:* ${refNo}\n` +
        `📅 *Joining Date:* ${details.joiningDate || 'Immediate'}\n\n` +
        `Please log into your JobScout account to review your stamped letterhead, download the official PDF, and confirm acceptance:\n` +
        `👉 https://jobscout.io/offers\n\n` +
        `— *${safeCompany} Talent Team*`;
      break;
    }

    case 'interview_invite': {
      whatsappHeadline = '📅 Instant Video Interview Scheduled!';
      alertText = `*JobScout Interview Invitation*\n\n` +
        `Hello *${safeName}*,\n\n` +
        `*${safeCompany}* has shortlisted your profile and requested a direct Video/Voice Interview for *${safeTitle}*!\n\n` +
        `⏰ *Time:* ${details.time || 'Available Now / At mutually agreed time'}\n` +
        `🔗 *Join Speed-Connect Call:* https://jobscout.io/connect\n\n` +
        `Please be ready with your camera/microphone.\n` +
        `— *${safeCompany} Hiring Team*`;
      break;
    }

    case 'status_update': {
      const statusLabel = details.status === 'reviewed' ? 'Profile Reviewed'
        : details.status === 'interview' ? 'Interview Round'
        : details.status === 'hired' ? 'Officially Hired!'
        : details.status;
      whatsappHeadline = `📢 Application Update: ${statusLabel}`;
      alertText = `*JobScout Application Status Update*\n\n` +
        `Hi *${safeName}*,\n\n` +
        `Your application for *${safeTitle}* at *${safeCompany}* has advanced to: *${statusLabel}*.\n\n` +
        `Check real-time timeline & recruiter messages:\n` +
        `👉 https://jobscout.io/applications\n\n` +
        `— *JobScout Live Notifications*`;
      break;
    }

    default: {
      whatsappHeadline = '🔔 New Notification from Recruiter';
      alertText = `*JobScout Notification*\n\n` +
        `Hello *${safeName}*,\n\n` +
        `${details.message || `You have a new update regarding your application for ${safeTitle} from ${safeCompany}.`}\n\n` +
        `👉 https://jobscout.io\n` +
        `— *${safeCompany}*`;
    }
  }

  const cleanPhone = formatWhatsAppPhone(candidatePhone);
  const waUrl = generateWhatsAppUrl(cleanPhone, alertText);
  const tgUrl = generateTelegramUrl(alertText);

  // 1. Attempt Automated WhatsApp background dispatch (Meta / Twilio / Gateway)
  const whatsappAutomated = await sendWhatsAppAutomatedMessage({
    phone: cleanPhone,
    message: alertText
  });

  // 2. Attempt Automated Telegram Bot delivery
  const telegramAutomated = await sendTelegramBotMessage({
    chatId: details.telegramChatId,
    message: alertText
  });

  const alertRecord = {
    id: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type,
    headline: whatsappHeadline,
    candidateName: safeName,
    candidatePhone: cleanPhone,
    employerName: safeCompany,
    jobTitle: safeTitle,
    whatsappUrl: waUrl,
    telegramUrl: tgUrl,
    messageText: alertText,
    whatsappAutomated,
    telegramAutomated,
    autoDelivered: Boolean(whatsappAutomated?.delivered || telegramAutomated?.delivered),
    sentAt: new Date().toISOString()
  };

  // Broadcast real-time event to active user sessions
  if (io) {
    io.emit('alert:received', alertRecord);
  }

  return {
    success: true,
    alertRecord,
    whatsappUrl: waUrl,
    telegramUrl: tgUrl,
    whatsappAutomated,
    telegramAutomated,
    autoDelivered: Boolean(whatsappAutomated?.delivered || telegramAutomated?.delivered)
  };
}
