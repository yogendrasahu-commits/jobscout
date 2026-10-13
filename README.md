# 🚀 JobRadar - Uber-Style Job Platform

A modern full-stack web application built with **React**, **Node.js Express**, **Socket.IO**, **WebRTC**, and **Leaflet Maps**. 

It connects **Employers (`emp`)** and **Job Seekers (`seeker`)** on a live Uber-style interactive map with real-time location tracking, instant chat, and peer-to-peer **Voice & Video Calling**.

---

## 🌟 Key Features

### 1. 🗺️ Uber-Style Live Interactive Map
- **OpenStreetMap & Leaflet**: High performance interactive map with custom radar styles.
- **Animated Custom Map Pins**:
  - 💼 **Job Openings**: Indigo radar pins displaying compensation tag and company.
  - 👤 **Job Seekers**: Emerald pins visible on the map for instant hiring.
  - 📡 **Your GPS Beacon**: Pulsing radar circle showing your location.
- **Radar Radius Control**: Adjust radar range (2 km to 35 km) with instant live filtering.
- **1-Click GPS Relocation**: Tap anywhere on the map or click the crosshair GPS button.

### 2. 👥 Two User Roles (`emp` and `seeker`)
- **👔 Employer (`emp`)**:
  - Post jobs directly by clicking on map coordinates or setting an address.
  - Filter and inspect job seekers nearby with verified skills & expected compensation.
  - Review applicant submissions and update statuses (*Reviewed*, *Accepted*, *Declined*).
  - Instant 1-click **Voice Call**, **Video Call**, or **Chat** with candidates.
- **🔍 Job Seeker (`seeker`)**:
  - Live discovery of nearby jobs with calculated distance (*e.g. 1.2 km away*).
  - 1-click application submission with pitch note.
  - Fast-track interview access via direct calling.
  - Realtime application status tracking.

### 3. ⚡ Speed Connect Hub (`ConnectHub.jsx`)
- **Direct Calling & Candidate Directory**:
  - Employers see nearby candidates ready for instant spot interviews.
  - Seekers see nearby verified recruiting companies with open positions.
- **1-Click Communication Suite**:
  - 📞 **HQ Audio Call**: Instant low-latency voice interview.
  - 🎥 **HD WebRTC Video Call**: Fullscreen / PiP video screen with camera & mic controls.
  - 💬 **Live Chat**: Direct messaging drawer with real-time socket delivery.
- **Smart Filter & Search**: Filter by *Online Now*, *Distance within 5 km*, *Category*, or *Skills*.

### 4. 🎥 WebRTC Audio & Video Calling
- **True Peer-to-Peer Streaming**: Built on standard browser `RTCPeerConnection` with STUN servers.
- **Real-Time Signaling via Socket.IO**: Handles call initiate, incoming ring alert, accept, reject, ICE negotiation, and hangup.
- **Built-in Ringtone Synthesizer**: Web Audio API tone generator (no broken sound files).
- **In-Call Controls**: Mute/unmute microphone, toggle video camera, PiP local view, and fullscreen.

### 5. 💬 Real-Time Live Chat
- Instant messaging between employers and seekers via Socket.IO.
- Persistent conversation history stored in the backend database.
- Quick call launch buttons directly in the chat header.

### 5. 📱 Phone Number OTP & Password Authentication
- **Dual Login Methods**:
  - 📲 **Login with Mobile Number & 6-Digit OTP** (Simulated live code generator with 1-click auto-fill, timer countdown, or master OTP `123456`).
  - 🔑 **Login with Mobile Number & Password**.
- **Role-based Sign Up (Registration)**:
  - Select role: 👔 **Employer (`emp`)** or 🔍 **Job Seeker (`seeker`)**.
  - Mobile verification with OTP.
  - Set password, full name, company name (for recruiter) or skills & title (for seeker).
- **1-Click Quick Demo Switching**:
  - Instant toggle between **Employer** and **Job Seeker** mode right from the top navigation bar.

---

## 🧪 Multi-User Demo Directory (14 Accounts Ready)
You can switch instantly between any of these accounts in 1 click using the **"Multi-Users (14)"** button in the navbar, or log in with their phone and OTP (`123456`) / password (`password123`):

