# 🚀 ProjectPilot AI

Transform your unstructured meeting notes, transcripts, requirements documents, and team communications into structured, actionable project dashboards in seconds. Powered by **Lemma Workflow Engine** with intelligent document parsing and real-time analysis, ProjectPilot AI extracts tasks, identifies owners, maps deadlines, flags risks, and provides strategic recommendations automatically.
---

### 🎯 Streamlined Input Interface
* **Simplified Design:** Clean, focused interface with only essential input methods
* **Two Core Input Modes:** File Upload and Direct Text Paste
* **Enhanced Sample Data:** 6 realistic project scenarios for instant testing
* **Removed Complexity:** Eliminated experimental features (URL import, voice recording, image analysis) for better user experience

### 🔄 Intelligent Analysis Engine System
* **Primary Engine (Lemma):** Enterprise-grade workflow execution with advanced AI processing
* **Fallback Engine (Gemini):** Reliable backup analysis when Lemma is unavailable  
* **Smart Priority Display:** Clear visual indicators showing analysis mode priority level
* **Seamless Operation:** Automatic engine selection without user intervention
* **Session Management:** Robust token handling and authentication
* **Enhanced Error Recovery:** Graceful degradation with detailed status reporting
* **Cross-Platform Support:** Works on Windows, macOS, and Linux environments

---

## 🎨 Design Philosophy

ProjectPilot AI features an elegant **Deep Slate & Vibrant Blue** aesthetic with responsive layouts, smooth micro-animations, and intuitive user interactions. The interface prioritizes clarity and efficiency, making complex project analysis feel effortless.

---

## ⚡ Core Features

### 📂 1. Smart Document Processing
* **Multi-Format Support:** Native parsing of `.pdf`, `.docx`, and `.txt` files up to 25MB
* **Direct Text Input:** Paste meeting transcripts, chat logs, or requirements directly
* **Sample Data Library:** 6 pre-loaded project scenarios including:
  - Meeting Notes with task assignments
  - Daily Standup updates with blockers
  - Product Requirements Documents
  - Email Thread communications
  - Team Chat Logs with action items
  - Sprint Retrospectives with improvement plans
* **Drag-and-Drop Interface:** Intuitive file upload with visual feedback

### 🧠 2. Intelligent Analysis System with Priority Engine Selection
* **High Priority Engine:** Lemma's advanced project-analyzer workflow with enterprise-grade AI
* **Low Priority Fallback:** Google Gemini 1.5 Flash for reliable backup processing
* **Priority Display:** Clear visual indicators showing "Premium Mode" vs "Backup Mode"
* **Automatic Engine Selection:** Intelligent routing based on service availability
* **Asynchronous Processing:** Fire-and-forget architecture with optimized polling
* **Unified Data Format:** Consistent output regardless of analysis engine
* **Enhanced Error Handling:** Detailed status reporting and graceful degradation

### 📊 3. Interactive Project Dashboard
* **Real-Time Statistics:** Live counters for tasks, risks, deadlines, and priorities
* **Visual Task Management:** Interactive task cards with status toggles
* **Advanced Filtering:** Search and filter by priority, status, owner, or keywords
* **Risk Assessment Matrix:** Visual risk indicators with mitigation strategies
* **Progress Tracking:** Milestone visualization and completion metrics
* **Export Capabilities:** Persistent results saved to `latest_analysis.json`

### 💬 4. Intelligent AI Chat Assistant with Priority System
* **High Priority Mode:** Lemma chat agent with advanced project reasoning and context
* **Low Priority Fallback:** Google Gemini conversational AI with project data awareness  
* **Clear Priority Display:** Visual indicators showing "Lemma Mode Active (High Priority)" or "Gemini Fallback (Low Priority)"
* **Context-Aware Intelligence:** Both engines provide project-specific insights and recommendations
* **Automatic Degradation:** Seamless fallback without user interruption
* **Conversation Continuity:** Maintains chat context across priority mode switches

