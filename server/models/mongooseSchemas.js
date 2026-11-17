import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['seeker', 'emp', 'admin'], default: 'seeker', index: true },
  company: { type: String, default: '' },
  email: { type: String, default: '' },
  avatar: { type: String, default: '' },
  headline: { type: String, default: '' },
  bio: { type: String, default: '' },
  experienceYears: { type: Number, default: 0 },
  skills: [{ type: String }],
  lat: { type: Number, default: 19.0760 },
  lng: { type: Number, default: 72.8777 },
  address: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  savedJobs: [{ type: String }],
  videoIntroUrl: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  connections: [{ type: String }],
  endorsements: [{
    skill: String,
    endorsedBy: String,
    endorserName: String,
    date: { type: Date, default: Date.now }
  }],
  profileViews: { type: Number, default: 0 },
  notifications: [{
    id: String,
    title: String,
    desc: String,
    time: String,
    read: Boolean,
    tab: String
  }],
  notificationSettings: {
    whatsapp: { type: Boolean, default: true },
    telegram: { type: Boolean, default: true },
    email: { type: Boolean, default: true }
  },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

// Geospatial 2dsphere index for ultra-fast location discovery
userSchema.index({ lat: 1, lng: 1 });

const jobSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  employerId: { type: String, required: true, index: true },
  employerName: { type: String, required: true },
  company: { type: String, required: true },
  title: { type: String, required: true, index: true },
  category: { type: String, default: 'General' },
  jobType: { type: String, default: 'Full-time' },
  salary: { type: String, default: '' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  address: { type: String, required: true },
  description: { type: String, required: true },
  skills: [{ type: String }],
  requirements: [{ type: String }],
  urgent: { type: Boolean, default: false },
  status: { type: String, enum: ['open', 'closed', 'paused'], default: 'open', index: true },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

jobSchema.index({ lat: 1, lng: 1 });

const applicationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  jobId: { type: String, required: true, index: true },
  seekerId: { type: String, required: true, index: true },
  seekerName: { type: String, required: true },
  seekerPhone: { type: String, default: '' },
  seekerEmail: { type: String, default: '' },
  coverLetter: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  experience: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'interview', 'offered', 'hired', 'rejected', 'declined'], 
    default: 'pending',
    index: true 
  },
  notes: { type: String, default: '' },
  offerLetter: {
    salary: String,
    joiningDate: String,
    terms: String,
    letterNumber: String,
    issuedAt: String,
    respondedAt: String,
    declineReason: String
  },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  senderId: { type: String, required: true, index: true },
  receiverId: { type: String, required: true, index: true },
  senderName: { type: String, default: 'User' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false, index: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

const postSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  authorId: { type: String, required: true, index: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, default: 'seeker' },
  authorAvatar: { type: String, default: '' },
  content: { type: String, required: true },
  tags: [{ type: String }],
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  comments: [{
    id: String,
    authorId: String,
    authorName: String,
    text: String,
    createdAt: String
  }],
  commentsCount: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

const anonDiscussionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'General' },
  authorAlias: { type: String, default: 'Anonymous Scout' },
  authorRole: { type: String, default: 'Anonymous' },
  score: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: String }],
  downvotedBy: [{ type: String }],
  comments: [{
    id: String,
    authorAlias: String,
    text: String,
    reactions: mongoose.Schema.Types.Mixed,
    createdAt: String
  }],
  commentsCount: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

const configSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

export const MongoUser = mongoose.models.User || mongoose.model('User', userSchema);
export const MongoJob = mongoose.models.Job || mongoose.model('Job', jobSchema);
export const MongoApplication = mongoose.models.Application || mongoose.model('Application', applicationSchema);
export const MongoMessage = mongoose.models.Message || mongoose.model('Message', messageSchema);
export const MongoPost = mongoose.models.Post || mongoose.model('Post', postSchema);
export const MongoAnon = mongoose.models.AnonDiscussion || mongoose.model('AnonDiscussion', anonDiscussionSchema);
export const MongoConfig = mongoose.models.Config || mongoose.model('Config', configSchema);
