export interface WorkflowResult {
  projectTitle: string;
  projectSummary: string;
  estimatedCompletion: string;
  aiConfidenceOverall: number;
  blockedTasksCount: number;
  dependenciesCount: number;
  objectives: string[];
  keyDeliverables: string[];
  tasks: any[];
  risks: any[];
  recommendations: any[];
  missingInfoAlerts?: any[];
}
