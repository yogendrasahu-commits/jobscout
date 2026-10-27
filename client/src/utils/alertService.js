// WhatsApp & Telegram Instant Alerts Service for JobScout Client

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

export function generateWhatsAppUrl(phone, text) {
  const cleanPhone = formatWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(text || '');
  if (!cleanPhone) {
    return `https://wa.me/?text=${encodedText}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function generateTelegramUrl(text, url = 'https://jobscout.io') {
  const encodedText = encodeURIComponent(text || '');
  const encodedUrl = encodeURIComponent(url || '');
  return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
}

/**
 * Dispatches an automated alert via backend API
 */
export async function sendCandidateAlert({ token, candidatePhone, candidateName, jobTitle, type, details }) {
  const res = await fetch('/api/alerts/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      candidatePhone,
      candidateName,
      jobTitle,
      type,
      details
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to dispatch alert');
  return data;
}

/**
 * Sends a test notification to user's phone / telegram
 */
export async function sendTestAlert({ token, channel, phone, telegramChatId }) {
  const res = await fetch('/api/alerts/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      channel,
      phone,
      telegramChatId
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send test alert');
  return data;
}