---

## 🏗️ System Architecture

### 🔄 Priority-Based Analysis Flow
```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────┐
│   User Input    │    │  Express Backend │    │ HIGH Priority: Lemma    │
│  (File/Text)    │───▶│  Priority Router │───▶│   Advanced Workflow     │
└─────────────────┘    └──────────────────┘    └─────────────────────────┘
                                │                           │
                                ▼                           ▼
                       ┌──────────────────┐    ┌─────────────────────────┐
                       │Priority Degrader │    │   Premium Dashboard     │
                       │ (If Lemma Fails) │    │  (High Priority Mode)   │
                       └──────────────────┘    └─────────────────────────┘
                                │                        
                                ▼                        
                       ┌──────────────────────────┐              
                       │ LOW Priority: Gemini     │              
                       │   Fallback Analysis      │              
                       └──────────────────────────┘              
                                │                        
                                ▼                        
                       ┌──────────────────────────┐              
                       │   Backup Dashboard       │              
                       │ (Low Priority Mode)      │              
                       └──────────────────────────┘              
```

### 🔧 Backend Services Architecture
* **Express Proxy Server:** Intelligent priority routing between Lemma (high) and Gemini (low)
* **Session Management:** Automatic token refresh with cross-platform compatibility  
* **Priority-Based Routing:** Smart engine selection with clear degradation path
* **Fire-and-Forget Processing:** Asynchronous workflow execution with optimized polling
* **Result Persistence:** Automatic saving with analysis mode tracking and priority indicators

### 💾 Data Flow & Priority Processing
1. **Input Processing:** Files converted to base64, text sanitized and validated
2. **High Priority Submission:** Data formatted for Lemma project-analyzer workflow schema
3. **Smart Polling Loop:** Optimized intervals checking workflow completion status
4. **Priority Degradation:** Automatic fallback to Gemini if Lemma unavailable
5. **Data Transformation:** Both engines converted to unified frontend format
6. **Dashboard Rendering:** Real-time updates with clear priority mode indicators

---

## 🛡️ Production-Ready Features

### 🔒 Security & Privacy
* **No Persistent Storage:** All processing happens in active session memory
* **Local Data Processing:** Files processed client-side before secure transmission
* **Session-Based Authentication:** Lemma tokens managed server-side only
* **Privacy Guaranteed:** No third-party tracking or permanent data logging

### 🚀 Performance Optimizations
* **Lazy Loading:** Components loaded on-demand for faster initial load
* **Efficient Polling:** Smart interval management to reduce server load
* **Memory Management:** Automatic cleanup of processed file data
* **Responsive Design:** Optimized for desktop, tablet, and mobile devices

### 🔧 Developer Experience
* **TypeScript Throughout:** Full type safety across frontend and backend
* **Comprehensive Error Handling:** Graceful degradation and user feedback
* **Development Tools:** Hot reload, source maps, and debugging utilities
* **Production Build:** Optimized bundle with code splitting and compression

---

## 🛠️ Technology Stack

### 🌐 Frontend
* **React 19** - Modern hooks, concurrent features, and optimized rendering
* **TypeScript** - Full type safety with strict compiler settings
* **Tailwind CSS v3** - Utility-first styling with PostCSS processing
* **Framer Motion** - Smooth animations and micro-interactions
* **Vite** - Lightning-fast development and optimized production builds

### ⚙️ Backend & Integration
* **Netlify Functions** - Serverless API endpoints with auto-scaling and global CDN
* **Express.js** - Converted to serverless functions for `/api/*` routes
* **Lemma SDK** - Primary workflow orchestration and chat integration
* **Google Gemini AI** - Fallback analysis engine and conversational AI
* **Node.js 20+** - Modern server-side runtime with ES modules support

### 🔧 Development Tools
* **ESLint + Prettier** - Code quality and consistent formatting
* **TypeScript Compiler** - Static type checking and IntelliSense
* **Hot Module Replacement** - Instant updates during development

