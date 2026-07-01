import { ProjectData } from "./types";

export const sampleProject: ProjectData = {
  projectTitle: "Horizon Phase 2 Rollout",
  projectSummary: "The 'Horizon Phase 2' project is currently operating at 85% operational efficiency. Our AI analysis suggests a minor bottleneck in the payment integration workflow, primarily due to pending client sandbox keys. Overall team velocity has increased by 12% in the last sprint. We recommend prioritizing API Schema finalization to avoid cascading delay in front-end implementation.",
  estimatedCompletion: "Nov 15, 2026",
  aiConfidenceOverall: 96,
  blockedTasksCount: 2,
  dependenciesCount: 3,
  objectives: [
    "Deliver the new secure authentication and registration client system.",
    "Upgrade dashboard layout to a highly responsive and high-density Bento Grid design.",
    "Implement automated backend database schema migrations with zero downtime.",
    "Incorporate secure third-party payment options with Stripe API keys."
  ],
  keyDeliverables: [
    "API Security Protocol documents.",
    "Responsive Bento-style React dashboard UI.",
    "Tested Database Migration CJS scripts.",
    "Fully integrated Stripe checkouts."
  ],
  tasks: [
    {
      id: "task-1",
      name: "Finalize API Security Protocols",
      owner: "Sarah D.",
      deadline: "Oct 24",
      priority: "High",
      category: "Core / Backend",
      status: "In Progress",
      sourceEvidence: "Sarah needs to finalize the security layer for backend routes by October 24th.",
      confidence: 98,
      dependencies: []
    },
    {
      id: "task-2",
      name: "Update Dashboard Bento Layout",
      owner: "Ananya",
      deadline: "Oct 28",
      priority: "Medium",
      category: "UI/UX Revamp",
      status: "Todo",
      sourceEvidence: "Ananya is scheduled to implement the Bento-style dashboard layout by Oct 28.",
      confidence: 95,
      dependencies: ["Finalize API Security Protocols"]
    },
    {
      id: "task-3",
      name: "Database Migration Script",
      owner: "Sarah D.",
      deadline: "Nov 02",
      priority: "Low",
      category: "DevOps / Infra",
      status: "Backlog",
      sourceEvidence: "We will need migration CJS files tested by Nov 2nd (Sarah D.)",
      confidence: 94,
      dependencies: ["Finalize API Security Protocols"]
    },
    {
      id: "task-4",
      name: "Configure Stripe API Keys",
      owner: "Rahul",
      deadline: "Oct 22",
      priority: "High",
      category: "Payment Integration",
      status: "Pending",
      sourceEvidence: "Rahul will configure Stripe API access. He expects this by Oct 22.",
      confidence: 97,
      dependencies: ["Receiving production Stripe keys from client"]
    },
    {
      id: "task-5",
      name: "Write Unit Tests for Auth Service",
      owner: "Ananya",
      deadline: "Nov 05",
      priority: "Medium",
      category: "Core / QA",
      status: "Todo",
      sourceEvidence: "Write the unit testing suites for authorization module by Nov 5th.",
      confidence: 91,
      dependencies: []
    },
    {
      id: "task-6",
      name: "Construct Payment Gateway",
      owner: "Unassigned",
      deadline: "TBD",
      priority: "High",
      category: "Payment Integration",
      status: "Pending",
      sourceEvidence: "Someone has to construct the payment gateway after Stripe credentials are configured.",
      confidence: 89,
      dependencies: ["Configure Stripe API Keys"],
      missingInfo: "No assigned owner or exact target date specified in meeting notes.",
      suggestedAction: "Assign an owner and a deadline in the upcoming standup."
    }
  ],
  risks: [
    {
      id: "risk-1",
      name: "Vendor API Deprecation",
      severity: "Critical",
      description: "Auth-Service v2 is scheduled for sunset in 14 days. Current integration will fail.",
      solution: "Initiate migration to v3 Auth immediately; assigned to Security Team.",
      confidence: 99
    },
    {
      id: "risk-2",
      name: "Documentation Gap",
      severity: "High",
      description: "Backend service changes aren't reflected in the mobile dev wiki.",
      solution: "Schedule a 30-minute sync between Backend and Mobile leads.",
      confidence: 93
    },
    {
      id: "risk-3",
      name: "Stripe Key Access Blocker",
      severity: "High",
      description: "Development cannot start payment checkout validation without client's production Stripe credentials.",
      solution: "Request temporary sandbox keys from the client by Tuesday end of day.",
      confidence: 95
    }
  ],
  recommendations: [
    {
      id: "rec-1",
      title: "Optimize Sprint Cycle",
      description: "History suggests Thursday deployments have a 40% lower bug rate for this team.",
      icon: "speed",
      confidence: 92
    },
    {
      id: "rec-2",
      title: "Resource Reallocation",
      description: "Move 'Sarah D.' from Research to Implementation to hit the Nov 02 milestone.",
      icon: "group_add",
      confidence: 88
    },
    {
      id: "rec-3",
      title: "Consolidate Auth Requirements",
      description: "Coordinate with the security team first to approve Auth-Service v3 schema before writing API wrappers.",
      icon: "schedule",
      confidence: 95
    }
  ],
  missingInfoAlerts: [
    {
      id: "alert-1",
      targetType: "task",
      targetName: "Construct Payment Gateway",
      severity: "Warning",
      description: "Task has no owner and deadline is TBD.",
      suggestedAction: "Assign owner and a realistic target deadline to start implementation."
    },
    {
      id: "alert-2",
      targetType: "project",
      targetName: "Horizon Phase 2 Rollout",
      severity: "Info",
      description: "No specific QA lead designated for the rollout.",
      suggestedAction: "Nominate a testing lead in the sprint planning notes."
    }
  ]
};
