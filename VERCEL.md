# Deploying ProjectPilot AI on Vercel

This guide provides step-by-step instructions for deploying ProjectPilot AI as a high-performance, single-page client application (SPA) on Vercel.

---

## Deployment Methods

You can deploy this project to Vercel in two ways: **Vercel Git Integration** (recommended) or **Vercel CLI**.

### Option A: Deploy with Git Integration (Recommended)
1. Push your ProjectPilot AI workspace code to a GitHub, GitLab, or Bitbucket repository.
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** > **Project**.
3. Import your project repository.
4. Configure the build settings as described below and click **Deploy**.

### Option B: Deploy with Vercel CLI
1. Install the Vercel CLI locally:
   ```bash
   npm install -g vercel
   ```
2. Log in and deploy from the root of your project:
   ```bash
   vercel
   ```
3. To deploy to production:
   ```bash
   vercel --prod
   ```

---

## Build & Project Configuration

Ensure the following configuration settings are set in Vercel:

* **Framework Preset:** `Vite` (Vercel will auto-detect this)
* **Build Command:** `vite build` or `npm run build`
* **Output Directory:** `dist`
* **Root Directory:** `./`

> **Note:** Our project includes a standard `vercel.json` file in the root which automatically instructs Vercel's Edge network to rewrite all frontend URLs to `/index.html`. This ensures that your client-side routing and page transitions work smoothly on direct browser refreshes.

---

## Environment Variables (Optional)

If you wish to connect your deployed applet to a live Lemma workflow, add the following Environment Variables in the **Environment Variables** section of your Vercel Project Settings:

| Environment Variable | Type | Description |
| :--- | :--- | :--- |
| `VITE_LEMMA_POD_ID` | Public (Client) | Your Lemma Pod ID reference |
| `VITE_LEMMA_WORKFLOW` | Public (Client) | Name of your target Lemma Workflow run |
| `VITE_LEMMA_API_URL` | Public (Client) | Custom Lemma API URL if applicable |

If these are not configured, ProjectPilot AI will gracefully fall back to the secure and robust client-side semantic parser (`parseTextLocally`), allowing you to analyze project transcripts and interact with the dashboard entirely in the browser!

---

## Verification Checklist after Deployment
* [x] **Home / Landing Page** renders correctly with smooth entry motion.
* [x] **Analysis Workspace** processes unstructured project notes.
* [x] **File Uploads** (.txt, .pdf, .docx) validate sizes and parse data smoothly.
* [x] **Interactive Dashboard** displays task stats, priority badges, and risks.
* [x] **SPA Page Transitions** navigate seamlessly with zero full-page reloads.
