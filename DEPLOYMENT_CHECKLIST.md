# 🚀 Netlify Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Repository Ready
- [x] Code committed and pushed to GitHub
- [x] All dependencies updated in package.json
- [x] Netlify functions created with Lemma integration
- [x] Build scripts configured (`npm run build:netlify`)

### 2. Required Files
- [x] `netlify.toml` - Build and redirect configuration
- [x] `netlify/functions/analyze.js` - Main analysis with Lemma + Gemini
- [x] `netlify/functions/chat.js` - Chat functionality  
- [x] `netlify/functions/tasks.js` - Tasks endpoint
- [x] `netlify/functions/risks.js` - Risks endpoint
- [x] `netlify/functions/summary.js` - Summary endpoint
- [x] `netlify/functions/health.js` - Health check endpoint
- [x] `netlify/functions/package.json` - Function dependencies

## 🛠️ Netlify Configuration

### 1. Build Settings
- **Build command**: `npm run build:netlify`
- **Publish directory**: `dist`  
- **Functions directory**: `netlify/functions`
- **Node version**: `20`

### 2. Environment Variables (CRITICAL!)

#### Lemma Configuration (Primary)
```
LEMMA_API_URL=https://api.lemma.work
LEMMA_POD_ID=YOUR_POD_ID_HERE
LEMMA_SESSION_TOKEN=YOUR_SESSION_TOKEN_HERE  
LEMMA_WORKFLOW=project-analysis-workflow
```

#### Gemini Configuration (Fallback)
```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

### 3. Domain & SSL
- [x] Custom domain (optional)
- [x] HTTPS enabled (automatic)
- [x] CORS headers configured

## 🧪 Testing Checklist

After deployment, test these endpoints:

### Core Functionality
- [ ] `GET /api/health` - Should return healthy status
- [ ] `POST /api/analyze` - Should work with Lemma (check logs)
- [ ] `GET /api/analyze/latest` - Should return cached results
- [ ] `GET /api/tasks` - Should return task list
- [ ] `GET /api/risks` - Should return risk list  
- [ ] `GET /api/summary` - Should return project summary

### Frontend
- [ ] React app loads correctly
- [ ] Analysis form works
- [ ] Results display properly
- [ ] No console errors

### Integration Tests
- [ ] Lemma workflow executes successfully
- [ ] Falls back to Gemini if Lemma fails
- [ ] Data persistence works between requests
- [ ] Chat functionality works

## 🔍 Monitoring

### Netlify Dashboard
1. **Functions** → Check execution logs
2. **Analytics** → Monitor performance
3. **Deploys** → Verify successful builds

### Lemma Dashboard
1. Check workflow runs appear
2. Verify Pod is receiving requests
3. Monitor execution times

### Debug URLs
- Health Check: `https://your-site.netlify.app/api/health`
- Function Logs: Netlify Dashboard → Functions → View logs

## 🚨 Troubleshooting

### Common Issues

#### Build Fails
- Check Node.js version is 20
- Verify package.json dependencies
- Check environment variables are set

#### Lemma Not Working
- Verify `LEMMA_POD_ID` is correct
- Check `LEMMA_SESSION_TOKEN` is valid and not expired
- Ensure workflow is published in Lemma
- Check function execution logs

#### Gemini Fallback
- Verify `GEMINI_API_KEY` is set
- Check API key has proper permissions
- Monitor usage quotas

### Log Locations
- **Build Logs**: Netlify → Deploys → Build log
- **Function Logs**: Netlify → Functions → View logs
- **Runtime Errors**: Netlify → Functions → Execution log

---

## 🎉 Go Live!

1. Set all environment variables
2. Deploy to Netlify
3. Test all functionality
4. Monitor logs for issues
5. Share your live URL!

Your ProjectPilot AI with Lemma integration should now be live! 🚀