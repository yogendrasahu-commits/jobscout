# 🧭 JobScout Platform — Complete Visual User Manual with Live Screens
### (संपूर्ण विस्तृत उपयोगकर्ता मार्गदर्शिका — प्रत्येक स्क्रीन के साथ)

![JobScout Ecosystem Hero](https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format&fit=crop&q=80)

> **JobScout** is a real-time geospatial hiring ecosystem combining **Uber-style live radar discovery**, **LinkedIn-grade professional networking**, **Indeed-scale job marketplace**, and **zero-latency peer-to-peer WebRTC video screening**.
> 
> This manual provides a complete screen-by-screen breakdown with visual screenshots, operational instructions, and role-specific guides for both **Job Seekers (`seeker`)** and **Employers (`emp`)**.

---

## 📑 Screen-by-Screen Table of Contents
1. [Screen 1: Welcome Gateway & City Presets](#-screen-1-welcome-gateway--city-presets)
2. [Screen 2: Geospatial Radar & Interactive Map Engine](#-screen-2-geospatial-radar--interactive-map-engine)
3. [Screen 3: Social Community Feed with Sticky Sidebars](#-screen-3-social-community-feed-with-sticky-sidebars)
4. [Screen 4: Job Card Details & One-Click Apply Modal](#-screen-4-job-card-details--one-click-apply-modal)
5. [Screen 5: Interactive Map Pin Drop & Post Job Modal](#-screen-5-interactive-map-pin-drop--post-job-modal)
6. [Screen 6: Recruiter ATS Pipeline & Offer Letters](#-screen-6-recruiter-ats-pipeline--offer-letters)
7. [Screen 7: Verified Candidate LinkedIn Profile Modal](#-screen-7-verified-candidate-linkedin-profile-modal)
8. [Screen 8: Real-Time In-App Chat Drawer](#-screen-8-real-time-in-app-chat-drawer)
9. [Screen 9: Encrypted WebRTC Video Interview Modal](#-screen-9-encrypted-webrtc-video-interview-modal)
10. [Universal Spotlight (<kbd>Ctrl</kbd> + <kbd>K</kbd>) & Keyboard Shortcuts](#-universal-spotlight--keyboard-shortcuts)

---

## 🌟 Screen 1: Welcome Gateway & City Presets

The **Welcome Gateway** is the high-conversion front door of JobScout, allowing users to choose their role, explore without login, or jump instantly to major tech hubs.

### Key Features on this Screen:
* **One-Click Role Selection**: Seamlessly toggle between **Job Seeker (`seeker`)** and **Employer (`emp`)**.
* **⚡ Guest Preview Mode**: Click **`Guest Preview (बिना लॉगिन देखें)`** to immediately explore the live radar map, candidate directories, and community feed without entering credentials.
* **Instant City Hub Teleportation**: One-click jump buttons in the header for:
  * 📍 **Mumbai BKC** (Bandra Kurla Complex) — Financial & IT Hub
  * 📍 **Bengaluru Koramangala / HSR** — Startup Unicorn Belt
  * 📍 **Gurgaon Cyber City** — Enterprise Corporate Tech
  * 📍 **Pune Hinjewadi** — Software Development Park
  * 📍 **Hyderabad HITEC City** — Cloud & AI Center
* **Unified Authentication Card**: Clean phone OTP and password login with instant demo credentials for immediate testing.

---

## 🗺️ Screen 2: Geospatial Radar & Interactive Map Engine

The **Geospatial Radar** maps all local openings and verified talent onto physical geography using high-precision Leaflet raster tiles and custom SVG pulse beacons.

### Key Features on this Screen:
* **Hardware-Accelerated Radar Beacons**:
  * 🟣 **Purple Beacon**: Active Job Openings with live salary bracket tag.
  * 🟢 **Green Beacon**: Verified Candidates available for immediate interview.
  * 🟠 **Flame Beacon**: Urgent Spot Hiring openings.
  * 🔵 **Blue Dot**: Your exact GPS position with radar wave rings.
* **Dynamic Radius Filter Slider**: Adjust your radar search distance from **5 km** to **50 km**.
* **Precise Commute Math**: Distances are computed using the **Haversine formula**, showing exact travel estimates (e.g. `~10m • 4.2 km`).
* **Direct Interactive Popups**: Click any beacon to reveal company details, salary, and 1-click **`View Details & Apply`** or **`Call Now`** triggers.

---

## 📰 Screen 3: Social Community Feed with Sticky Sidebars

The **Feed Screen** brings the professional network to life with persistent sticky navigation, live market trends, and instant speed matchmaking.

### Key Features on this Screen:
* **Left Pinned Sidebar (`sticky top-20`)**:
  * **Identity Card**: Verified shield badge, dynamic role tag (`#OPENTOWORK` / `#HIRING`), and profile editor trigger.
  * **Live Metrics**: Active Openings (`jobs.length`), Verified Talent (`seekers.length`), and Applications counter.
  * **Quick Shortcuts**: 1-click links to Radar Map, ATS Pipeline, Speed Video Connect, Anonymous Salary Salon, and Saved Opportunities.
* **Center Stream**: Post creation drawer with image URL support, role tagging, optimistic like counts, and threaded comments.
* **Right Pinned Sidebar (`sticky top-20`)**:
  * **⚡ WebRTC Speed Match Card**: Dark indigo glass card with pulsing emerald radar dot and instant **`[ Launch Speed Match ]`** CTA.
  * **Verified Professionals**: Live talent cards with 1-click 📞 Audio Call, 📹 Video Interview, and 💬 Chat triggers.
  * **JobScout Market Trends**: Clickable tech trends navigating to relevant jobs and compensation benchmarks.
* **Floating `[ ↑ Back to Top ]` Action**: Smoothly appears when scrolled past 350px for effortless navigation.

---

## 💼 Screen 4: Job Card Details & One-Click Apply Modal

Clicking any job on the radar or jobs board opens the comprehensive **Job Inspection & Quick Apply Modal**.

### Key Features on this Screen:
* **Comprehensive Job Intelligence**:
  * Official designation, company name, office address, and exact commute distance.
  * Transparent CTC compensation (e.g. `₹18,00,000 - ₹25,00,000 / yr`).
  * Work Mode pill (`100% Remote`, `Hybrid`, `Onsite`) and Employment Type.
* **Elevator Pitch Note**: Candidates can attach an optional 2-sentence pitch note explaining their immediate availability.
* **Instant Direct Communication**: Candidates can choose to **`Quick Apply`**, initiate a **`Direct Chat`**, or start an **`Instant Video Interview`** right from the modal.
* **1-Click Bookmark**: Toggle the bookmark icon to save the job to your **Saved Opportunities** list.

---

## 📍 Screen 5: Interactive Map Pin Drop & Post Job Modal

Employers can publish new job opportunities in under 60 seconds by dropping a pin directly onto the city map.

### Key Features on this Screen:
* **Visual Map Pin Drop**: Click anywhere on the interactive map to automatically capture exact latitude and longitude coordinates.
* **Rich Job Specification**:
  * Role title, category selector, employment type, and transparent salary bracket.
  * Required technical skills tagging (`React`, `WebRTC`, `Node.js`, etc.).
  * **🔥 Urgent Spot Hiring Toggle**: Gives the job pin a prominent orange flame glow on the live radar.
* **Instant Real-Time Broadcast**: Clicking **`Publish to Live Radar`** sends a WebSocket broadcast event to all job seekers within the city radius.

---

## 📋 Screen 6: Recruiter ATS Pipeline & Offer Letters

The **Applicant Tracking System (ATS)** gives employers complete visibility over their hiring funnel, from application to digital offer letter dispatch.

### Key Features on this Screen:
* **5-Stage Hiring Funnel**:
  1. 🟡 **Pending**: Newly submitted candidate applications.
  2. 🔵 **Reviewed**: Screened and shortlisted candidates.
  3. 🟣 **Interview**: Scheduled for live WebRTC video screening.
  4. 🟠 **Offered**: Official stamped job offer letter dispatched.
  5. 🟢 **Hired**: Candidate has accepted and joined.
* **Kanban Board & List Modes**: Toggle between multi-column Kanban view and high-density list view.
* **Official Stamped Offer Letter Dispatch**:
  * Auto-generates unique reference numbers (e.g. `JS-OFFER-782910`).
  * Specifies finalized CTC, joining date, and employment terms.
  * Dispatches formal offer email directly to the candidate's verified inbox.
  * Prompts candidate with 1-click **`Accept Offer & Join`** triggering celebratory confetti.

---

## 👤 Screen 7: Verified Candidate LinkedIn Profile Modal

Clicking on any candidate card opens their full verified professional profile modal.

### Key Features on this Screen:
* **Verified Identity Header**: Profile avatar, `#OPENTOWORK` emerald badge, verified shield checkmark, and current location.
* **Technical Competency Matrix**: Endorsed skills chips with community endorsement counts.
* **Experience & Compensation**: Years of experience, expected hourly/annual CTC, and immediate availability status.
* **One-Click Communication Bar**: 
  * 📞 Voice Call
  * 📹 HD Video Call
  * 💬 Direct Message
  * `+ Connect` Network Toggle

---

## 💬 Screen 8: Real-Time In-App Chat Drawer

The **Chat Drawer** slides out smoothly from the right side of the screen without losing your active map, job search, or feed position.

### Key Features on this Screen:
* **Persistent Drawer Context**: Chat with candidates or recruiters while browsing the live map in the background.
* **Real-Time WebSocket Delivery**: Zero latency message transmission powered by Socket.IO.
* **Automated System Event Cards**: When an offer letter is issued or accepted, rich system notification cards are generated directly in the conversation thread.
* **Online Presence Dots**: Real-time green dots indicate when the peer is actively online.

---

## 📹 Screen 9: Encrypted WebRTC Video Interview Modal

JobScout eliminates the need for Zoom or Google Meet links by providing **native, browser-to-browser encrypted WebRTC video calling**.

### Key Features on this Screen:
* **Zero-Download Direct Calling**: Call any candidate or recruiter with one click directly inside Chrome, Safari, Edge, or Firefox.
* **In-Call Production Controls**:
  * 🎙️ **Microphone Mute / Unmute** with live Web Audio frequency visualizer.
  * 📷 **Camera Toggle** (Switch seamlessly between video and voice-only mode).
  * 🖥️ **Screen Sharing**: Broadcast your code editor, slide deck, or Figma canvas for live technical interviews.
  * ⏱️ **Call Duration Stopwatch**: Live timer tracking the interview length.
  * 🗂️ **Profile Peek**: Open candidate resume and technical skills drawer without leaving the video call.

---

## ⌨️ Universal Spotlight & Keyboard Shortcuts

Pressing <kbd>Ctrl</kbd> + <kbd>K</kbd> (or <kbd>Cmd</kbd> + <kbd>K</kbd> on macOS) summons the universal glassmorphic spotlight search from any screen.

| Shortcut | Action | Description |
|---|---|---|
| <kbd>Ctrl</kbd> + <kbd>K</kbd> | **Global Spotlight Search** | Jump to any job, candidate, company, or navigation tab |
| <kbd>Esc</kbd> | **Dismiss Drawer / Modal** | Quick close for chat drawers, video calls, and profile cards |
| <kbd>Enter</kbd> | **Send Direct Chat** | Post message in chat drawer or feed comments |
| <kbd>Space</kbd> / <kbd>M</kbd> | **Toggle Mute Microphone** | During WebRTC Video Call |
| **Pill Click** | **Scroll to Top** | Click the floating `↑ Back to Top` button in the feed |

---

*JobScout Platform Documentation © 2026. Made with pride in India 🇮🇳.*
