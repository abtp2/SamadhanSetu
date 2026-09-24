# SamadhanSetu (समाधान सेतु)

> **Smart India Hackathon 2026**  
> **Problem Statement 26043:** *A digital platform to crowdsource societal challenges and facilitate collaborative problem solving through universities and industry partnerships.*

---

## 🏛️ Executive Summary

**SamadhanSetu** is an end-to-end civic innovation and collaborative problem-solving platform tailored for the state of Jharkhand. It bridges grassroot community grievances with academic engineering labs, corporate CSR capital, and government oversight.

### The 6-Stage Civic Innovation Lifecycle

```
[1. Report]      Citizen geotags issue with photos, population, & perceived urgency.
       │
       ▼
[2. AI Triage]   Gemini AI structures summary, scores severity (1-10), checks duplicates, & recommends domains.
       │
       ▼
[3. Verify]      State nodal officer validates problem and publishes to university portal.
       │
       ▼
[4. Adopt]       University student & faculty team adopts challenge, forming a technical taskforce.
       │
       ▼
[5. Fund/Mentor] Industry CSR foundation (Tata Steel, BCCL, SAIL) commits grants and testing corridors.
       │
       ▼
[6. Pilot]       Team executes milestone deliverables; field pilot is validated; govt records measurable impact.
```

---

## 🚀 Key Highlights & Architecture

- **Clients:**
  - **Web Client (`/web`):** Vite + React (Pure JavaScript), Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet OpenStreetMap, Recharts.
  - **Mobile Client (`/mobile`):** Expo React Native (Pure JavaScript), React Navigation Bottom Tabs & Native Stack, GPS Geotagging (`expo-location`), Image selection (`expo-image-picker`), Leaflet in WebView.
- **Shared Backend (`/server`):**
  - Node.js + Express REST APIs
  - MongoDB Atlas + Mongoose (with embedded `mongodb-memory-server` fallback for zero-friction local grading)
  - JWT Authentication & Role-Based Access Control (RBAC) across 5 distinct roles
  - **Gemini AI Free-Tier Integration:** Problem categorization, severity scoring, duplicate detection, and university recommendations (cached in MongoDB to preserve API quota). Intelligent heuristic fallback when API key is not supplied.
  - **Leaflet + OpenStreetMap:** Lightweight, open-source geospatial mapping without expensive third-party map keys.

---

## 👥 Demo Accounts (5 Roles)

Every role can be tested instantly using the **Evaluator Persona Bar** at the top of the web portal, or by logging in with:

| Role | Demo User | Email | Password | District | Affiliation |
|---|---|---|---|---|---|
| **Citizen** | Sunita Devi | `citizen@samadhansetu.gov.in` | `password123` | Ranchi | Community Lead |
| **Student** | Aarav Verma | `student@bitmesra.ac.in` | `password123` | Ranchi | BIT Mesra Innovator |
| **University** | Dr. Rajiv Kumar | `faculty@nitjsr.ac.in` | `password123` | Jamshedpur | NIT JSR Faculty Mentor |
| **Industry** | Rohan Deshmukh | `csr@tatasteel.com` | `password123` | Jamshedpur | Tata Steel CSR |
| **Admin** | Director S. K. Soren | `admin@jharkhand.gov.in` | `password123` | Ranchi | Higher Education & IT Dept |

---

## 🗺️ Realistic Jharkhand Seed Dataset

The platform comes pre-seeded with 10 realistic challenges across 5 key Jharkhand districts and 10 official categories:

1. **Ranchi (Water & Sanitation):** High Fluoride Contamination in Drinking Handpumps (*Adopted by BIT Mesra; 68% complete; funded by Tata Steel CSR*).
2. **Dhanbad (Environment):** Coal Mine Dust & Particulate Matter Spikes (*Adopted by IIT ISM Dhanbad; 50% complete; funded by BCCL CSR*).
3. **Jamshedpur (Energy):** Transformer Burnouts for Agricultural Irrigation Feeder Lines (*Piloting with NIT Jamshedpur*).
4. **Bokaro (Agriculture):** Post-Harvest Tomato & Vegetable Spoilage (*Verified awaiting university adoption*).
5. **Hazaribagh (Accessibility):** Lack of Physical Ramps in Sadar Referral Hospital (*Verified awaiting university adoption*).
6. **Hazaribagh (Rural Livelihoods):** Extinction Risk to Sohrai & Khovar GI-tag Mural Craft (*Implemented*).
7. **Ranchi (Urban Infrastructure):** Collapsed Culvert Severing Emergency Hospital Access.
8. **Bokaro (Education):** Digital Lab Infrastructure Divide in High School.
9. **Jamshedpur (Healthcare):** Delayed Sickle Cell Anemia Screening in Tribal PHCs (*Resolved*).
10. **Dhanbad (Public Services):** Manual PDS Ration Card Grievance Congestion.

---

## 💻 Getting Started

### 1. Start Shared Backend (`/server`)
```bash
cd server
npm install
npm start
```
*The server boots on `http://localhost:5000` and automatically populates the Jharkhand dataset if the database is empty.*

### 2. Start Web Portal (`/web`)
```bash
cd web
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

### 3. Start Mobile App (`/mobile`)
```bash
cd mobile
npm install
npm start
```
*Scan the QR code with Expo Go on Android or run in web/emulator.*

---

## 📡 REST API Index

- `POST /api/auth/login` - Authenticate and return JWT token
- `POST /api/auth/register` - Register citizen, student, faculty, or CSR partner
- `GET /api/auth/me` - Current authenticated user profile
- `GET /api/challenges` - List challenges with filters (`district`, `category`, `status`, `search`)
- `GET /api/challenges/:id` - Full challenge details + AI analysis + Project progress
- `POST /api/challenges` - Citizen reports challenge (triggers automatic Gemini AI analysis)
- `POST /api/projects/adopt` - Student or university team adopts verified challenge
- `GET /api/projects/:id` - Project roadmap, milestones, team members, and CSR offers
- `POST /api/projects/:id/milestones` - Add deliverable milestone
- `PATCH /api/projects/:id/milestones/:mId/verify` - Faculty or admin verifies milestone
- `POST /api/collaborations` - Industry CSR submits funding or mentorship offer
- `PATCH /api/admin/verify/:id` - State admin validates challenge and assigns priority
- `GET /api/analytics/dashboard` - Comprehensive state-level impact aggregates & charts

---

## 📄 License
Developed for Smart India Hackathon 2026. All rights reserved.
