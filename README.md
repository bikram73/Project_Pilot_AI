# 🚀 ProjectPilot AI

Transform your unstructured meeting notes, transcripts, requirements documents, and team communications into structured, actionable project dashboards in seconds. Powered by **Lemma Workflow Engine** with intelligent document parsing and real-time analysis, ProjectPilot AI extracts tasks, identifies owners, maps deadlines, flags risks, and provides strategic recommendations automatically.

---

### 🎯 Streamlined Input Interface
* **Simplified Design:** Clean, focused interface with only essential input methods
* **Two Core Input Modes:** File Upload and Direct Text Paste
* **Enhanced Sample Data:** 6 realistic project scenarios for instant testing
* **Removed Complexity:** Eliminated experimental features (URL import, voice recording, image analysis) for better user experience

### 🔄 Robust Lemma Integration 
* **Production-Ready Workflow:** Full end-to-end Lemma workflow execution with polling
* **Session Management:** Automatic token refresh and authentication handling
* **Windows Compatibility:** SSL verification bypass for Windows development environments
* **Error Recovery:** Comprehensive error handling and connection resilience

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

### 🧠 2. Lemma-Powered Analysis Engine
* **Live Workflow Execution:** Real-time submission to Lemma's project-analyzer agent
* **Asynchronous Processing:** Fire-and-forget architecture with intelligent polling
* **Structured Data Extraction:** Automatically identifies:
  - **Tasks** with owners and deadlines
  - **Objectives** and key goals
  - **Risks** and potential blockers  
  - **Strategic Recommendations**
* **Data Transformation:** Seamless conversion between Lemma workflow output and dashboard format

### 📊 3. Interactive Project Dashboard
* **Real-Time Statistics:** Live counters for tasks, risks, deadlines, and priorities
* **Visual Task Management:** Interactive task cards with status toggles
* **Advanced Filtering:** Search and filter by priority, status, owner, or keywords
* **Risk Assessment Matrix:** Visual risk indicators with mitigation strategies
* **Progress Tracking:** Milestone visualization and completion metrics
* **Export Capabilities:** Persistent results saved to `latest_analysis.json`

### 💬 4. AI Chat Assistant (Experimental)
* **Lemma Chat Integration:** Direct connection to project-analyzer chat agent
* **Active Mode Display:** Clear indicator showing `● Lemma Mode Active`
* **Context-Aware Responses:** Project-specific insights and recommendations
* **Fallback Architecture:** Graceful degradation when Lemma services are unavailable

---

## 🏗️ System Architecture

### 🔄 Lemma Workflow Integration
The application is built around a robust Lemma workflow integration:

```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Input    │    │  Express Backend │    │ Lemma Workflow  │
│  (File/Text)    │───▶│    Proxy API     │───▶│    Execution    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Dashboard     │◄───│  Polling System  │◄───│   Results &     │
│   Display       │    │   (3s intervals) │    │  Persistence    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 🔧 Backend Services Architecture
* **Express Proxy Server:** Handles Lemma authentication and API routing
* **Session Management:** Automatic token refresh with Windows SSL compatibility
* **Fire-and-Forget Processing:** Asynchronous workflow execution with polling
* **Result Persistence:** Automatic saving to `latest_analysis.json` for data recovery

### 💾 Data Flow & Processing
1. **Input Processing:** Files converted to base64, text sanitized and validated
2. **Lemma Submission:** Data formatted for project-analyzer workflow schema
3. **Polling Loop:** 3-second intervals checking workflow completion status
4. **Data Transformation:** Lemma output converted to frontend-compatible format
5. **Dashboard Rendering:** Real-time updates with interactive components

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
* **Tailwind CSS v4** - Utility-first styling with custom design system
* **Framer Motion** - Smooth animations and micro-interactions
* **Vite** - Lightning-fast development and optimized production builds

### ⚙️ Backend & Integration
* **Express.js** - Lightweight API server with CORS and error handling
* **Lemma SDK** - Professional workflow orchestration and chat integration
* **Node.js** - Server-side JavaScript runtime with modern ES modules

### 🔧 Development Tools
* **ESLint + Prettier** - Code quality and consistent formatting
* **TypeScript Compiler** - Static type checking and IntelliSense
* **Hot Module Replacement** - Instant updates during development

---

## 📂 Project Structure

Organized for scalability and maintainability:

```
projectpilot-ai/
├── 📁 server/                    # Backend services
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
├── 📄 package.json               # Dependencies & scripts
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 vite.config.ts             # Build tool configuration
├── 📄 .env.example               # Environment variables template
└── 📄 latest_analysis.json       # Persistent analysis results
```

---

## 🚀 Installation & Setup

### 📋 Prerequisites
- **Node.js** v18+ and **npm** installed
- **Lemma CLI** for authentication setup
- **Python/uv** (for Lemma CLI installation)

### 1️⃣ Clone & Install
```bash
git clone <repository-url>
cd projectpilot-ai
npm install
```

### 2️⃣ Lemma Authentication Setup
Install and authenticate with Lemma CLI:

```bash
# Install Lemma CLI via uv (Python package manager)
uv tool install lemma-cli

