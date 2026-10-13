import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jobradar_secret_jwt_key_2026';

// In-memory OTP storage: phone (last 10 digits) -> { otp, expiresAt }
const otpStore = new Map();

// Helper to clean phone number to last 10 digits
function cleanPhone(phone) {
  if (!phone) return '';
  return String(phone).replace(/[^0-9]/g, '').slice(-10);
}

// Helper to validate Indian mobile number (10 digits starting with 6-9)
function isValidIndianPhone(cleaned) {
  return /^[6-9]\d{9}$/.test(cleaned);
}

// Helper to validate coordinates within India bounds
function sanitizeCoords(lat, lng) {
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (Number.isFinite(nLat) && Number.isFinite(nLng) && nLat >= 6 && nLat <= 38 && nLng >= 68 && nLng <= 98) {
    return { lat: nLat, lng: nLng };
  }
  return { lat: 19.0760, lng: 72.8777 };
}

// Middleware to authenticate JWT
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// -------------------------------------------------------------
// OTP ROUTES (Phone Number Login & Signup)
// -------------------------------------------------------------

// 0. Check Phone Number Registration Status
router.get('/check-phone/:phone', (req, res) => {
  const cleaned = cleanPhone(req.params.phone);
  if (!isValidIndianPhone(cleaned)) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)' });
  }

  const existing = db.findUserByPhone(cleaned);
  if (existing) {
    return res.json({
      exists: true,
      role: existing.role, // 'emp' or 'seeker'
      name: existing.name,
      phone: existing.phone,
      companyName: existing.companyName,
      title: existing.title,
      message: `यह नंबर पहले से ${existing.role === 'emp' ? 'Employer' : 'Job Seeker'} के रूप में रजिस्टर्ड है`
    });
  }

  res.json({ exists: false });
});

// 1. Send OTP to Phone Number
router.post('/send-otp', (req, res) => {
  const { phone, purpose } = req.body; // purpose: 'login' | 'register'
  const cleaned = cleanPhone(phone);

  if (!isValidIndianPhone(cleaned)) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)' });
  }

  // Strict Rule: One phone number = Exactly ONE user (either emp or seeker)
  // If user is trying to REGISTER, check if number is ALREADY registered
  if (purpose === 'register') {
    const existing = db.findUserByPhone(cleaned);
    if (existing) {
      const roleText = existing.role === 'emp' ? 'Employer (कंपनी/नियोक्ता)' : 'Job Seeker (उम्मीदवार)';
      return res.status(400).json({
        error: `यह मोबाइल नंबर पहले से ही ${roleText} के रूप में रजिस्टर्ड है। एक नंबर से केवल एक ही खाता बन सकता है। कृपया लॉगिन करें।`,
        isAlreadyRegistered: true,
        existingRole: existing.role,
        existingName: existing.name
      });
    }
  }

  // Generate a realistic 6-digit OTP (e.g. 123456 or random)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  otpStore.set(cleaned, { otp: code, expiresAt });

  console.log(`[SMS Gateway Simulated] OTP sent to +91-${cleaned} (purpose: ${purpose || 'login'}): ${code}`);

  // Returns code in response so user/tester can see it right away!
  res.json({
    success: true,
    message: `OTP sent to +91 ${cleaned}`,
    phone: cleaned,
    otp: code // Returned for instant testing and demonstration
  });
});

// 2. Verify OTP
router.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  const cleaned = cleanPhone(phone);

  if (!cleaned || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  // Allow fixed master test OTP '123456' or generated OTP
  const record = otpStore.get(cleaned);
  const isValid = (otp === '123456') || (record && record.otp === otp && Date.now() < record.expiresAt);

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid or expired OTP. Please try again or use 123456' });
  }

  res.json({ success: true, verified: true, message: 'OTP verified successfully' });
});

// 3. Login with Phone & OTP
router.post('/login-phone-otp', (req, res) => {
  const { phone, otp } = req.body;
  const cleaned = cleanPhone(phone);

  if (!cleaned || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  const record = otpStore.get(cleaned);
  const isValid = (otp === '123456') || (record && record.otp === otp && Date.now() < record.expiresAt);

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  // Find user by phone number
  const user = db.findUserByPhone(cleaned);
  if (!user) {
    // Verified, but needs to complete registration
    return res.json({
      isNewUser: true,
      phone: cleaned,
      message: 'Phone verified! Please complete your registration.'
    });
  }

  // Existing user - log in
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser, isNewUser: false });
});

