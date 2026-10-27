import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from './auth.js';
import { db } from '../db.js';
import { 
  formatWhatsAppPhone,
  generateWhatsAppUrl, 
  generateTelegramUrl, 
  sendTelegramBotMessage, 
  dispatchCandidateAlert 
} from '../alerts.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jobscout_super_secret_jwt_key_2024';

// Optional Authentication Middleware
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) req.user = user;
    next();
  });
};

// 1. Generate instant WhatsApp Click-to-Chat Link & Dispatch
router.post('/whatsapp', optionalAuth, (req, res) => {
  try {
    const { phone, text, type, candidateName, jobTitle } = req.body;
    if (!text && !type) {
      return res.status(400).json({ error: 'Text or notification type is required' });
    }

    const message = text || `Hello from ${req.user?.companyName || req.user?.name || 'JobScout Recruiter'} regarding JobScout!`;
    const cleanPhone = formatWhatsAppPhone(phone);
    const waUrl = generateWhatsAppUrl(phone, message);

    res.json({
      success: true,
      whatsappUrl: waUrl,
      phone: cleanPhone,
      message
    });
  } catch (err) {
    console.error('Error creating WhatsApp link:', err);
    res.status(500).json({ error: 'Failed to generate WhatsApp alert' });
  }
});

// 2. Generate Telegram notification or dispatch via Bot
router.post('/telegram', optionalAuth, async (req, res) => {
  try {
    const { text, url, chatId } = req.body;
    const message = text || 'JobScout notification update';
    const tgUrl = generateTelegramUrl(message, url);

    let botResult = null;
    if (chatId) {
      botResult = await sendTelegramBotMessage({
        chatId,
        message
      });
    }

    res.json({
      success: true,
      telegramUrl: tgUrl,
      botResult
    });
  } catch (err) {
    console.error('Error processing Telegram alert:', err);
    res.status(500).json({ error: 'Failed to process Telegram alert' });
  }
});

// 3. Dispatch automated candidate notification (Offer / Interview / Status)
router.post('/send', optionalAuth, async (req, res) => {
  try {
    const { 
      candidatePhone, 
      candidateName, 
      jobTitle, 
      type, 
      details,
      recipient,
      data 
    } = req.body;

    const targetType = type || data?.type;
    if (!targetType) {
      return res.status(400).json({ error: 'Alert type is required (e.g. offer_issued, interview_invite, status_update)' });
    }

    const targetPhone = candidatePhone || recipient?.phone;
    const targetName = candidateName || recipient?.name || data?.candidateName;
    const targetJob = jobTitle || data?.jobTitle;
    const alertDetails = details || data || {};
    const employerName = req.user?.companyName || req.user?.name || data?.companyName || 'JobScout Employer';

    const result = await dispatchCandidateAlert({
      candidatePhone: targetPhone,
      candidateName: targetName,
      employerName,
      jobTitle: targetJob,
      type: targetType,
      details: alertDetails,
      io: req.io
    });

    res.json(result);
  } catch (err) {
    console.error('Error dispatching candidate alert:', err);
    res.status(500).json({ error: 'Failed to dispatch alert' });
  }
});

// 4. Send test alert to current user's phone / telegram
router.post('/test', optionalAuth, async (req, res) => {
  try {
    const { channel, phone, target, telegramChatId } = req.body;
    const targetPhone = phone || target || req.user?.phone || '9876543210';
    const candidateName = req.user?.name || 'JobScout User';

    const testText = `✅ *JobScout Live Notification Test*\n\n` +
      `Hello *${candidateName}*! Your mobile messaging alerts for WhatsApp & Telegram are successfully active.\n\n` +
      `You will receive instant pings whenever:\n` +
      `• An employer invites you to an interview\n` +
      `• An official offer letter is issued\n` +
      `• Your application status updates\n\n` +
      `👉 https://jobscout.io\n` +
      `— *JobScout Notification System*`;

    const waUrl = generateWhatsAppUrl(targetPhone, testText);
    const tgUrl = generateTelegramUrl(testText);

    let botResult = null;
    const targetChat = telegramChatId || (channel === 'telegram' ? target : null);
    if (channel === 'telegram' && targetChat) {
      botResult = await sendTelegramBotMessage({
        chatId: targetChat,
        message: testText
      });
    }

    res.json({
      success: true,
      message: `Test alert successfully prepared for ${channel || 'WhatsApp & Telegram'}!`,
      previewUrl: channel === 'telegram' ? tgUrl : waUrl,
      whatsappUrl: waUrl,
      telegramUrl: tgUrl,
      channel,
      target: targetPhone,
      botResult
    });
  } catch (err) {
    console.error('Error sending test alert:', err);
    res.status(500).json({ error: 'Failed to send test alert' });
  }
});

// 5. Get Alert Preferences for Current User
router.get('/settings', optionalAuth, (req, res) => {
  try {
    const user = req.user ? db.findUserById(req.user.id) : null;
    const prefs = user?.notificationPrefs || {
      whatsappEnabled: true,
      telegramEnabled: false,
      whatsappPhone: user?.phone || '',
      phone: user?.phone || '',
      telegramChatId: '',
      notifyOnOffer: true,
      notifyOnInterview: true,
      notifyOnApplication: true
    };
    res.json({ 
      success: true, 
      settings: prefs, 
      preferences: prefs 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alert settings' });
  }
});

// 6. Update Alert Preferences for Current User
router.put('/settings', optionalAuth, (req, res) => {
  try {
    const {
      whatsappEnabled,
      telegramEnabled,
      whatsappPhone,
      phone,
      telegramChatId,
      notifyOnOffer,
      notifyOnInterview,
      notifyOnApplication
    } = req.body;

    const targetPhone = (phone || whatsappPhone || '').toString().trim();
    const updatedPrefs = {
      whatsappEnabled: whatsappEnabled !== false,
      telegramEnabled: Boolean(telegramEnabled),
      whatsappPhone: targetPhone,
      phone: targetPhone,
      telegramChatId: (telegramChatId && String(telegramChatId).trim()) || '',
      notifyOnOffer: notifyOnOffer !== false,
      notifyOnInterview: notifyOnInterview !== false,
      notifyOnApplication: notifyOnApplication !== false
    };

    if (req.user) {
      const user = db.findUserById(req.user.id);
      if (user) {
        user.notificationPrefs = updatedPrefs;
        db.save();
      }
    }

    res.json({ 
      success: true, 
      settings: updatedPrefs, 
      preferences: updatedPrefs 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update alert settings' });
  }
});

export default router;