---

## 📂 Project Structure

Organized for scalability and maintainability:

```
projectpilot-ai/
├── 📁 netlify/                   # Netlify serverless functions
│   └── functions/                # API endpoints as serverless functions
│       ├── analyze.js            # Analysis and polling endpoints
│       ├── chat.js               # Chat functionality
│       ├── tasks.js              # Task management
│       └── health.js             # Service health check
├── 📁 server/                    # Original Express server (dev only)
│   ├── index.ts                  # Express server entry point
│   ├── middleware/               # CORS, error handling
│   ├── routes/                   # API endpoints (/analyze, /tasks, /risks)
│   └── services/                 # Lemma integration & data transformation
├── 📁 src/                       # Frontend application
│   ├── App.tsx                   # Main app component with routing
│   ├── types.ts                  # Global TypeScript interfaces
│   ├── api/                      # API client functions
│   │   ├── projectAnalysis.ts    # Workflow execution & polling
│   │   └── lemma.ts              # Lemma SDK operations
│   └── components/               # React components
│       ├── AnalysisWorkspace.tsx # Input interface with sample data
│       ├── Dashboard.tsx         # Main project overview
│       ├── ProcessingScreen.tsx  # Loading states & progress
│       └── LandingPage.tsx       # Welcome screen
├── 📄 netlify.toml               # Netlify deployment configuration
├── 📄 index-netlify.html         # Production HTML for Netlify
├── 📄 vite.config.netlify-simple.ts # Netlify-optimized build config
├── 📄 package.json               # Dependencies & scripts
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 vite.config.ts             # Development build configuration
├── 📄 .env.example               # Environment variables template
└── 📄 latest_analysis.json       # Persistent analysis results
```

---

## 🚀 Installation & Setup

### 📋 Prerequisites
- **Node.js** v20+ and **npm** v10+ installed
- **Lemma CLI** for authentication and token management
- **Netlify Account** (for deployment)
- **Google Account** (for Gemini API key)

### 1️⃣ Clone & Install
```bash
git clone <repository-url>
cd projectpilot-ai
npm install
```

### 2️⃣ Lemma CLI Installation & Authentication Setup

#### Step 1: Install Lemma CLI
Choose one of the following installation methods:

**Option A: Global npm installation (Recommended)**
```bash
npm install -g @lemma-ai/cli
```

**Option B: Use npx (No installation required)**
```bash
# You can run commands with npx @lemma-ai/cli instead of lemma
npx @lemma-ai/cli --version
```

**Option C: Alternative installation via uv (Python package manager)**
```bash
# Install uv first if not available
pip install uv
uv tool install lemma-cli
```

#### Step 2: Windows PATH Setup (Windows Users Only)
If the `lemma` command is not found after installation, add it to your PATH:

```powershell
# PowerShell - Add Lemma CLI to PATH
$env:Path = "C:\Users\Admin\.local\bin;$env:Path"

# Or permanently add to system PATH via System Properties > Environment Variables
```

#### Step 3: Authenticate with Lemma
Log in to your Lemma account (this opens your browser):

```bash
# Standard authentication
lemma --no-verify-ssl auth login

# Or using npx if not globally installed
npx @lemma-ai/cli --no-verify-ssl auth login
```

**Note:** The `--no-verify-ssl` flag is required for Windows compatibility and certificate issues.

#### Step 4: Generate Session Token
Generate a fresh session token for backend authentication:

```bash
# Generate new session token
lemma --no-verify-ssl auth print-token

# This outputs a JWT token like:
# eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Step 5: Verify Authentication (Optional)
Confirm you're properly logged in:

```bash
# Check authentication status
lemma --no-verify-ssl auth whoami

