export interface Organization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface SeoProject {
  id: string;
  project_id: string;
  domain: string;
  gsc_connected: boolean;
  ga_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeoTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  importance: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface SeoTaskActivityLog {
  id: string;
  task_id: string;
  action: string;
  details?: string;
  created_at: string;
}

export interface Job {
  id: string;
  organization_id: string;
  project_id: string;
  name: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobEvent {
  id: string;
  job_id: string;
  message: string;
  created_at: string;
}

export interface QuotaDefinition {
  id: string;
  name: string;
  limit_value: number;
  created_at: string;
}

export interface QuotaBalance {
  id: string;
  organization_id: string;
  quota_definition_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
  definition?: QuotaDefinition;
}

export interface Playbook {
  id: string;
  name: string;
  prompt: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  playbooks?: Playbook[];
}

export interface Conversation {
  id: string;
  agentId: string;
  title: string;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
  agent_id?: string;
  created_at?: string;
  updated_at?: string;
  agent?: Agent;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
  created_at?: string;
  conversation_id?: string;
}

export interface Run {
  id: string;
  conversationId: string;
  agentId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  error?: string | null;
  createdAt: string;
  updatedAt: string;
  created_at?: string;
  updated_at?: string;
  conversation_id?: string;
  agent_id?: string;
}

export interface ToolCall {
  id: string;
  runId: string;
  toolName: string;
  input: any;
  output: any;
  status: 'calling' | 'completed' | 'failed';
  error?: string | null;
  createdAt: string;
  updatedAt: string;
  created_at?: string;
  updated_at?: string;
  run_id?: string;
  tool_name?: string;
}

export type AiSeoProjectStatus = 'active' | 'deep_frozen' | 'archived' | 'deleting';

export type InstallationStatus = 'not_installed' | 'installing' | 'installed' | 'failed' | 'duplicate_installation';

export type ProcessingStatus = 'not_started' | 'pending' | 'started' | 'ready' | 'failed';

export type AgentStatus = 'engaged' | 'disengaged';

export interface AiSeoScores {
  healthyPages: number;
  totalPages: number;
  graderScore: number;
  contentScore: number;
  authorityScore: number;
  technicalScore: number;
  uxScore: number;
}

export interface AiSeoProjectListItem {
  id: string;
  uuid: string;
  organizationId: string;
  projectId: string;
  domain: string;
  hostname: string;
  faviconUrl?: string;
  status: AiSeoProjectStatus;
  isFavorite: boolean;
  installationStatus: InstallationStatus;
  processingStatus: ProcessingStatus;
  readyForProcessing: boolean;
  taskStatus: 'pending' | 'started' | 'completed' | 'failed';
  agentStatus: AgentStatus;
  pixelTagState: 'not_installed' | 'checking' | 'installed' | 'failed';
  detectedCms?: string | null;
  isFrozen: boolean;
  atRiskOfWipe: boolean;
  daysUntilWipe?: number | null;
  wipeScheduledAt?: string | null;
  gscConnected: boolean;
  gbpConnected: boolean;
  gscDetails?: any;
  gbpDetails?: any;
  connectedData?: {
    isGscConnected: boolean;
    isGbpConnected: boolean;
    gscDetails?: any;
    gbpDetailsV2?: any;
  };
  afterSummary?: {
    healthyPages: number;
    totalPages: number;
  };
  holisticScores?: {
    technicalsScore: number;
    uxScore: number;
    authorityScore: number;
    contentScore: number;
  };
  aiGradeOverall?: number;
  scores: AiSeoScores;
  lastScanAt?: string | null;
  nextScanAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteProject {
  id: string;
  organization_id: string;
  project_id: string;
  name: string;
  domain: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface WebsitePage {
  id: string;
  organization_id: string;
  website_project_id?: string | null;
  project_id: string;
  title: string;
  slug: string;
  page_url: string;
  page_type: string;
  status: 'draft' | 'published';
  published_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiSeoProjectPage {
  id: string;
  organizationId: string;
  aiSeoProjectId: string;
  projectId: string;
  websitePageId?: string | null;
  pageUrl: string;
  pageType: string;
  source: 'internal' | 'external';
  scanStatus: 'pending' | 'scanning' | 'completed' | 'failed';
  lastScanJobId?: string | null;
  lastScannedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // joined scores
  graderScore: number;
  contentScore: number;
  technicalScore: number;
  uxScore: number;
  authorityScore: number;
}

export interface AiSeoPageScore {
  id: string;
  organization_id: string;
  ai_seo_project_page_id: string;
  grader_score: number;
  content_score: number;
  technical_score: number;
  ux_score: number;
  authority_score: number;
  updated_at: string;
}

export interface AiSeoPageTask {
  id: string;
  organization_id: string;
  ai_seo_project_page_id: string;
  ai_seo_project_id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'completed';
  before_value?: string | null;
  after_value?: string | null;
  created_at: string;
  updated_at: string;
}


