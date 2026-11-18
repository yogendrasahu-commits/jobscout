import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.DATA_PATH || path.join(__dirname, 'data.json');
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Default initial seeds with Multiple Employers & Multiple Seekers
const getDefaultData = () => {
  return {
    users: [],
    jobs: [
      {
        id: 'job_1',
        employerId: 'usr_emp_1',
        employerName: 'TechPulse Solutions',
        company: 'TechPulse Solutions Pvt Ltd',
        title: 'Senior React & WebRTC Engineer',
        category: 'Technology',
        jobType: 'Full-time',
        salary: '₹18,00,000 - ₹24,00,000 / yr',
        lat: 19.0760,
        lng: 72.8777,
        address: 'BKC, Mumbai (Hybrid / Onsite)',
        description: 'Looking for an experienced React developer passionate about real-time audio/video streaming, WebSockets, and modern web apps.',
        skills: ['React', 'WebRTC', 'Socket.io', 'Tailwind CSS'],
        urgent: true,
        status: 'open',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'job_2',
        employerId: 'usr_emp_1',
        employerName: 'TechPulse Solutions',
        company: 'TechPulse Solutions Pvt Ltd',
        title: 'On-Demand Field IT Diagnostics Engineer',
        category: 'Support',
        jobType: 'Contract / Gig',
        salary: '₹2,500 / day',
        lat: 19.0680,
        lng: 72.8350,
        address: 'Santacruz East, Mumbai',
        description: 'Urgent spot requirement for hardware & network diagnostics on client premises. Spot hiring via live map.',
        skills: ['Networking', 'Hardware Troubleshooting', 'OS Setup'],
        urgent: true,
        status: 'open',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'job_3',
        employerId: 'usr_emp_2',
        employerName: 'Nexus Cloud Innovations',
        company: 'Nexus Cloud Innovations',
        title: 'Backend Node.js & Microservices Architect',
        category: 'Technology',
        jobType: 'Full-time',
        salary: '₹22,00,000 - ₹30,00,000 / yr',
        lat: 19.1136,
        lng: 72.8697,
        address: 'MIDC, Andheri East, Mumbai',
        description: 'Join our cloud infrastructure team to scale distributed microservices, APIs, and real-time event brokers.',
        skills: ['Node.js', 'Express', 'Redis', 'Docker', 'PostgreSQL'],
        urgent: false,
        status: 'open',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'job_4',
        employerId: 'usr_emp_2',
        employerName: 'Nexus Cloud Innovations',
        company: 'Nexus Cloud Innovations',
        title: 'DevOps & Kubernetes Infrastructure Engineer',
        category: 'Technology',
        jobType: 'Full-time',
        salary: '₹20,00,000 - ₹28,00,000 / yr',
        lat: 19.1250,
        lng: 72.8550,
        address: 'Chakala, Andheri East, Mumbai',
        description: 'Manage production AWS/GCP clusters, CI/CD pipelines, and zero-downtime microservices rollouts.',
        skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker'],
        urgent: false,
        status: 'open',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
      },
      {
        id: 'job_5',
        employerId: 'usr_emp_3',
        employerName: 'Apex Express Logistics',
        company: 'Apex Express Logistics India',
        title: 'Express Delivery Rider & Fleet Specialist',
        category: 'Logistics',
        jobType: 'Hourly / Gig',
        salary: '₹32,000 - ₹38,000 / mo + Fuel Bonus',
        lat: 19.0910,
        lng: 72.8860,
        address: 'Sakinaka Junction, Kurla, Mumbai',
        description: 'Immediate 20 openings for express package delivery. Instant onboarding with valid bike license.',
        skills: ['Delivery', 'Two Wheeler', 'Route Navigation', 'Customer Handling'],
        urgent: true,
        status: 'open',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
      },
      {
        id: 'job_6',
        employerId: 'usr_emp_3',
        employerName: 'Apex Express Logistics',
        company: 'Apex Express Logistics India',
        title: 'Fulfillment Hub Inventory Supervisor',
        category: 'Logistics',
        jobType: 'Full-time',
        salary: '₹42,000 / mo',
        lat: 19.1000,
        lng: 72.8950,
        address: 'Marol Naka Hub, Mumbai',
        description: 'Supervise daily dispatches, manage warehouse shifts, and ensure on-time delivery metrics.',
        skills: ['Warehouse Management', 'Inventory ERP', 'Team Leadership'],
        urgent: false,
        status: 'open',
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
      },
      {
        id: 'job_7',
        employerId: 'usr_emp_4',
        employerName: 'PixelCraft Design Lab',
        company: 'PixelCraft Studio Ltd',
        title: 'Lead Product UI/UX Designer',
        category: 'Design',
        jobType: 'Full-time',
        salary: '₹15,00,000 - ₹20,00,000 / yr',
        lat: 19.0596,
        lng: 72.8295,
        address: 'Hill Road, Bandra West, Mumbai',
        description: 'Design world-class web and mobile interfaces. Shape brand identities and interactive design systems.',
        skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems'],
        urgent: false,
        status: 'open',
        createdAt: new Date(Date.now() - 3600000 * 14).toISOString()
      },
      {
        id: 'job_8',
        employerId: 'usr_emp_5',
        employerName: 'QuickServe Retail Supermarts',
        company: 'QuickServe Retail Network',
        title: 'Store Operations & Billing Lead',
        category: 'Support',
        jobType: 'Full-time',
        salary: '₹28,000 / mo',
        lat: 19.0178,
        lng: 72.8478,
        address: 'Dadar West Station Area, Mumbai',
        description: 'Manage store billing counters, supervise floor inventory, and provide helpful customer checkout experience.',
        skills: ['POS Billing', 'Inventory Stocking', 'Customer Support'],
        urgent: true,
        status: 'open',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'job_9',
        employerId: 'usr_emp_6',
        employerName: 'PrimeCare Diagnostic Centers',
        company: 'PrimeCare Health Systems',
        title: 'Customer Care & Medical Telecaller',
        category: 'Support',
        jobType: 'Full-time',
        salary: '₹35,000 / mo',
        lat: 19.1200,
        lng: 72.9050,
        address: 'Powai Business Hub, Mumbai',
        description: 'Assist patients with diagnostic report booking, home collection scheduling, and inbound inquiries.',
        skills: ['Telecalling', 'Fluent English/Hindi', 'Patient Care'],
        urgent: false,
        status: 'open',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ],
    applications: [
      {
        id: 'app_1',
        jobId: 'job_1',
        jobTitle: 'Senior React & WebRTC Engineer',
        employerId: 'usr_emp_1',
        seekerId: 'usr_seek_1',
        seekerName: 'Rahul Sharma',
        seekerEmail: 'rahul.sharma@example.com',
        seekerPhone: '+91 91234 56789',
        seekerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        coverNote: 'I have 3+ years building real-time collaboration apps with React, Leaflet, and WebRTC. Located in Kurla West nearby!',
        status: 'reviewed',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
      },
      {
        id: 'app_2',
        jobId: 'job_7',
        jobTitle: 'Lead Product UI/UX Designer',
        employerId: 'usr_emp_4',
        seekerId: 'usr_seek_2',
        seekerName: 'Priya Patel',
        seekerEmail: 'priya.patel@example.com',
        seekerPhone: '+91 98765 11223',
        seekerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        coverNote: 'Excited about design systems at PixelCraft. 4 years of Figma and product UX experience.',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ],
    messages: [
      {
        id: 'msg_1',
        senderId: 'usr_emp_1',
        receiverId: 'usr_seek_1',
        senderName: 'TechPulse Solutions',
        message: 'Hello Rahul! We saw your profile on the map nearby and reviewed your application for the React & WebRTC position.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        read: true
      },
      {
        id: 'msg_2',
        senderId: 'usr_seek_1',
        receiverId: 'usr_emp_1',
        senderName: 'Rahul Sharma',
        message: 'Thank you! Yes, I am available right now for an interview or quick video call.',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        read: true
      }
    ],
    posts: [
      {
        id: 'post_1',
        authorId: 'usr_emp_1',
        authorName: 'TechPulse Solutions',
        authorRole: 'emp',
        authorTitle: 'Technology & Cloud Solutions • Mumbai BKC',
        authorAvatar: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150',
        content: '🚀 We are expanding our Mumbai Engineering Hub! Hiring Senior React & WebRTC Engineers at BKC.\n\nKey Focus:\n• Low-latency audio/video P2P streaming\n• Scalable WebSockets & Uber-style interactive radar maps\n• Clean modern UI and state management\n\nApply directly via Easy Apply or message us for an instant video interview! #Hiring #React #WebRTC #TechJobs #JobRadar',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
        likes: 42,
        likedBy: ['usr_seek_1', 'usr_seek_2'],
        comments: [
          {
            id: 'c_1',
            authorName: 'Rahul Sharma',
            authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            text: 'Just submitted my application via Easy Apply! Excited about real-time audio/video tech.',
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
          }
        ],
        tags: ['#Hiring', '#React', '#WebRTC', '#TechJobs'],
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'post_2',
        authorId: 'usr_seek_1',
        authorName: 'Rahul Sharma',
        authorRole: 'seeker',
        authorTitle: 'Senior React & WebRTC Engineer • Ex-Startup • #OpenToWork',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        content: '🟢 #OpenToWork\n\nI am thrilled to announce that I am officially open to new full-time and high-impact engineering opportunities in Mumbai or Remote!\n\nOver the last 3.5 years, I have architected high-performance React & Node.js web applications, integrated real-time WebSockets, and built live location-based radars.\n\nFeel free to explore my verified skills, check my live radar pin on the map, or reach out directly for a quick video chat! 🤝\n\n#OpenToWork #SoftwareEngineer #FullStack #ReactJS #NodeJS',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        likes: 89,
        likedBy: ['usr_emp_1', 'usr_emp_2', 'usr_seek_3'],
        comments: [
          {
            id: 'c_2',
            authorName: 'TechPulse Solutions',
            authorAvatar: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150',
            text: 'Great experience Rahul! Let us connect for an intro call.',
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
          }
        ],
        tags: ['#OpenToWork', '#SoftwareEngineer', '#ReactJS'],
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
      },
      {
        id: 'post_3',
        authorId: 'usr_emp_4',
        authorName: 'PixelCraft Design Lab',
        authorRole: 'emp',
        authorTitle: 'Product Design & Media Studio • Bandra West',
        authorAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150',
        content: '🎨 "Design is not just what it looks like and feels like. Design is how it works."\n\nWe are looking for a Senior UI/UX & Design Systems Lead to shape our next-gen mobile & desktop design systems at our Bandra West studio. Immediate spot hiring for creative minds!\n\n#Hiring #UIUX #ProductDesign #DesignJobs #Figma',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800',
        likes: 38,
        likedBy: ['usr_seek_2'],
        comments: [],
        tags: ['#Hiring', '#UIUX', '#DesignJobs'],
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: 'post_4',
        authorId: 'usr_seek_2',
        authorName: 'Priya Patel',
        authorRole: 'seeker',
        authorTitle: 'Lead Product UI/UX Designer • Design Systems • #OpenToWork',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        content: 'Thrilled to share my latest Design System case study on accessible mobile navigation and micro-interactions for gig-economy platforms! Clean typography, high contrast ratios, and intuitive gesture controls make all the difference.\n\nOpen for innovative product design roles! Check my profile for portfolio links. 🚀✨\n\n#DesignSystems #UIUX #Figma #OpenToWork #ProductDesign',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        likes: 64,
        likedBy: ['usr_emp_4', 'usr_seek_1'],
        comments: [],
        tags: ['#DesignSystems', '#UIUX', '#OpenToWork'],
        createdAt: new Date(Date.now() - 3600000 * 16).toISOString()
      },
      {
        id: 'post_5',
        authorId: 'usr_emp_2',
        authorName: 'Nexus Cloud Innovations',
        authorRole: 'emp',
        authorTitle: 'Cloud Infrastructure & DevOps • Andheri East',
        authorAvatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150',
        content: 'Milestone Alert: Our distributed cluster just crossed 15,000,000 requests handled today with 99.99% uptime! 🛡️⚡\n\nTo keep pace with our 3x year-on-year growth, we are expanding our Andheri East engineering base. Looking for Python, Kubernetes, and AWS specialists.\n\n#NexusCloud #CloudComputing #AWS #Hiring #DevOps',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        likes: 112,
        likedBy: ['usr_seek_4', 'usr_seek_5'],
        comments: [],
        tags: ['#NexusCloud', '#AWS', '#Hiring'],
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ],
    connections: [
      { id: 'conn_1', user1: 'usr_emp_1', user2: 'usr_seek_1', connectedAt: '2026-10-10T10:00:00.000Z' },
      { id: 'conn_2', user1: 'usr_emp_1', user2: 'usr_seek_2', connectedAt: '2026-10-10T11:00:00.000Z' },
      { id: 'conn_3', user1: 'usr_seek_1', user2: 'usr_seek_2', connectedAt: '2026-10-11T12:00:00.000Z' }
    ],
    anonDiscussions: getInitialAnonDiscussions()
  };
};

const getInitialAnonDiscussions = () => [
  {
    id: 'anon_1',
    title: 'Real 2026 In-Hand Breakdown for BKC & Andheri Tech: ₹18 LPA vs ₹25 LPA CTC reality',
    content: 'Everyone quotes huge CTCs on LinkedIn, but here is my honest in-hand breakdown as a 3.5 YOE Fullstack Engineer at a BKC Series B company:\n\n• Stated CTC: ₹22,00,000\n• Fixed Base: ₹17,50,000\n• Monthly in-hand post-tax & PF: ₹1,18,000 / month\n• Variable component: ₹2,50,000 (dependent on company OKRs, got 75% last year)\n• ESOPs paper value: ₹2,00,000 (vesting over 4 yrs)\n\nAsk me anything about negotiations with Mumbai HRs or cost of living near Kurla/Santacruz.',
    channel: 'r/SalaryTalk',
    authorAlias: 'Curious Fox #412',
    authorAvatarSeed: 'fox',
    authorBadge: 'Verified Tech Engineer',
    score: 68,
    upvotes: 72,
    downvotes: 4,
    upvotedBy: ['usr_seek_1', 'usr_seek_2', 'usr_seek_3'],
    downvotedBy: [],
    commentsCount: 3,
    comments: [
      {
        id: 'ac_101',
        authorAlias: 'Shadow Ninja #88',
        authorAvatarSeed: 'ninja',
        authorBadge: 'Senior Dev',
        content: 'Spot on! Also don\'t forget the professional tax and medical insurance deductions. Many juniors expect ₹1.5L in hand for ₹20L CTC and get surprised when they see ₹1.08L.',
        upvotes: 18,
        upvotedBy: [],
        reactions: { '🔥': 5, '💯': 8 },
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'ac_102',
        authorAlias: 'Clever Owl #19',
        authorAvatarSeed: 'owl',
        authorBadge: 'Recruiter',
        content: 'HR here (anonymously): always ask the recruiter explicitly for the "Fixed Base" salary in writing before scheduling the final VP interview round. Saves everyone time.',
        upvotes: 24,
        upvotedBy: [],
        reactions: { '💡': 12, '👏': 6 },
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
      },
      {
        id: 'ac_103',
        authorAlias: 'Swift Falcon #77',
        authorAvatarSeed: 'falcon',
        authorBadge: 'Candidate',
        content: 'Thanks for this transparency. In my last offer they bundled ₹3L gratuity and retention bonus into CTC which was completely misleading.',
        upvotes: 9,
        upvotedBy: [],
        reactions: { '💀': 4 },
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ],
    views: 312,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'anon_2',
    title: 'Recently interviewed at Swiggy/Instamart & Logistics Startups in Mumbai — Exact System Design & React questions asked',
    content: 'Sharing my interview notes to help fellow devs anonymously:\n\nRound 1: Machine Coding (React 18)\n- Build a live vehicle tracking component with WebSocket updates\n- Smooth coordinate interpolation without re-rendering entire map tiles\n- Debounced search with auto-suggest\n\nRound 2: System Design\n- Design high-scale rider dispatch mechanism (Uber/Zomato style)\n- Handling rider GPS pings every 3s across 50k concurrent couriers\n- Geo-hashing vs QuadTree indexing in Redis\n\nRound 3: Behavioral\n- Conflict resolution with PMs when product deadlines slip.',
    channel: 'r/InterviewLeaks',
    authorAlias: 'Stealth Coder #93',
    authorAvatarSeed: 'coder',
    authorBadge: 'Verified Frontend Dev',
    score: 94,
    upvotes: 96,
    downvotes: 2,
    upvotedBy: ['usr_seek_1', 'usr_seek_4'],
    downvotedBy: [],
    commentsCount: 2,
    comments: [
      {
        id: 'ac_201',
        authorAlias: 'Brave Panda #55',
        authorAvatarSeed: 'panda',
        authorBadge: 'Fullstack Dev',
        content: 'Did they ask about offline queuing or service workers when delivery rider loses 4G connection?',
        upvotes: 11,
        upvotedBy: [],
        reactions: { '🔥': 3 },
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
      },
      {
        id: 'ac_202',
        authorAlias: 'Stealth Coder #93',
        authorAvatarSeed: 'coder',
        authorBadge: 'Verified Frontend Dev',
        content: 'Yes! They asked to implement IndexedDB local queue for tracking pings and sync back via background sync API when online.',
        upvotes: 16,
        upvotedBy: [],
        reactions: { '💡': 9 },
        createdAt: new Date(Date.now() - 3600000 * 7).toISOString()
      }
    ],
    views: 489,
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    id: 'anon_3',
    title: 'Unfiltered HR confession: The real reason why you don\'t hear back for 2-3 weeks after \'clearing\' final rounds',
    content: 'Posting anonymously as an HR Lead at a 300+ tech firm in Mumbai:\n\n1. Budget freezes happen mid-quarter without telling hiring managers.\n2. You might be "Option B". If "Option A" accepts the offer letter, we send you the rejection. If they back out, we suddenly call you saying "Congratulations!".\n3. Internal approvals (VP / CFO sign-off) take 10+ business days in corporate bureaucracy.\n\nTip: If you have a competing offer, tell us immediately. It magically speeds up our turnaround from 14 days to 48 hours.',
    channel: 'r/WorkCulture',
    authorAlias: 'Mystic Recruiter #12',
    authorAvatarSeed: 'recruiter',
    authorBadge: 'Verified Talent Partner',
    score: 142,
    upvotes: 148,
    downvotes: 6,
    upvotedBy: ['usr_emp_1', 'usr_seek_2', 'usr_seek_5'],
    downvotedBy: [],
    commentsCount: 2,
    comments: [
      {
        id: 'ac_301',
        authorAlias: 'Cyber Wolf #67',
        authorAvatarSeed: 'wolf',
        authorBadge: 'Job Seeker',
        content: 'I knew it! The "Option B" holding pattern is so brutal on candidates\' mental health. At least communicate an update!',
        upvotes: 35,
        upvotedBy: [],
        reactions: { '💯': 15, '💀': 8 },
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: 'ac_302',
        authorAlias: 'Quiet Bear #33',
        authorAvatarSeed: 'bear',
        authorBadge: 'Engineering Manager',
        content: 'Engineering manager here: 100% true. As interviewers we often recommend hire on Day 1, but HR compensation benchmarking committees take forever.',
        upvotes: 21,
        upvotedBy: [],
        reactions: { '👏': 7 },
        createdAt: new Date(Date.now() - 3600000 * 11).toISOString()
      }
    ],
    views: 620,
    createdAt: new Date(Date.now() - 3600000 * 15).toISOString()
  },
  {
    id: 'anon_4',
    title: 'Startup in Bandra West vs IT MNC in Powai: 3 years comparison on mental health, pay and commute',
    content: 'Having worked at both:\n\nMNC gave job security and fixed 9-to-6, but tech stack was 8 years old and appraisal was capped at 7%.\n\nBandra startup gave me ₹20L (almost 2x hike) and modern WebSockets/Next.js stack, but you own production issues on weekends and wear 5 different hats.\n\nChoose your trade-offs wisely depending on your life stage.',
    channel: 'r/CompanyReview',
    authorAlias: 'Zen Tiger #48',
    authorAvatarSeed: 'tiger',
    authorBadge: 'Senior Engineer',
    score: 53,
    upvotes: 55,
    downvotes: 2,
    upvotedBy: ['usr_seek_3'],
    downvotedBy: [],
    commentsCount: 1,
    comments: [
      {
        id: 'ac_401',
        authorAlias: 'Neon Dolphin #14',
        authorAvatarSeed: 'dolphin',
        authorBadge: 'DevOps Lead',
        content: 'Don\'t underestimate Western line vs Central line commute in Mumbai either. Reaching Bandra from Andheri is 20 mins; Powai traffic can take 1.5 hours.',
        upvotes: 14,
        upvotedBy: [],
        reactions: { '💯': 6 },
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
      }
    ],
    views: 280,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
  },
  {
    id: 'anon_5',
    title: 'Why WebSockets + WebRTC beats HTTP Polling for instant location dispatch (Production lessons)',
    content: 'We reduced our server AWS bill by 65% by switching from 3-second REST polling to WebSocket signaling with binary payloads.\n\nIf you are building maps or radar apps, look into socket room partitioning based on geohashes instead of broadcasting to everyone.\n\nHappy to share code snippets on room subdivision.',
    channel: 'r/TechSecrets',
    authorAlias: 'Ghost Architect #07',
    authorAvatarSeed: 'ghost',
    authorBadge: 'Staff Cloud Architect',
    score: 81,
    upvotes: 82,
    downvotes: 1,
    upvotedBy: ['usr_emp_2'],
    downvotedBy: [],
    commentsCount: 1,
    comments: [
      {
        id: 'ac_501',
        authorAlias: 'Pixel Rabbit #99',
        authorAvatarSeed: 'rabbit',
        authorBadge: 'Junior Dev',
        content: 'Please share the geohash clustering logic! Dealing with high socket CPU right now.',
        upvotes: 8,
        upvotedBy: [],
        reactions: { '🔥': 4 },
        createdAt: new Date(Date.now() - 3600000 * 22).toISOString()
      }
    ],
    views: 340,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'anon_6',
    title: 'How I cracked a 80% hike in 45 days after feeling stuck for 2 years (Prep playbook)',
    content: 'No DSA grinding for 6 months. Here is what actually worked:\n\n1. 2 solid full-stack portfolio projects that run live with WebSockets and clean mobile responsiveness.\n2. Mastered browser internals, event loop, and render optimization.\n3. Applied directly via live maps and speed connect hubs instead of generic cold applying.\n\nStay consistent and don\'t settle for underpaid roles.',
    channel: 'r/ChaiCharcha',
    authorAlias: 'Chai Lover #21',
    authorAvatarSeed: 'chai',
    authorBadge: 'Verified Job Seeker',
    score: 115,
    upvotes: 118,
    downvotes: 3,
    upvotedBy: ['usr_seek_1', 'usr_seek_2', 'usr_seek_6'],
    downvotedBy: [],
    commentsCount: 1,
    comments: [
      {
        id: 'ac_601',
        authorAlias: 'Cosmic Lion #71',
        authorAvatarSeed: 'lion',
        authorBadge: 'Fresher',
        content: 'Needed to read this today! Felt demotivated after 3 rejections last week. Back to building projects.',
        upvotes: 19,
        upvotedBy: [],
        reactions: { '🔥': 10, '👏': 12 },
        createdAt: new Date(Date.now() - 3600000 * 28).toISOString()
      }
    ],
    views: 540,
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
  }
];

class Database {
  constructor() {
    this.storageType = 'json';
    this.mongoConnected = false;
    this.init();
  }

  /**
   * Connect to MongoDB Atlas Cloud Database Engine
   * When MONGODB_URI is provided, connects to MongoDB cluster and syncs in-memory data
   * Otherwise falls back gracefully to zero-config Atomic JSON
   */
  async connectMongo(uri = process.env.MONGODB_URI) {
    if (!uri) return false;
    try {
      const mongoose = (await import('mongoose')).default;
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 50
      });
      this.mongoConnected = true;
      this.storageType = 'mongodb';
      console.log('🚀 Connected to MongoDB Atlas Cloud Database Engine!');

      await this.syncFromMongo();
      return true;
    } catch (err) {
      console.warn('⚠️ Could not connect to MongoDB Atlas, defaulting to Atomic JSON engine:', err.message);
      this.mongoConnected = false;
      this.storageType = 'json';
      return false;
    }
  }

  async syncFromMongo() {
    if (!this.mongoConnected) return;
    try {
      const { MongoUser, MongoJob, MongoApplication, MongoMessage, MongoPost, MongoAnon } = await import('./models/mongooseSchemas.js');
      const [users, jobs, applications, messages, posts, anonDiscussions] = await Promise.all([
        MongoUser.find({}).lean(),
        MongoJob.find({}).lean(),
        MongoApplication.find({}).lean(),
        MongoMessage.find({}).lean(),
        MongoPost.find({}).lean(),
        MongoAnon.find({}).lean()
      ]);

      if (users && users.length > 0) this.data.users = users;
      if (jobs && jobs.length > 0) this.data.jobs = jobs;
      if (applications && applications.length > 0) this.data.applications = applications;
      if (messages && messages.length > 0) this.data.messages = messages;
      if (posts && posts.length > 0) this.data.posts = posts;
      if (anonDiscussions && anonDiscussions.length > 0) this.data.anonDiscussions = anonDiscussions;
      console.log(`📦 Synced ${users.length} users and ${jobs.length} jobs from MongoDB Atlas`);
    } catch (err) {
      console.warn('Sync from MongoDB warning:', err.message);
    }
  }

  async persistToMongo(collectionName, document) {
    if (!this.mongoConnected || !document || !document.id) return;
    try {
      const schemas = await import('./models/mongooseSchemas.js');
      const modelMap = {
        users: schemas.MongoUser,
        jobs: schemas.MongoJob,
        applications: schemas.MongoApplication,
        messages: schemas.MongoMessage,
        posts: schemas.MongoPost,
        anonDiscussions: schemas.MongoAnon
      };
      const Model = modelMap[collectionName];
      if (Model) {
        await Model.findOneAndUpdate({ id: document.id }, document, { upsert: true, new: true });
      }
    } catch (err) {
      console.warn(`Mongo async persist error (${collectionName}):`, err.message);
    }
  }

  async deleteFromMongo(collectionName, id) {
    if (!this.mongoConnected || !id) return;
    try {
      const schemas = await import('./models/mongooseSchemas.js');
      const modelMap = {
        users: schemas.MongoUser,
        jobs: schemas.MongoJob,
        applications: schemas.MongoApplication,
        messages: schemas.MongoMessage,
        posts: schemas.MongoPost,
        anonDiscussions: schemas.MongoAnon
      };
      const Model = modelMap[collectionName];
      if (Model) {
        await Model.deleteOne({ id });
      }
    } catch (err) {
      console.warn(`Mongo async delete error (${collectionName}):`, err.message);
    }
  }

  getHealth() {
    return {
      storageType: this.storageType,
      mongoConnected: this.mongoConnected,
      collections: {
        users: (this.data.users || []).length,
        jobs: (this.data.jobs || []).length,
        applications: (this.data.applications || []).length,
        messages: (this.data.messages || []).length,
        posts: (this.data.posts || []).length,
        anonDiscussions: (this.data.anonDiscussions || []).length
      }
    };
  }

  init() {
    // Reinitialize or load data.json
    if (!fs.existsSync(DB_PATH)) {
      const initial = getDefaultData();
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
      this.data = initial;
    } else {
      try {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        this.data = JSON.parse(raw);
        // Ensure data has our enriched employers and seekers if old data is small
        if (!this.data.jobs || this.data.jobs.length < 8) {
          const initial = getDefaultData();
          fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
          this.data = initial;
        } else {
          const initial = getDefaultData();
          if (!this.data.posts || this.data.posts.length === 0) {
            this.data.posts = initial.posts;
          }
          if (!this.data.connections) {
            this.data.connections = initial.connections;
          }
          if (!this.data.anonDiscussions || this.data.anonDiscussions.length === 0) {
            this.data.anonDiscussions = initial.anonDiscussions;
          }

          // Ensure active admin account exists on startup
          this.ensureAdminUser();
          this.save();
        }
      } catch (err) {
        console.error('Error reading data.json, attempting backup recovery...', err);
        const backupPath = `${DB_PATH}.bak`;
        if (fs.existsSync(backupPath)) {
          try {
            const rawBackup = fs.readFileSync(backupPath, 'utf8');
            this.data = JSON.parse(rawBackup);
            console.log('✅ Successfully recovered database from safe backup!');
            return;
          } catch (bakErr) {
            console.error('Backup recovery also failed:', bakErr);
          }
        }
        const initial = getDefaultData();
        fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
        this.data = initial;
      }
    }
  }

  // Atomic file save with temporary file write, backup rotation, and atomic rename
  // Prevents file corruption even during unexpected crashes or power loss
  save() {
    try {
      const serialized = JSON.stringify(this.data, null, 2);
      const tempPath = `${DB_PATH}.tmp`;
      const backupPath = `${DB_PATH}.bak`;

      // 1. Write to temporary file first
      fs.writeFileSync(tempPath, serialized, 'utf8');

      // 2. Keep backup of previous healthy data
      if (fs.existsSync(DB_PATH)) {
        try {
          fs.copyFileSync(DB_PATH, backupPath);
        } catch {}
      }

      // 3. Atomically rename temp file to live DB_PATH (atomic on OS level)
      fs.renameSync(tempPath, DB_PATH);
    } catch (err) {
      console.error('Error saving data.json atomically:', err);
    }
  }

  // --- USERS ---
  findUserByEmail(email) {
    return this.data.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  }

  findUserByPhone(phone) {
    const target = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    if (!target) return null;
    return this.data.users.find(u => {
      const userP = (u.phone || '').replace(/[^0-9]/g, '').slice(-10);
      return userP && userP === target;
    });
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  getAllUsers() {
    return this.data.users;
  }

  getEmployers() {
    return this.data.users.filter(u => u.role === 'emp');
  }

  getSeekers() {
    return this.data.users.filter(u => u.role === 'seeker');
  }

  createUser(userData) {
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      isOnline: true,
      ...userData
    };
    this.data.users.push(newUser);
    this.save();
    this.persistToMongo('users', newUser);
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      this.persistToMongo('users', this.data.users[idx]);
      return this.data.users[idx];
    }
    return null;
  }

  getSavedJobs(userId) {
    const user = this.findUserById(userId);
    return user?.savedJobs || [];
  }

  toggleSavedJob(userId, jobId) {
    const user = this.findUserById(userId);
    if (!user) return [];
    const current = Array.isArray(user.savedJobs) ? user.savedJobs : [];
    const updated = current.includes(jobId)
      ? current.filter(id => id !== jobId)
      : [...current, jobId];
    this.updateUser(userId, { savedJobs: updated });
    return updated;
  }

  deleteUser(id) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      const removed = this.data.users.splice(idx, 1)[0];
      this.save();
      this.deleteFromMongo('users', id);
      return removed;
    }
    return null;
  }

  getPlatformStats() {
    const users = this.data.users || [];
    const jobs = this.data.jobs || [];
    const applications = this.data.applications || [];
    const posts = this.data.posts || [];

    return {
      totalUsers: users.length,
      seekersCount: users.filter(u => u.role === 'seeker').length,
      employersCount: users.filter(u => u.role === 'emp').length,
      adminsCount: users.filter(u => u.role === 'admin').length,
      onlineUsersCount: users.filter(u => u.isOnline).length,
      totalJobs: jobs.length,
      openJobs: jobs.filter(j => j.status === 'open').length,
      totalApplications: applications.length,
      offeredApplications: applications.filter(a => a.status === 'offered').length,
      hiredApplications: applications.filter(a => a.status === 'accepted' || a.status === 'hired').length,
      totalPosts: posts.length,
      systemUptime: Math.floor(process.uptime()),
      emailConfig: this.getEmailConfig()
    };
  }

  // --- JOBS ---
  getAllJobs() {
    return this.data.jobs;
  }

  findJobById(id) {
    return this.data.jobs.find(j => j.id === id);
  }

  createJob(jobData) {
    const newJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      status: 'open',
      ...jobData
    };
    this.data.jobs.unshift(newJob);
    this.save();
    this.persistToMongo('jobs', newJob);
    return newJob;
  }

  deleteJob(id, employerId) {
    const initialLen = this.data.jobs.length;
    this.data.jobs = this.data.jobs.filter(j => !(j.id === id && j.employerId === employerId));
    if (this.data.jobs.length !== initialLen) {
      this.save();
      this.deleteFromMongo('jobs', id);
      return true;
    }
    return false;
  }

  adminDeleteJob(id) {
    const initialLen = this.data.jobs.length;
    this.data.jobs = this.data.jobs.filter(j => j.id !== id);
    if (this.data.jobs.length !== initialLen) {
      this.save();
      this.deleteFromMongo('jobs', id);
      return true;
    }
    return false;
  }

  updateJob(id, updates) {
    const job = this.findJobById(id);
    if (!job) return null;
    Object.assign(job, updates);
    this.save();
    return job;
  }

  ensureAdminUser() {
    const adminEmail = 'admin@jobscout.io';
    const adminPhone = '+91 9999999999';
    let admin = (this.data.users || []).find(u => u.email === adminEmail || u.role === 'admin');
    const passwordHash = bcrypt.hashSync('admin123', 10);

    if (!admin) {
      admin = {
        id: 'usr_admin_master',
        name: 'System Administrator',
        email: adminEmail,
        phone: adminPhone,
        password: passwordHash,
        role: 'admin',
        title: 'Platform Super Admin',
        address: 'Bandra-Kurla Complex (BKC), Mumbai',
        lat: 19.0680,
        lng: 72.8690,
        isProfileComplete: true,
        isVerified: true,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=JobScoutAdmin',
        createdAt: new Date().toISOString()
      };
      if (!this.data.users) this.data.users = [];
      this.data.users.unshift(admin);
      this.save();
    } else {
      admin.role = 'admin';
      admin.password = passwordHash;
      admin.email = adminEmail;
      admin.phone = adminPhone;
      admin.isProfileComplete = true;
      admin.isVerified = true;
      this.save();
    }
    return admin;
  }

  getPlatformFeatures() {
    if (!this.data.features) {
      this.data.features = {
        allowGuestExplore: false,
        autoApproveJobs: true,
        instantWhatsAppAlerts: true,
        instantTelegramAlerts: true,
        salaryVisible: true,
        liveMapRealtimeSync: true,
        maintenanceMode: false,
        customAnnouncement: ''
      };
      this.save();
    }
    return this.data.features;
  }

  updatePlatformFeatures(updates) {
    const current = this.getPlatformFeatures();
    this.data.features = { ...current, ...updates };
    this.save();
    return this.data.features;
  }

  // --- APPLICATIONS ---
  getAllApplications() {
    return this.data.applications;
  }

  getApplicationsByJobId(jobId) {
    return this.data.applications.filter(a => a.jobId === jobId);
  }

  getApplicationsBySeekerId(seekerId) {
    return this.data.applications
      .filter(a => a.seekerId === seekerId)
      .map(app => {
        const employer = this.findUserById(app.employerId);
        const seeker = this.findUserById(app.seekerId);
        return {
          ...app,
          seekerEmail: (seeker && seeker.email) || app.seekerEmail || '',
          employerName: (employer && (employer.companyName || employer.name)) || app.employerName || '',
          employerEmail: (employer && employer.email) || ''
        };
      });
  }

  getApplicationsByEmployerId(employerId) {
    return this.data.applications
      .filter(a => a.employerId === employerId)
      .map(app => {
        const seeker = this.findUserById(app.seekerId);
        return {
          ...app,
          seekerEmail: (seeker && seeker.email) || app.seekerEmail || '',
          seekerPhone: (seeker && seeker.phone) || app.seekerPhone || '',
          seekerAvatar: (seeker && seeker.avatar) || app.seekerAvatar || '',
          seekerName: (seeker && seeker.name) || app.seekerName || ''
        };
      });
  }

  createApplication(appData) {
    const newApp = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...appData
    };
    this.data.applications.unshift(newApp);
    this.save();
    this.persistToMongo('applications', newApp);
    return newApp;
  }

  updateApplicationStatus(id, status) {
    const app = this.data.applications.find(a => a.id === id);
    if (app) {
      app.status = status;
      this.save();
      this.persistToMongo('applications', app);
      return app;
    }
    return null;
  }

  // --- MESSAGES ---
  getConversation(user1, user2) {
    return this.data.messages.filter(
      m => (m.senderId === user1 && m.receiverId === user2) ||
           (m.senderId === user2 && m.receiverId === user1)
    ).sort((a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt));
  }

  createMessage(msgData) {
    const text = msgData.message || msgData.content || '';
    const now = new Date().toISOString();
    const time = msgData.timestamp || msgData.createdAt || now;
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: time,
      createdAt: time,
      read: false,
      ...msgData,
      message: text,
      content: text
    };
    this.data.messages.push(newMsg);
    this.save();
    this.persistToMongo('messages', newMsg);
    return newMsg;
  }

  markMessagesRead(senderId, receiverId) {
    let changed = false;
    this.data.messages.forEach(m => {
      if (m.senderId === senderId && m.receiverId === receiverId && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) this.save();
  }

  // --- POSTS ---
  getPosts() {
    if (!this.data.posts) {
      this.data.posts = getDefaultData().posts;
      this.save();
    }
    return this.data.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createPost(postData) {
    if (!this.data.posts) this.data.posts = [];
    const newPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: [],
      ...postData
    };
    this.data.posts.unshift(newPost);
    this.save();
    this.persistToMongo('posts', newPost);
    return newPost;
  }

  likePost(postId, userId) {
    if (!this.data.posts) return null;
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) return null;
    if (!post.likedBy) post.likedBy = [];
    const idx = post.likedBy.indexOf(userId);
    if (idx >= 0) {
      post.likedBy.splice(idx, 1);
      post.likes = Math.max(0, (post.likes || 1) - 1);
    } else {
      post.likedBy.push(userId);
      post.likes = (post.likes || 0) + 1;
    }
    this.save();
    this.persistToMongo('posts', post);
    return post;
  }

  commentPost(postId, commentData) {
    if (!this.data.posts) return null;
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) return null;
    if (!post.comments) post.comments = [];
    const newComment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      ...commentData
    };
    post.comments.push(newComment);
    this.save();
    return post;
  }

  // --- CONNECTIONS & NETWORK ---
  getConnections(userId) {
    if (!this.data.connections) {
      this.data.connections = [];
    }
    return this.data.connections.filter(c => c.user1 === userId || c.user2 === userId);
  }

  toggleConnect(userId, targetId) {
    if (!this.data.connections) this.data.connections = [];
    const idx = this.data.connections.findIndex(
      c => (c.user1 === userId && c.user2 === targetId) || (c.user1 === targetId && c.user2 === userId)
    );
    if (idx >= 0) {
      this.data.connections.splice(idx, 1);
      this.save();
      return { connected: false };
    } else {
      this.data.connections.push({
        id: `conn_${Date.now()}`,
        user1: userId,
        user2: targetId,
        connectedAt: new Date().toISOString()
      });
      this.save();
      return { connected: true };
    }
  }

  endorseSkill(seekerId, skill, endorserId) {
    if (!this.data.endorsements) this.data.endorsements = {};
    const key = `${seekerId}_${skill}`;
    if (!this.data.endorsements[key]) this.data.endorsements[key] = [];
    if (!this.data.endorsements[key].includes(endorserId)) {
      this.data.endorsements[key].push(endorserId);
      this.save();
    }
    return { count: this.data.endorsements[key].length };
  }

  // --- ANONYMOUS DISCUSSIONS (REDDIT / BLIND STYLE) ---
  getAnonDiscussions(filter = {}) {
    if (!this.data.anonDiscussions || this.data.anonDiscussions.length === 0) {
      this.data.anonDiscussions = getInitialAnonDiscussions();
      this.save();
    }
    let list = [...this.data.anonDiscussions];

    // Filter by channel (normalizing r/ or # prefixes for robust cross-client matching)
    if (filter.channel && filter.channel !== 'all') {
      const targetChannel = filter.channel.toLowerCase().replace(/^(r\/|#)/, '').trim();
      list = list.filter(d => {
        const itemChannel = (d.channel || '').toLowerCase().replace(/^(r\/|#)/, '').trim();
        return itemChannel === targetChannel;
      });
    }

    // Filter by search query
    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      list = list.filter(d => 
        (d.title && d.title.toLowerCase().includes(q)) ||
        (d.content && d.content.toLowerCase().includes(q)) ||
        (d.channel && d.channel.toLowerCase().includes(q)) ||
        (d.authorAlias && d.authorAlias.toLowerCase().includes(q))
      );
    }

    // Sort by mode
    if (filter.sort === 'top') {
      list.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else if (filter.sort === 'new') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Hot: combination of score and recency
      list.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        const scoreA = (a.score || 0) * 3600000 * 4 + timeA;
        const scoreB = (b.score || 0) * 3600000 * 4 + timeB;
        return scoreB - scoreA;
      });
    }

    return list;
  }

  getAnonDiscussionById(id) {
    if (!this.data.anonDiscussions) return null;
    const item = this.data.anonDiscussions.find(d => d.id === id);
    if (item) {
      item.views = (item.views || 0) + 1;
      this.save();
    }
    return item;
  }

  createAnonDiscussion(data) {
    if (!this.data.anonDiscussions) {
      this.data.anonDiscussions = [];
    }
    const newDiscussion = {
      id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: data.title,
      content: data.content,
      channel: data.channel || 'r/ChaiCharcha',
      authorAlias: data.authorAlias || 'Anonymous Member',
      authorAvatarSeed: data.authorAvatarSeed || 'fox',
      authorBadge: data.authorBadge || 'Verified Member',
      score: 1,
      upvotes: 1,
      downvotes: 0,
      upvotedBy: data.userId ? [data.userId] : ['anon_creator'],
      downvotedBy: [],
      commentsCount: 0,
      comments: [],
      views: 1,
      createdAt: new Date().toISOString()
    };
    this.data.anonDiscussions.unshift(newDiscussion);
    this.save();
    this.persistToMongo('anonDiscussions', newDiscussion);
    return newDiscussion;
  }

  voteAnonDiscussion(id, userId, direction) {
    if (!this.data.anonDiscussions) return null;
    const post = this.data.anonDiscussions.find(d => d.id === id);
    if (!post) return null;

    if (!post.upvotedBy) post.upvotedBy = [];
    if (!post.downvotedBy) post.downvotedBy = [];

    const voterId = userId || 'anon_guest';
    const upIdx = post.upvotedBy.indexOf(voterId);
    const downIdx = post.downvotedBy.indexOf(voterId);

    if (direction === 1) {
      // User clicked upvote
      if (upIdx >= 0) {
        post.upvotedBy.splice(upIdx, 1);
      } else {
        post.upvotedBy.push(voterId);
        if (downIdx >= 0) post.downvotedBy.splice(downIdx, 1);
      }
    } else if (direction === -1) {
      // User clicked downvote
      if (downIdx >= 0) {
        post.downvotedBy.splice(downIdx, 1);
      } else {
        post.downvotedBy.push(voterId);
        if (upIdx >= 0) post.upvotedBy.splice(upIdx, 1);
      }
    }

    post.upvotes = post.upvotedBy.length;
    post.downvotes = post.downvotedBy.length;
    post.score = post.upvotes - post.downvotes;

    this.save();
    return post;
  }

  addAnonComment(postId, commentData) {
    if (!this.data.anonDiscussions) return null;
    const post = this.data.anonDiscussions.find(d => d.id === postId);
    if (!post) return null;

    if (!post.comments) post.comments = [];
    const newComment = {
      id: `ac_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      authorAlias: commentData.authorAlias || 'Anonymous Contributor',
      authorAvatarSeed: commentData.authorAvatarSeed || 'ninja',
      authorBadge: commentData.authorBadge || 'Verified Contributor',
      content: commentData.content,
      upvotes: 1,
      upvotedBy: commentData.userId ? [commentData.userId] : [],
      reactions: { '🔥': 1 },
      createdAt: new Date().toISOString()
    };

    post.comments.push(newComment);
    post.commentsCount = post.comments.length;
    this.save();
    return { post, comment: newComment };
  }

  reactAnonComment(postId, commentId, emoji) {
    if (!this.data.anonDiscussions) return null;
    const post = this.data.anonDiscussions.find(d => d.id === postId);
    if (!post || !post.comments) return null;
    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) return null;

    if (!comment.reactions) comment.reactions = {};
    comment.reactions[emoji] = (comment.reactions[emoji] || 0) + 1;
    this.save();
    return { post, comment };
  }

  getEmailConfig() {
    if (!this.data.emailConfig) {
      this.data.emailConfig = {
        gmailUser: process.env.GMAIL_USER || '',
        gmailPass: process.env.GMAIL_PASS || '',
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: process.env.SMTP_PORT || '',
        smtpUser: process.env.SMTP_USER || '',
        smtpPass: process.env.SMTP_PASS || '',
        emailFrom: process.env.EMAIL_FROM || ''
      };
    }
    return this.data.emailConfig;
  }

  saveEmailConfig(config) {
    this.data.emailConfig = {
      ...(this.data.emailConfig || {}),
      ...config
    };
    this.save();
    return this.data.emailConfig;
  }

  getAlertConfig() {
    if (!this.data.alertConfig) {
      this.data.alertConfig = {
        telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
        telegramDefaultChatId: process.env.TELEGRAM_CHAT_ID || '',
        whatsappProvider: 'meta',
        whatsappToken: process.env.WHATSAPP_TOKEN || '',
        whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
        twilioFromNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
        gatewayUrl: process.env.WHATSAPP_GATEWAY_URL || '',
        gatewayToken: process.env.WHATSAPP_GATEWAY_TOKEN || ''
      };
    }
    return this.data.alertConfig;
  }

  saveAlertConfig(config) {
    this.data.alertConfig = {
      ...(this.data.alertConfig || {}),
      ...config
    };
    this.save();
    return this.data.alertConfig;
  }
}

export const db = new Database();
export default db;
