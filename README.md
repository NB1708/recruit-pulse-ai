# 🚀 RecruitPulse AI — The Intelligent Recruitment Command Center

> **Built for Hunar.AI | Powered by Groq LLaMA 3.3 | BE10X AI Hackathon 2026**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-recruitpulse--ai.lovable.app-brightgreen)](https://recruitpulse-ai.lovable.app/)
[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-blueviolet)](https://lovable.dev)
[![Powered by Groq](https://img.shields.io/badge/AI-Groq%20LLaMA%203.3-orange)](https://groq.com)
[![Google Sheets](https://img.shields.io/badge/Data-Google%20Sheets%20Live-34A853)](https://sheets.google.com)

---

## 🎯 The Problem

Modern recruitment teams drown in data. Recruiters manually track hundreds of candidates across spreadsheets, missing critical follow-ups, overlooking stuck pipelines, and spending 30+ minutes every morning just understanding where things stand.

**RecruitPulse AI eliminates all of that.**

---

## ✨ What It Does

RecruitPulse AI is a **real-time, AI-powered recruitment dashboard** that gives recruitment teams full visibility into their hiring pipeline — and uses AI to take action automatically.

### 📊 Dashboard
- **Live KPI Tracking**: Active Pipeline, Joinings, Stuck Candidates, Backout Risk, Total Revenue
- **Smart Mismatch Alerts**: Automatically detects when EOD sheet lineups don't match the master tracker pipeline
- **Hiring Funnel Visualization**: Shows drop-off rates at every stage (FB Pending → CV Shortlisted → Process → Offered)
- **Client Status Breakdown**: Real-time view of Backout, Reject, FB Pending, Interview Reject, and Hold statuses
- **Recruiter Leaderboard**: Ranks recruiters by Calls, Lineups, Selections, Joinings, Revenue, and composite Score

### 👥 Candidates
- **Stuck Pipeline View**: Instantly see every candidate stuck in the pipeline with days stuck, recruiter, role, and contact
- **Smart Filters**: Filter by Recruiter, Stage, and Status simultaneously
- **One-Click AI Action**: Trigger AI-powered follow-up directly from the candidate row

### 🤖 WhatsApp AI
- **Personalized Message Generation**: AI generates a human-sounding, context-aware WhatsApp message for each stuck candidate
- **Full Context Awareness**: Uses candidate name, role, organization, recruiter, days stuck, and status to craft the perfect message
- **One-Click Copy**: Recruiters copy and send in seconds — no manual drafting

### 📋 Client Analysis
- Deep-dive AI analysis of client-wise performance, backout patterns, and pipeline health

### 🌅 Daily Briefing
- **Personalized Morning Report**: Every recruiter gets a custom AI briefing with Today's Numbers, Priority Actions, At-Risk Candidates, AI Tips, and Quick Wins
- **Zero Manual Effort**: The AI reads live data and writes the full briefing automatically every morning

---

## 🧠 How AI Is Used

| Feature | AI Model | Purpose |
|---|---|---|
| WhatsApp Message Generator | **Groq LLaMA 3.3-70B** | Generate personalized candidate follow-up messages |
| Daily Briefing | **Groq LLaMA 3.3-70B** | Summarize live pipeline data into actionable recruiter briefs |
| Mismatch Detection | **Rule-Based AI Logic** | Flag data inconsistencies between EOD sheet and master tracker |
| Priority Ranking | **AI Scoring Engine** | Rank candidates by urgency (days stuck × backout risk) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS |
| **UI Components** | Radix UI, shadcn/ui |
| **AI Engine** | Groq SDK (LLaMA 3.3-70B-Versatile) |
| **Data Layer** | Google Sheets API (Live Sync) |
| **Authentication** | Google OAuth 2.0 |
| **Charts** | Recharts |
| **State Management** | TanStack React Query |
| **Build Tool** | Vite |
| **Deployment** | Lovable (lovable.app) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn
- Google Cloud account
- Groq account

### Step 1: Clone the Repository

```bash
git clone https://github.com/NB1708/recruit-pulse-ai.git
cd recruit-pulse-ai
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Setup Environment Variables

#### 3a. Get Groq API Key
1. Go to [Groq Console](https://console.groq.com/)
2. Sign up / Log in
3. Navigate to **API Keys**
4. Click **Create New API Key**
5. Copy the key (starts with `gsk_`)
6. Keep it safe — you'll need it in the next step

#### 3b. Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing):
   - Click **Select a Project** → **New Project**
   - Name it "RecruitPulse AI"
   - Click **Create**
3. Enable Google Sheets API:
   - In the search bar, search for **"Google Sheets API"**
   - Click **Enable**
4. Create OAuth 2.0 Client ID:
   - Go to **Credentials** (left sidebar)
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - If prompted, configure the OAuth consent screen first:
     - User Type: **External**
     - Fill in App name: "RecruitPulse AI"
     - User support email: your email
     - Developer contact info: your email
     - Click **Save & Continue** (skip optional scopes)
     - Click **Save & Continue** again
   - After consent screen, return to creating OAuth Client ID
   - Application type: **Web application**
   - Name: "RecruitPulse Frontend"
   - Authorized redirect URIs (add both):
     - `http://localhost:5173` (for local development)
     - `http://localhost:3000` (if using different dev port)
     - `https://your-production-domain.com` (when deployed)
   - Click **Create**
5. Copy your **Client ID** (looks like `xxx-yyy.apps.googleusercontent.com`)

#### 3c. Get Google Sheets ID
1. Open your recruitment master spreadsheet in Google Sheets
2. Copy the ID from the URL:
   - URL: `https://docs.google.com/spreadsheets/d/1xxxxxxxxxxx/edit`
   - ID: `1xxxxxxxxxxx`

#### 3d. Create `.env.local` File
1. Copy the template file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` in your editor
3. Fill in your credentials:
   ```env
   VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
   VITE_GOOGLE_SHEETS_ID=1xxxxxxxxxxxxxxxxxxx_xxxxxxxxxxxxxxxxxx
   VITE_APP_URL=http://localhost:5173
   ```

**⚠️ Important**: Never commit `.env.local` to Git. It's already in `.gitignore`.

### Step 4: Start Development Server

```bash
npm run dev
```

Your app will be available at `http://localhost:5173`

---

## 📁 Google Sheets Structure

Your master Google Sheet should have the following columns:
- **Candidate Name** — Full name of the candidate
- **Role** — Position they applied for
- **Organization** — Company/Client name
- **Recruiter** — Recruiter assigned
- **Status** — (FB Pending, CV Shortlisted, Process, Offered, etc.)
- **Days Stuck** — Days in current status
- **Contact** — Phone/Email for follow-up
- **Backout Risk** — High/Medium/Low assessment

---

## 💼 Real-World Impact

| Metric | Before RecruitPulse AI | After |
|---|---|---|
| Morning reporting time | 30+ minutes manual | **< 30 seconds** (Daily Briefing) |
| Stuck candidate follow-up | Missed regularly | **100% visibility** |
| WhatsApp message drafting | 5-10 mins per candidate | **< 5 seconds** |
| Data mismatch detection | Weekly manual audit | **Real-time alert** |

---

## 🔒 Security Best Practices

✅ **DO:**
- Store credentials in `.env.local` (not in code)
- Add `.env.local` to `.gitignore`
- Rotate API keys regularly
- Use different OAuth Client IDs for dev/production

❌ **DON'T:**
- Commit `.env.local` to GitHub
- Share API keys in emails or documentation
- Use the same credentials across environments
- Expose keys in browser console logs

---

## 📝 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

---

## 🚢 Deployment

### Using Lovable (Recommended)
1. Push your code to GitHub
2. Connect your repo to [Lovable](https://lovable.dev)
3. Set environment variables in Lovable dashboard
4. Deploy with one click

### Using Vercel / Other Platforms
1. Build the project: `npm run build`
2. Deploy the `dist/` folder
3. Set environment variables in platform dashboard

---

## 👤 Built By

**NB1708** — BE10X AI Hackathon 2026 Submission  
Built using [Google Antigravity](https://antigravity.google.com/) + [Lovable](https://lovable.dev) + [Groq](https://groq.com)

---

## 📄 License

MIT License — Free to use and build upon.

---

## 🆘 Troubleshooting

### OAuth Login Not Working
- ✓ Check that `VITE_GOOGLE_CLIENT_ID` is set correctly
- ✓ Verify redirect URI matches in Google Cloud Console
- ✓ Clear browser cache and cookies

### Can't Fetch Google Sheets Data
- ✓ Verify `VITE_GOOGLE_SHEETS_ID` is correct
- ✓ Ensure Google Sheets API is enabled in Cloud Console
- ✓ Check that the sheet is accessible to your OAuth account

### Groq API Errors
- ✓ Verify `VITE_GROQ_API_KEY` is correct
- ✓ Check Groq Console for API quota limits
- ✓ Ensure you have remaining API credits

---

## 📬 Questions or Issues?

Open an issue on [GitHub](https://github.com/NB1708/recruit-pulse-ai/issues) or reach out to the maintainer.

---

**🌐 Live Demo**: [recruitpulse-ai.lovable.app](https://recruitpulse-ai.lovable.app/)
