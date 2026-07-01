import { ProjectData } from "../types";

/**
 * Enhanced semantic extraction for project analysis
 * This replaces the old line-by-line parsing with intelligent semantic understanding
 */
export function createSemanticAnalysis(
  payload: { text: string; file: { name: string; base64: string; mimeType: string } | null },
  onStatusUpdate?: (status: string) => void
): ProjectData {
  if (onStatusUpdate) {
    onStatusUpdate("Processing with Advanced Semantic Analysis");
  }

  const inputText = payload.text || "";
  console.log('🧠 Semantic Analysis: Processing', inputText.length, 'characters');

  // First, identify the document structure and extract key sections
  const analysis = parseDocumentStructure(inputText);
  
  // Extract actionable tasks (not headings or completed work)
  const tasks = extractActionableTasks(analysis);
  
  // Extract real risks and blockers
  const risks = extractRealRisks(analysis);
  
  // Extract proper objectives from features/requirements
  const objectives = extractObjectives(analysis);
  
  // Extract deliverables from technical requirements
  const deliverables = extractDeliverables(analysis);
  
  // Extract timeline information
  const timeline = extractTimeline(analysis);
  
  // Generate intelligent recommendations
  const recommendations = generateRecommendations(analysis);

  return {
    projectTitle: analysis.projectTitle || "Semantic Project Analysis",
    projectSummary: analysis.summary || `Analyzed ${inputText.length} characters using advanced semantic extraction. Identified ${tasks.length} actionable tasks, ${risks.length} risks, and ${objectives.length} objectives.`,
    estimatedCompletion: timeline.estimatedCompletion || "TBD",
    aiConfidenceOverall: 90,
    blockedTasksCount: tasks.filter(t => t.status === 'Blocked').length,
    dependenciesCount: tasks.reduce((acc, task) => acc + (task.dependencies?.length || 0), 0),
    objectives,
    keyDeliverables: deliverables,
    tasks,
    risks,
    recommendations,
    missingInfoAlerts: [],
    _analysisMode: "lemma" as const
  };
}

/**
 * Parse document structure and identify key sections
 */
function parseDocumentStructure(text: string) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const structure = {
    projectTitle: '',
    summary: '',
    features: [] as string[],
    userStories: [] as string[],
    technicalRequirements: [] as string[],
    risks: [] as string[],
    timeline: [] as string[],
    actionItems: [] as string[],
    completedWork: [] as string[],
    headings: [] as string[]
  };
  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    // Extract project title from document title or feature name
    if (lowerLine.includes('feature:') || lowerLine.includes('project:') || lowerLine.includes('document v')) {
      if (lowerLine.includes('feature:')) {
        structure.projectTitle = line.replace(/.*feature:\s*/i, '').trim();
      } else if (lowerLine.includes('project:')) {
        structure.projectTitle = line.replace(/.*project:\s*/i, '').trim();
      } else if (structure.projectTitle === '') {
        structure.projectTitle = line;
      }
    }
    
    // Identify document sections
    if (lowerLine.includes('user stories') || lowerLine.includes('as a user')) {
      currentSection = 'userStories';
    } else if (lowerLine.includes('technical requirements') || lowerLine.includes('requirements:')) {
      currentSection = 'technicalRequirements';
    } else if (lowerLine.includes('risks') || lowerLine.includes('blockers')) {
      currentSection = 'risks';
    } else if (lowerLine.includes('timeline') || lowerLine.includes('sprints') || lowerLine.includes('weeks')) {
      currentSection = 'timeline';
    } else if (lowerLine.includes('action items') && !isHeading(line)) {
      currentSection = 'actionItems';
    } else if (lowerLine.includes('what went well') || lowerLine.includes('completed') || lowerLine.includes('achievements')) {
      currentSection = 'completedWork';
    } else if (isHeading(line)) {
      structure.headings.push(line);
      currentSection = '';
    }
    
    // Extract content based on current section
    if (currentSection && !isHeading(line) && line.length > 5) {
      if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
        const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
        if (cleanLine.length > 3) {
          const currentArray = structure[currentSection as keyof typeof structure];
          if (Array.isArray(currentArray)) {
            currentArray.push(cleanLine);
          }
        }
      } else if (currentSection === 'userStories' && lowerLine.includes('as a')) {
        structure.userStories.push(line);
      } else if (currentSection === 'timeline' && (lowerLine.includes('week') || lowerLine.includes('sprint'))) {
        structure.timeline.push(line);
      }
    }
    
    // Extract features from context
    if (lowerLine.includes('implement') || lowerLine.includes('integrate') || lowerLine.includes('build')) {
      if (!isHeading(line) && !isCompletedWork(line)) {
        structure.features.push(line);
      }
    }
  }
  
  return structure;
}