### 👔 Employers (6 Active Recruiters & Companies)
| Company Name | Industry | Location | Phone | Active Openings |
|---|---|---|---|---|
| **TechPulse Solutions** | Technology & Cloud | Bandra Kurla Complex (BKC) | `9876543210` | 2 Jobs (WebRTC & IT) |
| **Nexus Cloud Innovations** | Cloud Infrastructure | MIDC Andheri East | `9811122334` | 2 Jobs (Microservices & DevOps) |
| **Apex Express Logistics** | Logistics & Supply Chain | Sakinaka / Kurla West | `9822334455` | 2 Jobs (Fleet Rider & Hub Manager) |
| **PixelCraft Design Lab** | Design & Creative Media | Hill Road, Bandra West | `9833455667` | 1 Job (Lead UI/UX Designer) |
| **QuickServe Retail Supermarts** | Retail & Commerce | Dadar West Station Area | `9844566778` | 1 Job (Store Operations Lead) |
| **PrimeCare Health Systems** | Healthcare & Diagnostic | Powai Business Hub | `9855677889` | 1 Job (Medical Telecalling) |

### 🔍 Job Seekers (8 Diverse Candidates Ready for Spot-Hiring)
| Candidate Name | Primary Role & Skills | Location | Phone | Transport / Vehicle |
|---|---|---|---|---|
| **Rahul Sharma** | React & WebRTC Developer | Kurla West (Near BKC) | `9123456789` | 🛵 Bike (Ready) |
| **Priya Patel** | Senior UI/UX & Figma Designer | Bandra West | `9876511223` | Metro / Local |
| **Amit Verma** | Express Delivery & Field Operations | Powai Hiranandani | `9776655443` | 🛵 Bike (Ready) |
| **Neha Kulkarni** | Python, FastAPI & Cloud Engineer | Lower Parel Hub | `9811233445` | Local Train |
| **Vikas Shinde** | IT & Network Diagnostics Engineer | Santacruz East | `9822344556` | 🛵 Bike (Ready) |
| **Ananya Sen** | Product Growth & Marketing Lead | Worli Sea Face | `9833466778` | Cab / Car |
| **Deepak Rawat** | Warehouse & Inventory Manager | Ghatkopar West | `9844577889` | 🛵 Bike (Ready) |
| **Pooja Joshi** | Customer Care & Telecalling Lead | Vikhroli West | `9855688990` | Local / Bus |

```
jobmap-platform/
├── server/
│   ├── server.js              # Express app + Socket.IO server (Port 5000)
│   ├── socket.js              # Realtime messaging, GPS broadcast & WebRTC signaling
│   ├── db.js                  # Persistent database store (data.json) with seed data
│   ├── routes/
│   │   ├── auth.js            # Auth, JWT, demo login, location updates
│   │   ├── jobs.js            # Jobs CRUD, Haversine geo-distance calculator
│   │   ├── applications.js    # Job applications & candidate management
│   │   └── messages.js        # Chat history & conversation threads
│   └── package.json
├── client/
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Auth token & role management
│   │   │   └── SocketContext.jsx    # Socket.IO & WebRTC calling engine
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Header with 1-click role switcher
│   │   │   ├── UberJobMap.jsx       # Leaflet interactive map with animated pins
│   │   │   ├── ChatDrawer.jsx       # Real-time chat & call launcher
│   │   │   ├── VideoCallModal.jsx   # WebRTC audio & video call overlay
│   │   │   ├── IncomingCallBanner.jsx# Ringing popup with Accept/Reject
│   │   │   ├── PostJobModal.jsx     # Employer job post form
│   │   │   ├── JobApplyModal.jsx    # Seeker application modal
│   │   │   └── SeekerProfileModal.jsx# Seeker inspection modal
│   │   ├── pages/
│   │   │   ├── JobsList.jsx         # Searchable feed of all jobs
│   │   │   ├── ApplicationsView.jsx # Applications tracker
│   │   │   └── AuthModal.jsx        # Login & Register modal
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── package.json
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)

### Step 1: Start Backend Server
```bash
cd server
npm start
```
*Backend runs on `http://localhost:5000` with WebSocket on port 5000.*

### Step 2: Start Frontend Client
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Pre-configured Demo Accounts
You can log in manually or use the **Switch** buttons in the navbar:

| Role | Name | Email | Password |
|---|---|---|---|
| **Employer** | TechPulse Solutions | `recruiter@techpulse.io` | `password123` |
| **Employer** | Nexus Cloud Innovations | `hr@nexuscloud.com` | `password123` |
| **Job Seeker** | Rahul Sharma (React Dev) | `rahul.sharma@example.com` | `password123` |
| **Job Seeker** | Priya Patel (UI Designer) | `priya.patel@example.com` | `password123` |
| **Job Seeker** | Amit Verma (Logistics) | `amit.verma@example.com` | `password123` |
