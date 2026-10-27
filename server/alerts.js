// WhatsApp & Telegram Instant Alerts Service for JobScout
// Supports direct deep-links, webhooks, Telegram Bot API, and real-time Socket.IO dispatch.

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
 * Sends a Telegram message using official Telegram Bot API (if BOT_TOKEN & CHAT_ID configured)
 * Falls back safely to simulation mode without failing.
 */
export async function sendTelegramBotMessage({ botToken, chatId, message, parseMode = 'Markdown' }) {
  const token = (botToken || process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const chat = (chatId || process.env.TELEGRAM_CHAT_ID || '').trim();

  if (!token || !chat) {
    console.log('[TelegramService] Telegram Bot not configured. Simulated dispatch:', message.slice(0, 80));
    return {
      success: true,
      simulated: true,
      channel: 'telegram',
      message: 'Telegram alert generated in simulated mode'
    };
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: message,
        parse_mode: parseMode
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.description || 'Telegram API returned error');
    }

    console.log('[TelegramService] Telegram Bot alert delivered to chat:', chat);
    return {
      success: true,
      simulated: false,
      messageId: data.result?.message_id,
      channel: 'telegram'
    };
  } catch (err) {
    console.warn('[TelegramService] Telegram delivery failed:', err.message);
    return {
      success: false,
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
  type, // 'interview_invite' | 'offer_issued' | 'status_update' | 'custom'
  details = {},
  io
}) {
  const safeName = candidateName || 'Candidate';
  const safeCompany = employerName || 'Hiring Team';
  const safeTitle = jobTitle || 'Position';

  let alertText = '';
  let whatsappHeadline = '';

  switch (type) {
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

  // Attempt background Telegram Bot delivery if configured
  const telegramResult = await sendTelegramBotMessage({
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: details.telegramChatId || process.env.TELEGRAM_CHAT_ID,
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
    telegramResult
  };
}