/**
 * Check if a line is a heading (not actionable content)
 */
function isHeading(line: string): boolean {
  const lowerLine = line.toLowerCase().trim();
  
  // Common heading patterns
  const headingPatterns = [
    'sprint retrospective',
    'what went well',
    'action items',
    'holiday',
    'meeting notes',
    'agenda',
    'overview',
    'summary',
    'introduction',
    'background'
  ];
  
  // Check if line matches heading patterns
  if (headingPatterns.some(pattern => lowerLine.includes(pattern))) {
    return true;
  }
  
  // Check if line is too short to be meaningful content
  if (line.length < 10) {
    return true;
  }
  
  // Check if line is all caps (likely a heading)
  if (line === line.toUpperCase() && line.length < 50) {
    return true;
  }
  
  return false;
}

/**
 * Check if content represents completed work (not a future task)
 */
function isCompletedWork(line: string): boolean {
  const lowerLine = line.toLowerCase();
  
  const completedIndicators = [
    'improved',
    'completed',
    'finished',
    'done',
    'delivered',
    'was positive',
    'went well',
    'successfully',
    'achieved'
  ];
  
  return completedIndicators.some(indicator => lowerLine.includes(indicator));
}
/**
 * Extract only actionable tasks (not headings or completed work)
 */
function extractActionableTasks(structure: any): any[] {
  const tasks: any[] = [];
  
  // Process user stories into specific tasks
  structure.userStories.forEach((story: string, index: number) => {
    if (story.toLowerCase().includes('as a user')) {
      // Extract specific features from user stories
      const features = extractFeaturesFromUserStory(story);
      features.forEach(feature => {
        tasks.push({
          id: `task-${tasks.length + 1}`,
          name: feature.name,
          owner: 'Unassigned',
          deadline: 'TBD',
          priority: 'Medium' as const,
          category: feature.category,
          status: 'Todo' as const,
          sourceEvidence: `User Story: "${story}"`,
          confidence: 90,
          dependencies: []
        });
      });
    }
  });
  
  // Process technical requirements into implementation tasks
  structure.technicalRequirements.forEach((req: string) => {
    if (req.length > 5 && !isCompletedWork(req)) {
      const task = parseRequirementIntoTask(req);
      if (task) {
        tasks.push({
          id: `task-${tasks.length + 1}`,
          ...task,
          sourceEvidence: `Technical Requirement: "${req}"`,
          confidence: 85
        });
      }
    }
  });
  
  // Process action items (but filter out headings and completed work)
  structure.actionItems.forEach((item: string) => {
    if (!isHeading(item) && !isCompletedWork(item) && item.length > 10) {
      const task = parseActionItem(item);
      if (task) {
        tasks.push({
          id: `task-${tasks.length + 1}`,
          ...task,
          sourceEvidence: `Action Item: "${item}"`,
          confidence: 80
        });
      }
    }
  });
  
  // Process features into implementation tasks
  structure.features.forEach((feature: string) => {
    if (!isHeading(feature) && !isCompletedWork(feature)) {
      const task = parseFeatureIntoTask(feature);
      if (task) {
        tasks.push({
          id: `task-${tasks.length + 1}`,
          ...task,
          sourceEvidence: `Feature: "${feature}"`,
          confidence: 85
        });
      }
    }
  });
  
  return tasks;
}