// 4. Login with Phone & Password
router.post('/login-phone-password', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const cleaned = cleanPhone(phone);

    if (!cleaned || !password) {
      return res.status(400).json({ error: 'Mobile number and password required' });
    }

    const user = db.findUserByPhone(cleaned);
    if (!user) {
      return res.status(401).json({ error: 'No account found with this phone number. Please register.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Phone login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Signup / Register with Phone Number, Verified OTP & Password
router.post('/register-phone', async (req, res) => {
  try {
    const { 
      phone, otp, password, name, role, 
      companyName, industry, companySize, website, hiringType,
      title, skills, experience, expectedSalary, availability, vehicle, bio,
      lat, lng, address 
    } = req.body;
    const cleaned = cleanPhone(phone);

    if (!isValidIndianPhone(cleaned)) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit Indian mobile number' });
    }
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    if (!['emp', 'seeker'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either emp (Employer) or seeker (Job Seeker)' });
    }

    // Verify OTP
    const record = otpStore.get(cleaned);
    const isOtpValid = (otp === '123456') || (record && record.otp === otp && Date.now() < record.expiresAt);
    if (!isOtpValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Check if phone already registered (Strict Rule: One number = exactly one user)
    const existing = db.findUserByPhone(cleaned);
    if (existing) {
      const roleText = existing.role === 'emp' ? 'Employer (कंपनी/नियोक्ता)' : 'Job Seeker (उम्मीदवार)';
      return res.status(400).json({ 
        error: `यह मोबाइल नंबर पहले से ही ${roleText} के रूप में पंजीकृत है। एक नंबर से केवल एक ही खाता बन सकता है। कृपया साइन इन करें।`,
        isAlreadyRegistered: true,
        existingRole: existing.role
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const trimmedName = String(name).trim();
    const coords = sanitizeCoords(lat, lng);

    const newUser = db.createUser({
      name: trimmedName,
      phone: `+91 ${cleaned}`,
      email: `${cleaned}@user.jobradar.io`,
      password: passwordHash,
      role, // 'emp' or 'seeker'
      
      // Employer-specific fields
      companyName: role === 'emp' ? (companyName ? String(companyName).trim() : trimmedName) : '',
      industry: role === 'emp' ? (industry || 'General') : '',
      companySize: role === 'emp' ? (companySize || '1-10 Employees') : '',
      website: role === 'emp' ? (website || '') : '',
      hiringType: role === 'emp' ? (hiringType || 'Full-time') : '',

      // Seeker-specific fields
      title: role === 'seeker' ? (title ? String(title).trim() : 'Job Seeker') : '',
      skills: Array.isArray(skills) ? skills.filter(Boolean) : (skills ? String(skills).split(',').map(s => s.trim()).filter(Boolean) : []),
      experience: role === 'seeker' ? (experience || 'Fresher') : '',
      expectedSalary: role === 'seeker' ? (expectedSalary || 'Negotiable') : '',
      availability: role === 'seeker' ? (availability || 'Immediate') : '',
      vehicle: role === 'seeker' ? Boolean(vehicle) : false,
      bio: role === 'seeker' ? (bio || '') : '',

      lat: coords.lat,
      lng: coords.lng,
      address: address ? String(address).trim() : 'Mumbai, India',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName)}`
    });

    // Clean up used OTP
    otpStore.delete(cleaned);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name, phone: newUser.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = newUser;

    if (req.io) {
      req.io.emit('user:registered', safeUser);
    }

    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    console.error('Phone register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------------
// STANDARD EMAIL / DEMO ROUTES
// -------------------------------------------------------------

// Email Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, companyName, title, skills, phone, lat, lng, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Please provide name, email, password, and role (emp or seeker)' });
    }
    if (String(name).trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    if (!['emp', 'seeker'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either emp or seeker' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const cleanedPhone = cleanPhone(phone);
    if (cleanedPhone && db.findUserByPhone(cleanedPhone)) {
      return res.status(400).json({ error: 'This mobile number is already registered with another account' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const trimmedName = String(name).trim();
    const coords = sanitizeCoords(lat, lng);

    const newUser = db.createUser({
      name: trimmedName,
      email: String(email).trim().toLowerCase(),
      password: passwordHash,
      role, // 'emp' or 'seeker'
      companyName: companyName || (role === 'emp' ? trimmedName : ''),
      title: title || '',
      skills: Array.isArray(skills) ? skills.filter(Boolean) : (skills ? String(skills).split(',').map(s => s.trim()).filter(Boolean) : []),
      phone: cleanedPhone ? `+91 ${cleanedPhone}` : '',
      lat: coords.lat,
      lng: coords.lng,
      address: address || 'Mumbai, India',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName)}`
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = newUser;

    if (req.io) {
      req.io.emit('user:registered', safeUser);
    }

    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fast Demo Login
router.post('/demo-login', (req, res) => {
  const { role } = req.body; // 'emp' or 'seeker'
  const user = db.getAllUsers().find(u => u.role === (role || 'seeker'));
  if (!user) return res.status(404).json({ error: 'Demo user not found' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// Get Current User Profile
router.get('/me', authenticateToken, (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// Update Coordinates (Uber-style GPS tracker)
router.put('/location', authenticateToken, (req, res) => {
  const { lat, lng, address } = req.body;
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (!Number.isFinite(nLat) || !Number.isFinite(nLng) || nLat < 6 || nLat > 38 || nLng < 68 || nLng > 98) {
    return res.status(400).json({ error: 'Valid India Latitude (6-38) and Longitude (68-98) are required' });
  }

  const updated = db.updateUser(req.user.id, {
    lat: nLat,
    lng: nLng,
    ...(address ? { address: String(address).trim() } : {})
  });

  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password: _, ...safeUser } = updated;
  res.json({ user: safeUser });
});

// Get all employers (visible to seekers on the live map and Connect Hub)
router.get('/employers', (req, res) => {
  const employers = db.getEmployers().map(u => {
    const { password, ...safe } = u;
    return safe;
  });
  res.json({ employers });
});

// Get all seekers (visible to employers on the live map and Connect Hub)
router.get('/seekers', (req, res) => {
  const seekers = db.getSeekers().map(u => {
    const { password, ...safe } = u;
    return safe;
  });
  res.json({ seekers });
});

// Get all categorized demo users for multi-account testing
router.get('/demo-users', (req, res) => {
  const employers = db.getEmployers().map(u => {
    const { password, ...safe } = u;
    return safe;
  });
  const seekers = db.getSeekers().map(u => {
    const { password, ...safe } = u;
    return safe;
  });
  res.json({ employers, seekers });
});

// Switch login directly to any specific user ID (for multi-user testing)
router.post('/switch-user/:id', (req, res) => {
  const user = db.findUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// Get user by ID (for chat/calling target)
router.get('/user/:id', (req, res) => {
  const user = db.findUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

export default router;
