# 🚀 JobScout Step-by-Step Postman Collection Suite

This folder contains a complete, automated, modular Postman collection suite organized in chronological steps for testing every feature of the JobScout Fullstack Platform.

---

## 📂 File Index

| Step | Collection File | Description | Requests |
| :--- | :--- | :--- | :---: |
| **01** | `JobScout-01-Auth-Signup-Login.postman_collection.json` | System health check, phone OTP, seeker/employer onboarding, password login, profile, and geolocation. | 12 |
| **02** | `JobScout-02-Job-Seeker-Workflow.postman_collection.json` | Geospatial job search, AI match score, recommendations, bookmarks, applications, and offer acceptance. | 10 |
| **03** | `JobScout-03-Employer-Workflow.postman_collection.json` | Posting jobs, browsing seekers on radar, reviewing ATS candidates, status updates, and issuing offer letters. | 6 |
| **04** | `JobScout-04-Messaging-and-Networking.postman_collection.json` | In-app direct chat, conversation history, unread counts, network profiles, and skill endorsements. | 7 |
| **05** | `JobScout-05-Community-and-Anonymous-Salon.postman_collection.json` | Community feed posts, likes, comments, and anonymous workplace discussions with voting. | 7 |
| **06** | `JobScout-06-Multi-Channel-Alerts.postman_collection.json` | Instant WhatsApp link generation, Telegram notifications, alert settings, and SMTP configuration. | 6 |
| **07** | `JobScout-07-Master-Admin-Console.postman_collection.json` | Master administrator metrics, user moderation, verification badges, job controls, feature flags, and broadcasts. | 13 |
| **ALL** | `JobScout-All-Endpoints.postman_collection.json` | Complete all-in-one collection with all 7 modules combined. | 61 |

---

## 🌐 Environments

- **`JobScout-Local.postman_environment.json`**: Target `http://localhost:5000`
- **`JobScout-Production.postman_environment.json`**: Target `https://jobscout.onrender.com`

---

## ⚡ How to Import & Use

1. **Open Postman** and click **Import** in the top left.
2. Select all files in this folder (`docs/postman/`) and click **Import**.
3. In the top-right environment selector, choose **JobScout (Local Environment)**.
4. Run requests in sequential order (**Step 1 ➔ Step 7**).

### 🔄 Automatic Variable Chaining
- Login/Register requests automatically extract and save the JWT token to `{{token}}`, `{{seekerToken}}`, `{{employerToken}}`, or `{{adminToken}}`.
- Job creation automatically captures and saves `{{jobId}}`.
- Application submission automatically captures and saves `{{applicationId}}`.
- Post creation saves `{{postId}}`, and Anon discussions save `{{anonId}}`.

No manual copying and pasting of tokens or IDs is required!