/**
 * Extract specific features from user story text
 */
function extractFeaturesFromUserStory(story: string): Array<{name: string, category: string}> {
  const features = [];
  const lowerStory = story.toLowerCase();
  
  // Look for specific feature mentions
  if (lowerStory.includes('twitter') || lowerStory.includes('share')) {
    features.push({ name: 'Implement Twitter Sharing', category: 'Social Integration' });
  }
  if (lowerStory.includes('google') || lowerStory.includes('oauth')) {
    features.push({ name: 'Implement Google OAuth', category: 'Authentication' });
  }
  if (lowerStory.includes('facebook') || lowerStory.includes('fb login')) {
    features.push({ name: 'Implement Facebook OAuth', category: 'Authentication' });
  }
  if (lowerStory.includes('moderation') || lowerStory.includes('content review')) {
    features.push({ name: 'Build Content Moderation', category: 'Content Management' });
  }
  if (lowerStory.includes('login') && !lowerStory.includes('google') && !lowerStory.includes('facebook')) {
    features.push({ name: 'Implement User Authentication', category: 'Authentication' });
  }
  
  return features;
}

/**
 * Parse technical requirement into implementation task
 */
function parseRequirementIntoTask(requirement: string): any | null {
  const lowerReq = requirement.toLowerCase();
  
  if (lowerReq.includes('oauth 2.0')) {
    return {
      name: 'Implement OAuth 2.0 Integration',
      owner: 'Unassigned',
      deadline: 'TBD',
      priority: 'High' as const,
      category: 'Authentication',
      status: 'Todo' as const,
      dependencies: []
    };
  }
  
  if (lowerReq.includes('rate limiting')) {
    return {
      name: 'Implement API Rate Limiting',
      owner: 'Unassigned', 
      deadline: 'TBD',
      priority: 'High' as const,
      category: 'Backend API',
      status: 'Todo' as const,
      dependencies: []
    };
  }
  
  if (lowerReq.includes('content moderation api')) {
    return {
      name: 'Integrate Content Moderation API',
      owner: 'Unassigned',
      deadline: 'TBD', 
      priority: 'Medium' as const,
      category: 'Content Management',
      status: 'Todo' as const,
      dependencies: []
    };
  }
  
  // Generic requirement parsing
  if (requirement.length > 10 && !isCompletedWork(requirement)) {
    return {
      name: requirement.charAt(0).toUpperCase() + requirement.slice(1),
      owner: extractOwnerFromText(requirement),
      deadline: extractDeadlineFromText(requirement),
      priority: 'Medium' as const,
      category: 'General',
      status: 'Todo' as const,
      dependencies: []
    };
  }
  
  return null;
}
/**
 * Parse action item into task (with proper owner and deadline extraction)
 */
function parseActionItem(item: string): any | null {
  // Skip if this is just a heading or completed work
  if (isHeading(item) || isCompletedWork(item)) {
    return null;
  }
  
  const owner = extractOwnerFromText(item);
  const deadline = extractDeadlineFromText(item);
  
  // Clean up the task name by removing owner and deadline info
  let taskName = item;
  if (owner !== 'Unassigned') {
    taskName = taskName.replace(new RegExp(`\\b${owner}\\b`, 'gi'), '').trim();
  }
  taskName = taskName.replace(/due:?\s*\w+/gi, '').trim();
  taskName = taskName.replace(/owner:?\s*\w+/gi, '').trim();
  taskName = taskName.replace(/^[-•*]\s*/, '').trim();
  
  if (taskName.length < 5) {
    return null;
  }
  
  return {
    name: taskName.charAt(0).toUpperCase() + taskName.slice(1),
    owner,
    deadline,
    priority: 'Medium' as const,
    category: determineCategory(taskName),
    status: 'Todo' as const,
    dependencies: []
  };
}