# Or check status (depending on CLI version)
lemma --no-verify-ssl auth status
```

#### Complete Workflow for Token Refresh
When your token expires, use this complete workflow:

```bash
# 1. Log out (optional, clears old session)
lemma --no-verify-ssl auth logout

# 2. Log back in (opens browser)
lemma --no-verify-ssl auth login

# 3. Generate fresh token
lemma --no-verify-ssl auth print-token
```

#### Troubleshooting Lemma CLI

**If `print-token` doesn't work:**
1. Check your CLI version:
   ```bash
   lemma --version
   ```

2. Update to latest version:
   ```bash
   npm install -g @lemma-ai/cli@latest
   ```

3. Try alternative login method:
   ```bash
   npx @lemma-ai/cli --no-verify-ssl auth login
   npx @lemma-ai/cli --no-verify-ssl auth print-token
   ```

**Common Issues:**
- **Command not found:** Ensure CLI is in PATH or use `npx @lemma-ai/cli`
- **SSL Certificate errors:** Always use `--no-verify-ssl` flag
- **Authentication timeout:** Try logging out and back in
- **Token format errors:** Ensure you copy the complete JWT token

### 3️⃣ Environment Configuration
Create `.env` file in the root directory with your Lemma session token:

```env
# Lemma Configuration (High Priority Analysis Engine)
LEMMA_API_URL=https://api.lemma.work
LEMMA_POD_ID=019f0d4a-33ad-75da-bc5d-43561cba9491
LEMMA_SESSION_TOKEN=<paste-your-complete-JWT-token-here>
LEMMA_PROXY_ALLOWED_ORIGIN=https://your-netlify-app.netlify.app

# Google Gemini API Configuration (Low Priority Fallback Engine)
GEMINI_API_KEY=your_gemini_api_key_here

# Application Configuration
APP_URL=https://your-netlify-app.netlify.app

# Windows Development (SSL Certificate Bypass)
NODE_TLS_REJECT_UNAUTHORIZED=0
```

**Important Notes:**
- Replace `<paste-your-complete-JWT-token-here>` with the full token from `lemma auth print-token`
- The token should start with `eyJ` and be very long (hundreds of characters)
- Never commit your `.env` file to version control - it's already in `.gitignore`

**Getting your Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" 
4. Copy the key to your `.env` file as `GEMINI_API_KEY`

### 4️⃣ Development Server
```bash
# Start local development server (includes backend simulation)
npm run dev

# Visit http://localhost:5173 to access the application
```

### 5️⃣ Production Build & Deployment

#### Local Production Build
```bash
# Build for Netlify deployment
npm run build:netlify

# Test production build locally (if needed)
npm run start
```

#### Netlify Deployment
1. **Connect to Netlify:**
   - Create account at [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Choose "Deploy Site"

2. **Configure Build Settings:**
   ```
   Build command: npm run build:netlify
   Publish directory: dist
   ```

3. **Set Environment Variables** in Netlify dashboard (Site Settings > Environment Variables):
   ```
   LEMMA_API_URL=https://api.lemma.work
   LEMMA_POD_ID=019f0d4a-33ad-75da-bc5d-43561cba9491  
   LEMMA_SESSION_TOKEN=[your-complete-JWT-token-from-lemma-auth-print-token]
   GEMINI_API_KEY=[your-gemini-api-key-from-google-ai-studio]
   APP_URL=https://your-app-name.netlify.app
   LEMMA_PROXY_ALLOWED_ORIGIN=https://your-app-name.netlify.app
   NODE_TLS_REJECT_UNAUTHORIZED=0
   ```

   **Critical:** 
   - The `LEMMA_SESSION_TOKEN` must be the complete JWT token (starts with `eyJ`, very long)
   - Get fresh token using: `lemma --no-verify-ssl auth print-token`
   - Update both local `.env` and Netlify environment variables

4. **Deploy:** Netlify will automatically build and deploy your site

---

## 🔧 Configuration Options

### Netlify Environment Variables
All environment variables must be configured in the Netlify dashboard:
1. Go to your site dashboard on Netlify
2. Navigate to Site Settings > Environment Variables  
3. Add all the variables listed in the setup section above

### Windows Development Setup
For Windows environments, SSL verification may need to be disabled:
```env
# Add to Netlify environment variables for Windows compatibility
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Lemma Pod Configuration
The application connects to the **ProjectPilot AI** pod with these workflows:
- **project-analyzer** - Main analysis workflow
- **chat-agent** - Interactive chat assistance

