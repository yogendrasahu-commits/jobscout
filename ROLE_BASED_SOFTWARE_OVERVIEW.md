# 🧭 JobScout — Complete Role-Based Software Overview & Master Operating Guide
### Dedicated Manual for Employers (`emp`) & Job Seekers (`seeker`)

![JobScout Ecosystem Hero](https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format&fit=crop&q=80)

> **JobScout** is built with a **dual-engine architecture**. The user experience adapts dynamically depending on whether you log in as an **Employer / Recruiter (`emp`)** seeking top talent, or a **Job Seeker / Candidate (`seeker`)** navigating the real-time job market.
> 
> This handbook breaks down every feature, screen, workflow, and action available to both roles.

---

## 📑 Master Index

| Section | Target Audience | Primary Focus |
|---|---|---|
| [🏢 Part 1: Employer & Recruiter Master Guide](#-part-1-employer--recruiter-master-guide) | Founders, Talent Acquisition, Hiring Managers | Job Posting, Candidate Radar, ATS Pipeline, Offer Dispatch |
| [🎯 Part 2: Job Seeker & Candidate Master Guide](#-part-2-job-seeker--candidate-master-guide) | Engineers, Designers, Freelancers, Contractors | Geo-Discovery, 1-Click Apply, Speed Match, Offer Acceptance |
| [⚖️ Part 3: Feature Matrix & Side-by-Side Comparison](#-part-3-feature-matrix--side-by-side-comparison) | Both Roles | Capabilities, Permissions, and Data Visibility |
| [⚡ Part 4: Shared Core Infrastructure (WebRTC & Real-time)](#-part-4-shared-core-infrastructure) | Both Roles | P2P Video Calls, Chat Drawer, Spotlight Search (<kbd>Ctrl</kbd>+<kbd>K</kbd>) |

---

# 🏢 Part 1: Employer & Recruiter Master Guide

As an Employer on JobScout, your goal is to find, screen, and hire the highest-caliber talent in your geographical cluster within minutes rather than weeks.

### 1.1 Dropping a Job Pin on the Geospatial Radar
Traditional job boards hide listings in endless text lists. JobScout places your opening directly onto the city map.

#### Step-by-Step Instructions:
1. Click **`+ Post a Job`** in the top navigation bar or the left sidebar of the Feed.
2. **Set Geolocation**:
   * **Option A**: Click anywhere directly on the interactive Leaflet map to drop your job pin.
   * **Option B**: Type your company address (e.g. *One BKC, Bandra Kurla Complex, Mumbai*). Coordinates (`lat`, `lng`) auto-populate.
3. **Specify Job Parameters**:
   * **Job Title**: E.g., *Lead React & WebRTC Engineer*.
   * **Category**: Choose from *Tech / Engineering*, *Product & Design*, *Operations*, *Sales & Marketing*, or *Healthcare*.
   * **Work Mode**: Select `Onsite`, `Hybrid`, or `100% Remote`.
   * **Compensation Range**: Transparent CTC format (e.g. *₹22,00,000 - ₹30,00,000 / yr*).
   * **Tech Skills**: Tag required technologies (e.g., `React`, `Node.js`, `WebSockets`, `Tailwind`).
   * **🔥 Urgent Spot Hiring Toggle**: Check this box to give your map pin an animated orange flame glow and priority placement on the radar.
4. Click **`Publish to Live Radar`**.
   * Your opening is instantly broadcasted via Socket.IO to all active seekers in your city.

---

### 1.2 Talent Discovery & Sourcing via Live Radar
Employers don't have to wait for applications. You can actively discover verified professionals nearby.

* **Radar Map View**: Green pulsing markers represent active, verified job seekers. Clicking a marker reveals the candidate's name, primary tech stack, hourly/annual rate, and distance from your office.
* **Feed Recommended Widget**: The right sidebar continuously surfaces verified professionals matching your industry.
* **Instant Sourcing Actions on Every Profile**:
  * 📞 **Audio Call**: Test immediate availability with a direct voice call.
  * 📹 **Video Interview**: Trigger an instant face-to-face screening call.
  * 💬 **Direct Message**: Send a private message straight to their chat drawer.
  * `+ Connect`: Add candidate to your recruiter network list.

---

### 1.3 Managing the Recruiter ATS Candidate Pipeline
All inbound applications land in your centralized **Applicant Tracking System (ATS)**.

#### How to access:
Navigate to **`Jobs -> Candidate Applications`** (or click **`Candidate ATS Pipeline`** in the Feed left sidebar).

#### Pipeline Stages & Status Controls:
Each applicant card displays candidate contact info, pitch note, applied job title, and stage selector:

| Pipeline Stage | Visual Badge | Recruiter Action |
|---|---|---|
| **Pending** | 🟡 Yellow Pill | Review candidate pitch and resume |
| **Reviewed** | 🔵 Blue Pill | Move qualified candidates into review |
| **Interview** | 🟣 Purple Pill | Invite candidate to a live WebRTC screening interview |
| **Offered** | 🟠 Orange Pill | Formal offer letter generated and dispatched |
| **Hired** | 🟢 Emerald Pill | Candidate has accepted the job offer |
| **Rejected** | ⚪ Slate Pill | Politely close application with auto-notification |

---

### 1.4 Generating & Dispatching Official Job Offer Letters
When you find the right candidate, JobScout allows you to issue a formal stamped job offer letter directly through the system without generating manual PDFs or offline email chains.

#### Step-by-Step Dispatch:
1. In your **Candidate Applications** list, click **`Issue Offer Letter`** on the selected candidate.
2. Complete the offer specifications:
   * **Designation**: Confirmed job title.
   * **Finalized Salary / CTC**: E.g. *₹18,50,000 / yr*.
   * **Joining Date**: E.g. *Immediate (Within 7 Days)* or specific calendar date.
   * **Office Location**: E.g. *Bandra Kurla Complex (BKC), Mumbai*.
   * **Terms & Conditions**: Probation period, notice period, and benefits.
3. Click **`Send Official Offer Letter`**.
   * A unique serial number is generated (e.g. `JS-OFFER-491028`).
   * A formal stamped offer email is dispatched via Nodemailer directly to the candidate's email address.
   * An automated congratulatory message is posted into your in-app chat with the candidate.

---

# 🎯 Part 2: Job Seeker & Candidate Master Guide

As a Job Seeker on JobScout, you have full control over your career discovery, real-time proximity matching, and immediate direct access to hiring managers.

### 2.1 Setting Up Your Verified Candidate Profile
Your profile acts as your live interactive business card:
1. Click your avatar in the navbar or left feed column.
2. Edit your **Full Name**, **Headline** (e.g. *Senior Full-Stack Engineer • React / WebRTC*), **Years of Experience**, and **Hourly / Annual Expectations**.
3. Add your core technical competencies (e.g. `React`, `TypeScript`, `Node.js`, `Python`, `Tailwind CSS`).
4. Ensure the **`#OPENTOWORK`** badge is toggled ON to receive green pulsing visibility on the live employer radar map.

---

### 2.2 Finding Jobs on the Geospatial Radar
Instead of searching generic job listings with no sense of commute time, JobScout maps jobs to their physical work locations.

#### How to use the Radar:
1. Navigate to **`Radar Map`** in the top navigation bar.
2. **Adjust Radius**: Move the radius slider (5km, 10km, 25km, 50km) to see jobs within your preferred commute zone.
3. **Inspect Pins**:
   * Click any glowing purple pin to view the job title, company name, compensation, and exact calculated distance in kilometers (e.g. `2.4 km away`).
4. Click **`View Details & Apply`** to open the full job modal.

---

### 2.3 One-Click Application with Custom Pitch
Applying takes seconds and puts your pitch directly in front of the employer:
1. On any job card, click **`Quick Apply`**.
2. A streamlined modal opens pre-filled with your verified profile information.
3. Enter an optional **Pitch Note** (e.g., *"Hi, I have 5+ years building WebRTC video apps and can join immediately"*).
4. Click **`Submit Application`**.
   * The employer receives an immediate real-time alert with your contact details.

---

### 2.4 Reviewing and Accepting Official Offer Letters
When an employer selects you, you receive an official Offer Letter directly in the platform.

#### How to Accept:
1. Navigate to **`Jobs -> Applied Jobs`**.
2. Jobs with active offers show a vibrant **`🎉 Official Job Offer Received`** banner.
3. Click **`Review Offer Letter`** to inspect designation, salary, joining date, and terms.
4. Click **`Accept Offer & Join`**:
   * A full-screen canvas confetti celebration triggers.
   * A pure Web Audio celebration fanfare plays.
   * An automated acceptance email is dispatched to the employer.
   * Your status is updated to **`Hired`**.

---

### 2.5 Anonymous Salary & Workplace Intelligence Salon
Job seekers often wonder if an offer is fair or what other engineers are earning. JobScout solves this with the **Anonymous Salon (`AnonDiscuss`)**.

* Navigate to **`Salon`** in the navbar.
* Share salary benchmarks, interview feedback, or offer comparison questions with complete privacy.
* The system assigns you an anonymous pseudonym (e.g. *BKC Engineer #410*), ensuring your employer or recruiter cannot trace your identity.

---

# ⚖️ Part 3: Feature Matrix & Side-by-Side Comparison

| Feature / Capability | Employer (`emp`) | Job Seeker (`seeker`) | Guest Explorer |
|---|---|---|---|
| **Drop Pins & Post Jobs** | ✅ Full Access | ❌ Restricted | ❌ Restricted |
| **Browse Radar Map & Clusters** | ✅ Yes | ✅ Yes | ✅ Yes (Public pins) |
| **1-Click Apply with Pitch** | ❌ (Employers hire) | ✅ Full Access | 🔒 Prompts Sign-in |
| **Recruiter ATS Pipeline** | ✅ Full Dashboard | ❌ (Own applications only) | ❌ Restricted |
| **Issue Stamped Offer Letters** | ✅ Full Access | ❌ Restricted | ❌ Restricted |
| **Accept / Decline Offer Letters** | ❌ (Receives acceptance) | ✅ Full Access | ❌ Restricted |
| **WebRTC Video & Voice Calls** | ✅ 1-Click Direct | ✅ 1-Click Direct | 🔒 Prompts Sign-in |
| **Direct In-App Messaging** | ✅ Full Access | ✅ Full Access | 🔒 Prompts Sign-in |
| **Community Feed & Posts** | ✅ Post with #Hiring | ✅ Post with #OpenToWork | 👁️ Read-only |
| **Anonymous Salary Salon** | ✅ Read & Share | ✅ Read & Share | 👁️ Read-only |
| **Saved Jobs & Bookmarks** | ❌ N/A | ✅ Full Access | 🔒 Prompts Sign-in |
| **Global Spotlight (<kbd>Ctrl</kbd>+<kbd>K</kbd>)** | ✅ Full Search | ✅ Full Search | ✅ Full Search |

---

# ⚡ Part 4: Shared Core Infrastructure

### 4.1 Encrypted P2P WebRTC Calling
No meeting links, no downloads. Clicking 📞 (Audio) or 📹 (Video) triggers a direct browser-to-browser peer connection:
* **Mic & Camera Mute**: Instant toggling with audio wave visualizer.
* **Screen Sharing**: Broadcast your screen with 1-click for code walk-throughs or resume reviews.
* **Call Duration HUD**: Live interview stopwatch.

---

### 4.2 Sliding Chat Drawer
Stay connected with hiring managers or candidates without navigating away from your active map or feed:
* Accessible via the message icon on the bottom right or directly from any user profile card.
* Real-time delivery with online presence indicator.

---

### 4.3 Global Spotlight Command Palette (<kbd>Ctrl</kbd> + <kbd>K</kbd>)
Press <kbd>Ctrl</kbd> + <kbd>K</kbd> (or <kbd>Cmd</kbd> + <kbd>K</kbd> on macOS) anywhere in the application to summon the universal spotlight search:
* Search any job title, company name, skill, or verified candidate.
* Jump directly to city hubs (*BKC, Koramangala, Gurgaon*).
* Execute quick navigation actions without touching your mouse.

---

*JobScout Enterprise Master Manual © 2026. Made with pride in India 🇮🇳.*