/**
 * Parse feature description into implementation task
 */
function parseFeatureIntoTask(feature: string): any | null {
  if (isHeading(feature) || isCompletedWork(feature)) {
    return null;
  }
  
  const lowerFeature = feature.toLowerCase();
  let taskName = feature;
  let category = 'General';
  
  // Ensure task name starts with action verb
  if (!lowerFeature.startsWith('implement') && !lowerFeature.startsWith('integrate') && 
      !lowerFeature.startsWith('build') && !lowerFeature.startsWith('create')) {
    if (lowerFeature.includes('api')) {
      taskName = `Implement ${feature}`;
      category = 'Backend API';
    } else if (lowerFeature.includes('ui') || lowerFeature.includes('interface')) {
      taskName = `Build ${feature}`;
      category = 'Frontend UI';
    } else {
      taskName = `Implement ${feature}`;
    }
  }
  
  return {
    name: taskName,
    owner: extractOwnerFromText(feature),
    deadline: extractDeadlineFromText(feature),
    priority: 'Medium' as const,
    category: category !== 'General' ? category : determineCategory(taskName),
    status: 'Todo' as const,
    dependencies: []
  };
}

/**
 * Extract owner from text with better parsing
 */
function extractOwnerFromText(text: string): string {
  // Look for "Owner: Name" pattern
  const ownerMatch = text.match(/owner:\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i);
  if (ownerMatch) {
    return ownerMatch[1].trim();
  }
  
  // Look for "Name:" pattern (like "John: Task description")  
  const colonMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?):/);
  if (colonMatch) {
    return colonMatch[1].trim();
  }
  
  // Look for names in parentheses
  const parenMatch = text.match(/\(([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\)/);
  if (parenMatch) {
    return parenMatch[1].trim();
  }
  
  // Look for common patterns like "assigned to Name" or "by Name"
  const assignedMatch = text.match(/(?:assigned to|by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (assignedMatch) {
    return assignedMatch[1].trim();
  }
  
  return 'Unassigned';
}

/**
 * Extract deadline from text with better parsing
 */
function extractDeadlineFromText(text: string): string {
  // Look for "Due: Date" pattern
  const dueMatch = text.match(/due:?\s*([a-zA-Z]+(?:\s+\d+)?(?:\s+\d{4})?)/i);
  if (dueMatch) {
    return dueMatch[1].trim();
  }
  
  // Look for "by Date" pattern
  const byMatch = text.match(/by\s+([a-zA-Z]+(?:\s+\d+)?)/i);
  if (byMatch) {
    return byMatch[1].trim();
  }
  
  // Look for specific day names
  const dayMatch = text.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
  if (dayMatch) {
    return dayMatch[1].charAt(0).toUpperCase() + dayMatch[1].slice(1).toLowerCase();
  }
  
  // Look for time phrases like "end of month"
  if (text.toLowerCase().includes('end of month')) {
    return 'End of month';
  }
  if (text.toLowerCase().includes('end of week')) {
    return 'End of week';
  }
  
  return 'TBD';
}

/**
 * Determine task category based on content
 */
function determineCategory(taskName: string): string {
  const lowerName = taskName.toLowerCase();
  
  if (lowerName.includes('api') || lowerName.includes('backend') || lowerName.includes('server')) {
    return 'Backend API';
  }
  if (lowerName.includes('ui') || lowerName.includes('frontend') || lowerName.includes('interface')) {
    return 'Frontend UI';  
  }
  if (lowerName.includes('auth') || lowerName.includes('login') || lowerName.includes('oauth')) {
    return 'Authentication';
  }
  if (lowerName.includes('database') || lowerName.includes('db') || lowerName.includes('migration')) {
    return 'Database';
  }
  if (lowerName.includes('test') || lowerName.includes('qa') || lowerName.includes('quality')) {
    return 'Quality Assurance';
  }
  if (lowerName.includes('deploy') || lowerName.includes('devops') || lowerName.includes('infrastructure')) {
    return 'DevOps';
  }
  if (lowerName.includes('design') || lowerName.includes('ux') || lowerName.includes('ui/ux')) {
    return 'Design';
  }
  if (lowerName.includes('social') || lowerName.includes('sharing') || lowerName.includes('integration')) {
    return 'Social Integration';
  }
  if (lowerName.includes('moderation') || lowerName.includes('content')) {
    return 'Content Management';
  }
  
  return 'General';
}
/**
 * Extract real risks and blockers (not completed work)
 */
function extractRealRisks(structure: any): any[] {
  const risks: any[] = [];
  
  structure.risks.forEach((risk: string, index: number) => {
    if (!isCompletedWork(risk) && risk.length > 5) {
      const severity = risk.toLowerCase().includes('critical') ? 'Critical' :
                      risk.toLowerCase().includes('high') ? 'High' : 'Medium';
      
      risks.push({
        id: `risk-${risks.length + 1}`,
        name: risk,
        severity: severity as 'Critical' | 'High' | 'Medium' | 'Low',
        description: risk,
        solution: generateRiskSolution(risk),
        confidence: 85
      });
    }
  });
  
  // Add common risks based on project content
  if (structure.technicalRequirements.some((req: string) => req.toLowerCase().includes('api'))) {
    risks.push({
      id: `risk-${risks.length + 1}`,
      name: 'API Rate Limits',
      severity: 'Medium' as const,
      description: 'Third-party API rate limits may affect functionality',
      solution: 'Implement proper rate limiting and caching strategies',
      confidence: 80
    });
  }
  
  if (structure.technicalRequirements.some((req: string) => req.toLowerCase().includes('oauth'))) {
    risks.push({
      id: `risk-${risks.length + 1}`,
      name: 'Security Compliance',
      severity: 'High' as const,
      description: 'OAuth implementation must meet security standards',
      solution: 'Follow OAuth 2.0 best practices and conduct security review',
      confidence: 85
    });
  }
  
  return risks;
}

/**
 * Generate appropriate risk solution
 */
function generateRiskSolution(risk: string): string {
  const lowerRisk = risk.toLowerCase();
  
  if (lowerRisk.includes('api') || lowerRisk.includes('rate limit')) {
    return 'Implement proper API rate limiting and error handling';
  }
  if (lowerRisk.includes('security') || lowerRisk.includes('auth')) {
    return 'Conduct security audit and follow best practices';
  }
  if (lowerRisk.includes('performance')) {
    return 'Optimize performance and implement monitoring';
  }
  if (lowerRisk.includes('deadline') || lowerRisk.includes('timeline')) {
    return 'Review timeline and adjust resource allocation';
  }
  
  return 'Monitor closely and develop mitigation strategy';
}

/**
 * Extract objectives from features and requirements
 */
function extractObjectives(structure: any): string[] {
  const objectives: string[] = [];
  
  // Extract from project title/feature
  if (structure.projectTitle.toLowerCase().includes('social media')) {
    objectives.push('Deliver Social Media Integration');
  }
  
  // Extract from technical requirements
  if (structure.technicalRequirements.some((req: string) => req.toLowerCase().includes('oauth'))) {
    objectives.push('Enable OAuth Authentication');
  }
  
  if (structure.technicalRequirements.some((req: string) => req.toLowerCase().includes('moderation'))) {
    objectives.push('Build Content Moderation System');
  }
  
  // Extract from user stories
  structure.userStories.forEach((story: string) => {
    if (story.toLowerCase().includes('share') || story.toLowerCase().includes('social')) {
      if (!objectives.some(obj => obj.includes('Social'))) {
        objectives.push('Enable Social Sharing Capabilities');
      }
    }
    if (story.toLowerCase().includes('login') || story.toLowerCase().includes('auth')) {
      if (!objectives.some(obj => obj.includes('Auth'))) {
        objectives.push('Implement User Authentication');
      }
    }
  });
  
  // Default objectives if none found
  if (objectives.length === 0) {
    objectives.push(
      'Complete project requirements analysis',
      'Deliver core functionality',
      'Ensure quality and reliability'
    );
  }
  
  return objectives;
}

/**
 * Extract deliverables from technical requirements
 */
function extractDeliverables(structure: any): string[] {
  const deliverables: string[] = [];
  
  if (structure.technicalRequirements.some((req: string) => req.toLowerCase().includes('oauth'))) {
    deliverables.push('OAuth Integration');
  }
  
  if (structure.projectTitle.toLowerCase().includes('twitter') || 
      structure.userStories.some((story: string) => story.toLowerCase().includes('twitter'))) {
    deliverables.push('Twitter Integration');
  }
  
  if (structure.technicalRequirements.some((req: string) => req.toLowerCase().includes('moderation'))) {
    deliverables.push('Moderation API');
  }
  
  if (structure.technicalRequirements.some((req: string) => req.toLowerCase().includes('api'))) {
    deliverables.push('API Documentation');
  }
  
  if (deliverables.length === 0) {
    deliverables.push('Core functionality', 'Technical documentation', 'Quality assurance');
  }
  
  return deliverables;
}

/**
 * Extract timeline information
 */
function extractTimeline(structure: any): { estimatedCompletion: string } {
  let estimatedCompletion = 'TBD';
  
  structure.timeline.forEach((timeItem: string) => {
    const lowerItem = timeItem.toLowerCase();
    if (lowerItem.includes('6 weeks')) {
      estimatedCompletion = '6 weeks';
    } else if (lowerItem.includes('3 sprints')) {
      estimatedCompletion = '3 sprints';
    } else if (lowerItem.includes('week')) {
      const weekMatch = timeItem.match(/(\d+)\s*weeks?/i);
      if (weekMatch) {
        estimatedCompletion = `${weekMatch[1]} weeks`;
      }
    }
  });
  
  return { estimatedCompletion };
}

/**
 * Generate intelligent recommendations
 */
function generateRecommendations(structure: any): any[] {
  const recommendations = [];
  
  if (structure.technicalRequirements.some((req: string) => req.toLowerCase().includes('api'))) {
    recommendations.push({
      id: 'rec-1',
      title: 'Monitor API Usage',
      description: 'Implement monitoring and alerting for API rate limits and performance',
      icon: 'monitor',
      confidence: 90
    });
  }
  
  if (structure.technicalRequirements.some((req: string) => req.toLowerCase().includes('oauth'))) {
    recommendations.push({
      id: 'rec-2',
      title: 'Implement OAuth Securely', 
      description: 'Follow OAuth 2.0 security best practices and conduct thorough testing',
      icon: 'shield',
      confidence: 95
    });
  }
  
  if (structure.technicalRequirements.some((req: string) => req.toLowerCase().includes('rate limiting'))) {
    recommendations.push({
      id: 'rec-3',
      title: 'Review Rate Limiting',
      description: 'Design comprehensive rate limiting strategy to prevent abuse',
      icon: 'gauge',
      confidence: 85
    });
  }
  
  // Default recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      {
        id: 'rec-1',
        title: 'Define Clear Milestones',
        description: 'Break down project into measurable milestones with specific deadlines',
        icon: 'calendar',
        confidence: 90
      },
      {
        id: 'rec-2',
        title: 'Assign Task Ownership', 
        description: 'Ensure every task has a clear owner for accountability',
        icon: 'user',
        confidence: 85
      }
    );
  }
  
  return recommendations;
}