# Authenticate with Lemma (opens browser)
lemma auth login

# Get session token for server
lemma auth print-token
```

### 3️⃣ Environment Configuration
Create `.env` file in the root directory:

```env
# Lemma Configuration
LEMMA_API_URL=https://api.lemma.work
LEMMA_POD_ID=019f0d4a-33ad-75da-bc5d-43561cba9491
LEMMA_SESSION_TOKEN=<output-from-lemma-auth-print-token>
LEMMA_PROXY_ALLOWED_ORIGIN=http://localhost:5173

# Server Configuration  
PORT=4001

# Optional: Gemini API (for chat fallback)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4️⃣ Development Server
```bash
# Start backend server (port 4001)
cd server
npm run dev

# Start frontend development server (port 5173)
npm run dev
```

Visit `http://localhost:5173` to access the application.

### 5️⃣ Production Build
```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start
```

---

## 🔧 Configuration Options

### Windows Development Setup
For Windows environments, SSL verification may need to be disabled:
```env
# Add to .env for Windows compatibility
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Lemma Pod Configuration
The application connects to the **ProjectPilot AI** pod with these workflows:
- **project-analyzer** - Main analysis workflow
- **chat-agent** - Interactive chat assistance

### Token Refresh
Lemma session tokens expire periodically. To refresh:
```bash
lemma auth login    # If session expired
lemma auth print-token    # Get new token
# Update LEMMA_SESSION_TOKEN in .env
```

---

## 📖 Usage Guide

### 🎯 Quick Start
1. **Launch Application:** Open `http://localhost:5173` 
2. **Choose Input Method:** 
   - **Upload File:** Drag & drop PDF/DOCX/TXT files
   - **Paste Text:** Direct input for meeting notes or requirements
3. **Load Sample Data:** Use the dropdown for realistic project examples
4. **Analyze Project:** Click "Analyze Project" to process with Lemma
5. **Review Dashboard:** Explore tasks, risks, and recommendations

### 📊 Dashboard Features
- **Task Management:** View, filter, and update project tasks
- **Risk Assessment:** Identify and track potential blockers
- **Progress Tracking:** Monitor completion status and deadlines
- **Interactive Filters:** Search by priority, owner, or status
- **Export Results:** Data automatically saved to `latest_analysis.json`

### 💬 AI Chat Assistant
- **Lemma Integration:** Direct connection to project-analyzer chat
- **Context Aware:** Understands your specific project data
- **Mode Indicator:** Shows active connection status
- **Fallback Support:** Graceful degradation when services unavailable

---

## 🔍 Troubleshooting

### Common Issues & Solutions

#### Lemma CLI Installation Issues
```bash
# If lemma command not found, install via uv
pip install uv
uv tool install lemma-cli

# For Windows termios errors, ensure using latest CLI version
uv tool upgrade lemma-cli
```

#### Connection Issues
- **401 Authentication Error:** Refresh Lemma session token
- **Timeout Issues:** Check network connection and Lemma service status  
- **CORS Errors:** Verify `LEMMA_PROXY_ALLOWED_ORIGIN` matches frontend URL

#### Development Server Issues
- **Port Conflicts:** Check if ports 4001 (backend) and 5173 (frontend) are available
- **Module Not Found:** Run `npm install` in both root and server directories
- **Build Errors:** Ensure TypeScript compiler is up to date

### 🛠️ Debug Mode
Enable verbose logging by setting:
```env
NODE_ENV=development
DEBUG=lemma:*
```

---

## 🚀 Deployment

### Vercel Deployment
1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure build settings:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

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
- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for complex functions
- Write tests for new features
- Ensure responsive design compatibility

---

## 📄 License & Acknowledgments

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Acknowledgments
- **Lemma Team** - For the powerful workflow orchestration platform
- **React Team** - For the excellent frontend framework  
- **Tailwind CSS** - For the utility-first styling approach
- **Framer Motion** - For smooth animations and interactions

### Support
- 📧 Email: support@projectpilot.ai
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-repo/discussions)

---

## 🔒 Security & Privacy

### Data Handling
* **Session-Only Processing:** All document analysis happens in active session memory
* **No Permanent Storage:** Processed files are automatically cleaned up
* **Local First:** File processing occurs client-side before secure transmission
* **Secure Authentication:** Lemma tokens managed exclusively server-side

### Privacy Commitments
* **Zero Third-Party Tracking:** No analytics or tracking scripts
* **GDPR Compliant:** No personal data storage or processing
* **Open Source:** Full transparency in data handling practices
* **User Control:** Complete control over data input and analysis results

### Security Best Practices
* **HTTPS Required:** All production deployments use encrypted connections
* **Token Rotation:** Automatic session token refresh and rotation
* **Input Validation:** Comprehensive sanitization of all user inputs
* **Error Handling:** Secure error messages without sensitive information exposure

---

*Built with ❤️ using React, TypeScript, and Lemma SDK*