### Token Refresh & Maintenance
Lemma session tokens expire periodically. When you see authentication errors:

#### For Local Development:
```bash
# 1. Generate fresh token
lemma --no-verify-ssl auth print-token

# 2. Update your local .env file
# Replace LEMMA_SESSION_TOKEN with the new token

# 3. Restart your development server
npm run dev
```

#### For Netlify Production:
```bash
# 1. Generate fresh token locally
lemma --no-verify-ssl auth print-token

# 2. Update Netlify environment variables:
# - Go to Netlify Dashboard > Site Settings > Environment Variables
# - Update LEMMA_SESSION_TOKEN with the new token
# - Save changes

# 3. Redeploy (automatic) or trigger manual deploy
```

#### Complete Token Refresh Workflow:
```bash
# Step 1: Logout and re-login for clean session
lemma --no-verify-ssl auth logout
lemma --no-verify-ssl auth login

# Step 2: Generate fresh token
lemma --no-verify-ssl auth print-token

# Step 3: Copy the complete JWT token (starts with eyJ...)

# Step 4: Update environment variables
# - Local: Update .env file
# - Production: Update Netlify dashboard

# Step 5: Restart/redeploy
# - Local: npm run dev
# - Production: Automatic redeploy
```

---

## 📖 Usage Guide

### 🎯 Quick Start
1. **Launch Application:** Open your deployed Netlify URL or `http://localhost:5173` for development
2. **Choose Input Method:** 
   - **Upload File:** Drag & drop PDF/DOCX/TXT files up to 25MB
   - **Paste Text:** Direct input for meeting notes or requirements
3. **Load Sample Data:** Use the dropdown for realistic project examples
4. **Analyze Project:** Click "Analyze Project" - system prioritizes Lemma (Premium Mode)
5. **Review Dashboard:** Explore tasks, risks, and recommendations with priority mode indicator

### 📊 Dashboard Priority System
- **Premium Mode (Green Badge):** Advanced Lemma analysis with maximum accuracy
- **Backup Mode (Amber Badge):** Reliable Gemini fallback when Lemma unavailable
- **Task Management:** View, filter, and update project tasks regardless of analysis mode
- **Risk Assessment:** Identify and track potential blockers with confidence levels
- **Progress Tracking:** Monitor completion status and deadlines across all priority levels
- **Interactive Filters:** Search by priority, owner, or status in any analysis mode
- **Export Results:** Data automatically saved to `latest_analysis.json` with mode tracking

### 💬 AI Chat Assistant
- **Priority System:** High priority Lemma chat or low priority Gemini conversational AI
- **Context Intelligence:** Understands your specific project data in both priority modes
- **Priority Indicators:** Clear visual status showing current analysis priority level
- **Automatic Degradation:** Seamless switching when high priority service unavailable

---

### 🧪 Testing Fallback System

### Manual Testing
To test the Gemini fallback system:

```bash
# Test priority system with development server
npm run dev

# Test priority degradation by setting invalid Lemma token
# Temporarily set LEMMA_SESSION_TOKEN to "invalid" in environment
# Run analysis - should automatically degrade to Gemini (low priority)
# Check dashboard for amber "Backup Mode" indicator instead of green "Premium Mode"
```

### API Testing (Local Development)
```bash
# Test Gemini integration directly
node test-gemini-fallback.js

# Test analysis endpoints locally
curl -X POST http://localhost:5173/.netlify/functions/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Test meeting with John completing API by Friday"}'

# Test chat endpoints locally
curl -X POST http://localhost:5173/.netlify/functions/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the main tasks?"}'
```

