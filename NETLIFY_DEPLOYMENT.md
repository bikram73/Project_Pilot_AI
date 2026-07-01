# Netlify Deployment Guide

This guide will help you deploy your ProjectPilot AI with working Lemma integration to Netlify.

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository
Make sure your code is committed and pushed to your Git repository (GitHub, GitLab, etc.).

### 2. Create a New Netlify Site
1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, etc.)
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build:netlify`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

### 3. Set Environment Variables
In your Netlify site dashboard, go to **Site settings** → **Environment variables** and add:

#### Required Lemma Variables:
```
LEMMA_API_URL=https://api.lemma.work
LEMMA_POD_ID=YOUR_POD_ID_HERE
LEMMA_WORKFLOW=project-analysis-workflow
LEMMA_SESSION_TOKEN=YOUR_SESSION_TOKEN_HERE
```

#### Required Gemini Variables (for fallback):
```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

#### Optional Variables:
```
NODE_VERSION=20
```

### 4. Deploy
After setting the environment variables, trigger a new deployment:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

## 🏗️ How It Works

### Architecture
- **Frontend**: React app built with Vite, served as static files
- **Backend**: Netlify Functions handle API requests
- **Analysis**: Tries Lemma first, falls back to Gemini if needed

### API Endpoints
All API requests are handled by Netlify Functions:
- `POST /api/analyze` → `/.netlify/functions/analyze`
- `GET /api/analyze/latest` → `/.netlify/functions/analyze`
- `POST /api/chat` → `/.netlify/functions/chat`
- `GET /api/tasks` → `/.netlify/functions/tasks`

### Environment Variables Explained
- **LEMMA_POD_ID**: Your unique Pod identifier from Lemma dashboard
- **LEMMA_SESSION_TOKEN**: Your authentication token for Lemma API
- **LEMMA_WORKFLOW**: The workflow name (default: "project-analysis-workflow")
- **GEMINI_API_KEY**: Google Gemini API key for fallback analysis

## 🔧 Getting Your Lemma Credentials

### Pod ID
1. Go to your Lemma dashboard
2. Your Pod ID is visible in the URL or dashboard header
3. Example: `019f0d4a-33ad-75da-bc5d-43561cba9491`

### Session Token
1. In Lemma dashboard, go to Settings
2. Generate or copy your API token
3. This is sensitive - keep it secure

### Workflow Name
1. In your Lemma Pod, find your workflow
2. The name should be `project-analysis-workflow`
3. Make sure it's published and active

## 🚨 Troubleshooting

### Build Fails
- Check that Node.js version is set to 20
- Verify all dependencies are in package.json
- Check build logs for missing environment variables

### Lemma Integration Not Working
- Verify LEMMA_POD_ID is correct
- Check LEMMA_SESSION_TOKEN is valid
- Ensure workflow is published in Lemma
- Check function logs in Netlify dashboard

### Falling Back to Gemini
- This is normal if Lemma is unavailable
- Check Netlify function logs for Lemma error details
- Verify GEMINI_API_KEY is set for fallback

## 📊 Monitoring

After deployment:
1. Test the analyze functionality
2. Check Netlify function logs for any errors
3. Monitor the Lemma dashboard for workflow runs
4. Verify both Lemma and Gemini fallback work

## 🔄 Updates

To update your deployment:
1. Push changes to your Git repository
2. Netlify will automatically rebuild and deploy
3. Function code updates require a new deployment

---

Your ProjectPilot AI with Lemma integration should now be live on Netlify! 🎉