### Expected Behavior
- **Lemma Available (High Priority):** Uses Lemma workflow, shows green "Premium Mode" badge
- **Lemma Unavailable (Priority Degradation):** Falls back to Gemini, shows amber "Backup Mode" badge  
- **Both Unavailable:** Shows offline mode with local parsing and appropriate error messaging

---

### 🔍 Troubleshooting

### Common Issues & Solutions

#### Netlify Deployment Issues
```bash
# Build fails with Node version error
# Solution: Ensure Node 20+ is specified in netlify.toml:
[build.environment]
  NODE_VERSION = "20"

# Functions not working after deployment
# Solution: Check Netlify Functions logs in dashboard for errors
# Verify all environment variables are set correctly
```

#### Lemma CLI Installation Issues
```bash
# Command not found error
# Solution 1: Use npx instead
npx @lemma-ai/cli --no-verify-ssl auth login
npx @lemma-ai/cli --no-verify-ssl auth print-token

# Solution 2: Install globally
npm install -g @lemma-ai/cli@latest

# Solution 3: Check/update PATH (Windows)
$env:Path = "C:\Users\Admin\.local\bin;$env:Path"

# Windows termios errors - update CLI version
npm uninstall -g @lemma-ai/cli
npm install -g @lemma-ai/cli@latest
```

#### Token Issues
```bash
# Invalid or expired token errors
# Solution: Generate fresh token
lemma --no-verify-ssl auth logout
lemma --no-verify-ssl auth login  
lemma --no-verify-ssl auth print-token

# Copy complete JWT token (very long, starts with eyJ)
# Update both .env file and Netlify environment variables
```

#### Connection Issues
- **401 Authentication Error:** Generate fresh token with `lemma --no-verify-ssl auth print-token`
- **Timeout Issues:** Check Netlify Functions execution logs for timeout errors
- **CORS Errors:** Verify `LEMMA_PROXY_ALLOWED_ORIGIN` matches your Netlify app URL exactly
- **SSL Certificate Errors:** Always use `--no-verify-ssl` flag with Lemma CLI commands

#### Development Server Issues
- **Port Conflicts:** Check if port 5173 (frontend) is available
- **Module Not Found:** Run `npm install` in project root
- **Build Errors:** Ensure TypeScript and dependencies are up to date

### 🛠️ Debug Mode
Enable verbose logging in Netlify Functions by setting:
```env
NODE_ENV=development
DEBUG=lemma:*
```

---

## 🚀 Deployment

### Option 1: Lemma Native Deployment (Recommended for Lemma Users)

If you have Lemma CLI installed and want to deploy directly to the Lemma platform:

#### Prerequisites
- Lemma CLI installed and authenticated
- Project working locally

#### Steps:
```bash
# 1. Ensure you're logged in to Lemma
lemma --no-verify-ssl auth login

# 2. Build the project
npm run build

# 3. Deploy to Lemma platform
lemma --no-verify-ssl apps deploy projectpilot-ai . --dist-dir dist --yes
```

#### Result:
Your app will be deployed to: `https://projectpilot-ai.apps.lemma.work`

#### Features of Lemma Deployment:
- **Native Lemma Integration**: Direct access to Lemma workflows and chat agents
- **High Priority Analysis**: Uses Lemma's advanced AI processing capabilities
- **Pod-Level Security**: App is accessible within your Lemma Pod
- **Auto-Authentication**: Leverages Lemma platform authentication
- **No Backend Required**: Static deployment with direct API integration

#### Managing Your Lemma App:
```bash
# List your deployed apps
lemma --no-verify-ssl apps list

# Get app details
lemma --no-verify-ssl apps get projectpilot-ai

# Redeploy after changes
npm run build
lemma --no-verify-ssl apps deploy projectpilot-ai . --dist-dir dist --yes
```

### Option 2: Netlify Deployment (Serverless Functions)
The application is optimized for multiple deployment platforms:

### Lemma Deployment (Option 1)
Native integration with Lemma platform for premium AI analysis:

1. **Authentication & Build:**
   - Authenticate with Lemma CLI
   - Build project with `npm run build`
   - Deploy with `lemma apps deploy`

2. **Environment Setup:**
   ```
   VITE_LEMMA_API_URL=https://api.lemma.work
   VITE_LEMMA_AUTH_URL=https://lemma.work/auth
   VITE_LEMMA_POD_ID=019f0d4a-33ad-75da-bc5d-43561cba9491
   ```

3. **Features:**
   - Native Lemma workflow integration
   - Direct API access without backend
   - Pod-level security and authentication
   - Premium AI analysis capabilities

### Netlify Deployment (Option 2)

1. **Repository Connection:**
   - Connect your GitHub/GitLab repository to Netlify
   - Select the repository and authorize access

2. **Build Configuration:**
   ```
   Build command: npm run build:netlify
   Publish directory: dist
   Functions directory: netlify/functions
   ```

3. **Environment Variables Setup:**
   Set these in Netlify site dashboard > Environment variables:
   ```
   LEMMA_API_URL=https://api.lemma.work
   LEMMA_POD_ID=019f0d4a-33ad-75da-bc5d-43561cba9491
   LEMMA_SESSION_TOKEN=[from lemma auth print-token]
   LEMMA_PROXY_ALLOWED_ORIGIN=https://your-app.netlify.app
   GEMINI_API_KEY=[from Google AI Studio]
   APP_URL=https://your-app.netlify.app
   NODE_TLS_REJECT_UNAUTHORIZED=0
   ```

4. **Domain Configuration:**
   - Netlify provides a default domain: `your-app.netlify.app`
   - Update `APP_URL` and `LEMMA_PROXY_ALLOWED_ORIGIN` with this URL
   - Optionally configure custom domain

### Alternative Deployment Options

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4001
CMD ["npm", "start"]
```

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test locally
4. Run type checking: `npm run type-check`
5. Run linting: `npm run lint`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push branch: `git push origin feature/amazing-feature`
8. Open pull request

### Code Style Guidelines
- Use TypeScript for all new code with strict type checking
- Follow existing naming conventions and component structure
- Add comprehensive JSDoc comments for complex functions
- Write tests for new features and bug fixes
- Ensure responsive design compatibility across all screen sizes
- Maintain consistency with existing UI/UX patterns

### Testing Guidelines
- Test both Lemma (high priority) and Gemini (low priority) analysis modes
- Verify priority indicator displays correctly in dashboard
- Test graceful degradation when services are unavailable
- Ensure chat assistant works in both priority modes
- Validate file upload and text processing functionality

---

## 🔒 Security & Privacy

### Data Handling
* **Session-Only Processing:** All document analysis happens in active session memory
* **No Permanent Storage:** Processed files are automatically cleaned up
* **Local First:** File processing occurs client-side before secure transmission
* **Secure Authentication:** Lemma tokens managed exclusively server-side

### Privacy Commitments
* **Zero Third-Party Tracking:** No analytics or tracking scripts embedded
* **GDPR Compliant:** No personal data storage or long-term processing
* **Open Source Transparency:** Full transparency in data handling practices under MIT License
* **User Control:** Complete control over data input and analysis results
* **Priority-Based Processing:** Clear indicators showing which AI engine processed your data

### Security Best Practices
* **HTTPS Required:** All production deployments use encrypted connections
* **Token Rotation:** Automatic session token refresh and rotation
* **Input Validation:** Comprehensive sanitization of all user inputs
* **Error Handling:** Secure error messages without sensitive information exposure

---

## 📄 License & Acknowledgments

### License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for complete details.