export interface MockConversation {
  id: string;
  agentId: string;
  title: string;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface MockRun {
  id: string;
  conversationId: string;
  agentId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  error?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockToolCall {
  id: string;
  runId: string;
  toolName: string;
  input: any;
  output: any;
  status: 'calling' | 'completed' | 'failed';
  error?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Phase 1 Schema Interfaces
export interface MockProject {
  id: string;
  organizationId: string;
  name: string;
  createdAt: string;
}

export interface MockSeoProject {
  id: string;
  projectId: string;
  domain: string;
  gscConnected: boolean;
  gaConnected: boolean;
  createdAt: string;
}

export interface MockSeoTask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  importance: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface MockJob {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  error?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockJobEvent {
  id: string;
  jobId: string;
  message: string;
  createdAt: string;
}

export interface MockSeoProjectSettings {
  id: string;
  seoProjectId: string;
  countryCode: string;
  languageCode: string;
}

export interface MockCrawlSettings {
  id: string;
  seoProjectId: string;
  crawlBudget: number;
  userAgent: string;
  crawlConcurrency: number;
  respectRobotsTxt: boolean;
  urlExclusionRules: string[];
}

export interface MockSeoProjectBusinessProfile {
  id: string;
  seoProjectId: string;
  businessName: string;
  businessDescription: string;
  industry: string;
  audience: string;
  location: string;
  language: string;
  phone: string;
  email: string;
  address: string;
  serviceAreas: string[];
  socialProfiles: string[];
}

export interface MockSeoProjectIntegration {
  id: string;
  seoProjectId: string;
  gscProperty?: string | null;
  gbpLocation?: string | null;
}

export interface MockSeoProjectInstallation {
  id: string;
  seoProjectId: string;
  installationType: 'wordpress' | 'cloudflare' | 'custom_script';
  scriptTag: string;
  status: 'not_installed' | 'checking' | 'installed' | 'failed';
}

export interface MockConnectedData {
  gscDetails?: any;
  gbpDetailsV2?: any;
  isGscConnected: boolean;
  isGbpConnected: boolean;
}

export interface MockAfterSummary {
  healthyPages: number;
  totalPages: number;
}

export interface MockHolisticScores {
  technicalsScore: number;
  uxScore: number;
  authorityScore: number;
  contentScore: number;
}

export interface MockAiSeoProject {
  id: string;
  uuid: string;
  projectId: string;
  hostname: string;
  siteAudit: any;
  readyForProcessing: boolean;
  isFirstProcessing: boolean;
  taskStatus: 'pending' | 'started' | 'completed' | 'failed';
  pixelTagState: 'not_installed' | 'checking' | 'installed' | 'failed';
  isFrozen: boolean;
  isFavorite: boolean;
  isEngaged: boolean;
  atRiskOfWipe: boolean;
  daysUntilWipe?: number | null;
  wipeScheduledAt?: string | null;
  connectedData: MockConnectedData;
  afterSummary: MockAfterSummary;
  holisticScores: MockHolisticScores;
  aiGradeOverall: number;
  lastAnalysis?: string | null;
  nextAnalysisAt?: string | null;
  timeSavedTotal: number;
  createdAt: string;
}

export interface MockWebsiteProject {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  domain: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockWebsitePage {
  id: string;
  organizationId: string;
  websiteProjectId: string;
  projectId: string;
  title: string;
  slug: string;
  pageUrl: string;
  pageType: string;
  status: string;
  publishedUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockAiSeoProjectPage {
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
}

export interface MockAiSeoPageScores {
  id: string;
  organizationId: string;
  aiSeoProjectPageId: string;
  graderScore: number;
  contentScore: number;
  technicalScore: number;
  uxScore: number;
  authorityScore: number;
  updatedAt: string;
}

export interface MockAiSeoPageTask {
  id: string;
  organizationId: string;
  aiSeoProjectPageId: string;
  aiSeoProjectId: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'completed';
  beforeValue?: string | null;
  afterValue?: string | null;
  createdAt: string;
  updatedAt: string;
}

class MockDatabase {
  // Conversations mock data
  public conversations: MockConversation[] = [];
  public messages: MockMessage[] = [];
  public runs: MockRun[] = [];
  public toolCalls: MockToolCall[] = [];

  // Phase 1 mock data tables
  public projects: MockProject[] = [
    { id: "proj-1", organizationId: "org-1", name: "Website Bán Hàng", createdAt: new Date().toISOString() },
    { id: "proj-2", organizationId: "org-1", name: "Landing Page Dịch Vụ", createdAt: new Date().toISOString() },
    { id: "proj-3", organizationId: "org-1", name: "Dự Án Lưu Trữ", createdAt: new Date().toISOString() }
  ];
  
  public seoProjects: MockSeoProject[] = [
    { id: "seo-proj-1", projectId: "proj-1", domain: "mysite.com", gscConnected: true, gaConnected: false, createdAt: new Date().toISOString() }
  ];

  public seoTasks: MockSeoTask[] = [
    { id: "task-1", projectId: "proj-1", title: "Tối ưu hóa thẻ Description trang chủ", description: "Thẻ Description hiện tại dài 195 ký tự. Rút ngắn xuống còn 150-160 ký tự.", importance: "medium", status: "todo", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "task-2", projectId: "proj-1", title: "Sửa lỗi liên kết hỏng 404", description: "Liên kết hỏng đến /about-us-old phát hiện tại trang chủ.", importance: "high", status: "in_progress", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];

  public jobs: MockJob[] = [];
  public jobEvents: MockJobEvent[] = [];

  // Wizard mock tables
  public seoProjectSettings: MockSeoProjectSettings[] = [];
  public crawlSettings: MockCrawlSettings[] = [];
  public businessProfiles: MockSeoProjectBusinessProfile[] = [];
  public integrations: MockSeoProjectIntegration[] = [];
  public installations: MockSeoProjectInstallation[] = [];

  // Website Builder & Landing Pages mock tables
  public websiteProjects: MockWebsiteProject[] = [
    { id: "web-proj-1", organizationId: "org-1", projectId: "proj-1", name: "Shop Quần Áo", domain: "mysite.com", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "web-proj-2", organizationId: "org-1", projectId: "proj-2", name: "Blog Chia Sẻ", domain: "myblog.io", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];

  public websitePages: MockWebsitePage[] = [
    {
      id: "web-page-1",
      organizationId: "org-1",
      websiteProjectId: "web-proj-1",
      projectId: "proj-1",
      title: "Trang Chủ Shop",
      slug: "index",
      pageUrl: "https://mysite.com",
      pageType: "landing_page",
      status: "published",
      publishedUrl: "https://mysite.com",
      seoTitle: "Mua Sắm Quần Áo Thời Trang Giá Tốt",
      seoDescription: "Shop quần áo thời trang nam nữ cao cấp chất lượng.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "web-page-2",
      organizationId: "org-1",
      websiteProjectId: "web-proj-1",
      projectId: "proj-1",
      title: "Khuyến Mãi Hè 2026",
      slug: "khuyen-mai-he",
      pageUrl: "https://mysite.com/p/khuyen-mai-he",
      pageType: "landing_page",
      status: "published",
      publishedUrl: "https://mysite.com/p/khuyen-mai-he",
      seoTitle: "Khuyến mãi Hè Rực Rỡ 50%",
      seoDescription: "Săn deal hot thời trang hè giảm giá cực sốc.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "web-page-3",
      organizationId: "org-1",
      websiteProjectId: "web-proj-2",
      projectId: "proj-2",
      title: "Giới thiệu sản phẩm mới",
      slug: "new-arrivals",
      pageUrl: "https://myblog.io/p/new-arrivals",
      pageType: "landing_page",
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  public aiSeoProjectPages: MockAiSeoProjectPage[] = [
    {
      id: "seo-page-1",
      organizationId: "org-1",
      aiSeoProjectId: "ai-proj-1",
      projectId: "proj-1",
      websitePageId: "web-page-1",
      pageUrl: "https://mysite.com",
      pageType: "landing_page",
      source: "internal",
      scanStatus: "completed",
      lastScannedAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "seo-page-2",
      organizationId: "org-1",
      aiSeoProjectId: "ai-proj-1",
      projectId: "proj-1",
      websitePageId: "web-page-2",
      pageUrl: "https://mysite.com/p/khuyen-mai-he",
      pageType: "landing_page",
      source: "internal",
      scanStatus: "completed",
      lastScannedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  public aiSeoPageScores: MockAiSeoPageScores[] = [
    {
      id: "score-page-1",
      organizationId: "org-1",
      aiSeoProjectPageId: "seo-page-1",
      graderScore: 85,
      contentScore: 80,
      technicalScore: 90,
      uxScore: 82,
      authorityScore: 75,
      updatedAt: new Date().toISOString()
    },
    {
      id: "score-page-2",
      organizationId: "org-1",
      aiSeoProjectPageId: "seo-page-2",
      graderScore: 78,
      contentScore: 75,
      technicalScore: 82,
      uxScore: 80,
      authorityScore: 60,
      updatedAt: new Date().toISOString()
    }
  ];

  public aiSeoPageTasks: MockAiSeoPageTask[] = [
    {
      id: "page-task-1",
      organizationId: "org-1",
      aiSeoProjectPageId: "seo-page-1",
      aiSeoProjectId: "ai-proj-1",
      title: "Rút ngắn tiêu đề SEO",
      description: "Tiêu đề hiện tại chứa 72 ký tự. Độ dài khuyến nghị là 50-60 ký tự.",
      category: "on_page",
      priority: "high",
      status: "todo",
      beforeValue: "Mua Sắm Quần Áo Thời Trang Giá Tốt Cực Sốc Cho Mọi Nhà",
      afterValue: "Mua Sắm Quần Áo Thời Trang Giá Tốt",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "page-task-2",
      organizationId: "org-1",
      aiSeoProjectPageId: "seo-page-1",
      aiSeoProjectId: "ai-proj-1",
      title: "Thêm từ khóa chính vào thẻ H1",
      description: "Từ khóa chính 'quần áo thời trang' chưa xuất hiện trong thẻ tiêu đề H1 trang chủ.",
      category: "content",
      priority: "medium",
      status: "todo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // AI SEO Automation Dashboard mock data
  public aiSeoProjects: MockAiSeoProject[] = [
    {
      id: "ai-proj-1",
      uuid: "ai-uuid-1",
      projectId: "proj-1",
      hostname: "mysite.com",
      siteAudit: { checkedCount: 154, errorCount: 12 },
      readyForProcessing: true,
      isFirstProcessing: false,
      taskStatus: "completed",
      pixelTagState: "installed",
      isFrozen: false,
      isFavorite: true,
      isEngaged: true,
      atRiskOfWipe: false,
      connectedData: {
        isGscConnected: true,
        isGbpConnected: true,
        gscDetails: { property: "sc-domain:mysite.com" },
        gbpDetailsV2: { locationName: "TechSoft Office" }
      },
      afterSummary: { healthyPages: 142, totalPages: 154 },
      holisticScores: { technicalsScore: 88, uxScore: 92, authorityScore: 78, contentScore: 84 },
      aiGradeOverall: 86,
      lastAnalysis: new Date(Date.now() - 86400000).toISOString(),
      nextAnalysisAt: new Date(Date.now() + 86405000 * 6).toISOString(),
      timeSavedTotal: 124,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: "ai-proj-2",
      uuid: "ai-uuid-2",
      projectId: "proj-2",
      hostname: "myblog.io",
      siteAudit: { checkedCount: 0, errorCount: 0 },
      readyForProcessing: false,
      isFirstProcessing: true,
      taskStatus: "pending",
      pixelTagState: "not_installed",
      isFrozen: false,
      isFavorite: false,
      isEngaged: false,
      atRiskOfWipe: true,
      daysUntilWipe: 3,
      wipeScheduledAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      connectedData: {
        isGscConnected: false,
        isGbpConnected: false
      },
      afterSummary: { healthyPages: 0, totalPages: 0 },
      holisticScores: { technicalsScore: 0, uxScore: 0, authorityScore: 0, contentScore: 0 },
      aiGradeOverall: 0,
      timeSavedTotal: 0,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: "ai-proj-3",
      uuid: "ai-uuid-3",
      projectId: "proj-3",
      hostname: "frozensite.net",
      siteAudit: { checkedCount: 42, errorCount: 1 },
      readyForProcessing: true,
      isFirstProcessing: false,
      taskStatus: "completed",
      pixelTagState: "installed",
      isFrozen: true,
      isFavorite: false,
      isEngaged: true,
      atRiskOfWipe: false,
      connectedData: {
        isGscConnected: true,
        isGbpConnected: false,
        gscDetails: { property: "sc-domain:frozensite.net" }
      },
      afterSummary: { healthyPages: 41, totalPages: 42 },
      holisticScores: { technicalsScore: 91, uxScore: 85, authorityScore: 60, contentScore: 70 },
      aiGradeOverall: 76,
      lastAnalysis: new Date(Date.now() - 3 * 86400000).toISOString(),
      nextAnalysisAt: new Date(Date.now() + 86400000 * 3).toISOString(),
      timeSavedTotal: 45,
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
    }
  ];

  constructor() {
    // Seed initial demo conversation if empty
    if (this.conversations.length === 0) {
      const convoId = "demo-convo-id";
      this.conversations.push({
        id: convoId,
        agentId: "chat-assistant",
        title: "Tối ưu hóa SEO bài đăng blog mới",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString()
      });

      this.messages.push(
        {
          id: "m1",
          conversationId: convoId,
          role: "user",
          content: "Chào trợ lý, tôi muốn tối ưu SEO cho bài đăng blog mới về chủ đề 'Thiết kế landing page SaaS'.",
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: "m2",
          conversationId: convoId,
          role: "assistant",
          content: "Chào bạn! Đây là một chủ đề rất tiềm năng cho phân khúc SaaS. Để tối ưu SEO tốt nhất cho bài viết này, bạn nên thực hiện các bước sau:\n\n1. **Chọn từ khóa chính**: Xác định cụm từ khóa có lượng tìm kiếm tốt nhưng cạnh tranh vừa phải, ví dụ: 'thiết kế landing page saas', 'landing page saas chuẩn seo'.\n2. **Tối ưu thẻ tiêu đề (Title Tag)**: Tiêu đề chứa từ khóa chính ở đầu, có độ dài khoảng 50-60 ký tự.\n3. **Cấu trúc bài viết**: Sử dụng các thẻ Heading (H1, H2, H3) hợp lý để phân cấp chủ đề bài viết.\n\nTôi có thể giúp bạn lập dàn ý bài viết (Content Strategy) hoặc tìm các từ khóa phụ (Keyword Research) cho chủ đề này. Bạn muốn bắt đầu với việc nào trước?",
          createdAt: new Date(Date.now() - 3550000).toISOString()
        }
      );
    }
  }

  // Conversation Helpers
  getConversations() {
    const agents = [
      { id: "chat-assistant", name: "AI Chat Assistant", role: "Trợ lý SEO đa năng", avatar: "🤖" },
      { id: "seo-audit", name: "SEO Audit Agent", role: "Chuyên gia kiểm toán kỹ thuật", avatar: "🔍" },
      { id: "content-strategy", name: "Content Strategy Agent", role: "Kiến trúc sư nội dung", avatar: "✍️" },
      { id: "topical-authority", name: "Topical Authority Agent", role: "Chuyên gia phủ chủ đề & liên kết", avatar: "🕸️" },
      { id: "keyword-research", name: "Keyword Research Agent", role: "Nhà nghiên cứu từ khóa", avatar: "📊" },
      { id: "competitor-analysis", name: "Competitor Analysis Agent", role: "Chuyên gia phân tích đối thủ", avatar: "⚔️" }
    ];

    return [...this.conversations]
      .map(c => {
        const agent = agents.find(a => a.id === c.agentId);
        return {
          ...c,
          agent_id: c.agentId,
          created_at: c.createdAt,
          updated_at: c.updatedAt,
          agent
        };
      })
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }

  createConversation(agentId: string, title?: string, userId?: string | null) {
    const convo: MockConversation = {
      id: crypto.randomUUID(),
      agentId,
      title: title || `Cuộc trò chuyện mới`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.conversations.push(convo);
    return convo;
  }

  getMessages(convoId: string) {
    return this.messages.filter(m => m.conversationId === convoId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  addMessage(convoId: string, role: 'user' | 'assistant' | 'system', content: string) {
    const msg: MockMessage = {
      id: crypto.randomUUID(),
      conversationId: convoId,
      role,
      content,
      createdAt: new Date().toISOString()
    };
    this.messages.push(msg);

    const convo = this.conversations.find(c => c.id === convoId);
    if (convo) {
      convo.updatedAt = new Date().toISOString();
    }
    return msg;
  }

  deleteConversation(convoId: string) {
    this.conversations = this.conversations.filter(c => c.id !== convoId);
    this.messages = this.messages.filter(m => m.conversationId !== convoId);
  }

  renameConversation(convoId: string, title: string) {
    const convo = this.conversations.find(c => c.id === convoId);
    if (convo) {
      convo.title = title;
      convo.updatedAt = new Date().toISOString();
      return convo;
    }
    return null;
  }

  createRun(convoId: string, agentId: string) {
    const run: MockRun = {
      id: crypto.randomUUID(),
      conversationId: convoId,
      agentId,
      status: 'queued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.runs.push(run);
    return run;
  }

  updateRunStatus(runId: string, status: 'queued' | 'running' | 'completed' | 'failed', error?: string | null) {
    const run = this.runs.find(r => r.id === runId);
    if (run) {
      run.status = status;
      if (error !== undefined) run.error = error;
      run.updatedAt = new Date().toISOString();
      return run;
    }
    return null;
  }

  createToolCall(runId: string, toolName: string, input: any) {
    const toolCall: MockToolCall = {
      id: crypto.randomUUID(),
      runId,
      toolName,
      input,
      output: {},
      status: 'calling',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.toolCalls.push(toolCall);
    return toolCall;
  }

  updateToolCall(toolCallId: string, status: 'calling' | 'completed' | 'failed', output: any, error?: string | null) {
    const toolCall = this.toolCalls.find(tc => tc.id === toolCallId);
    if (toolCall) {
      toolCall.status = status;
      toolCall.output = output;
      if (error !== undefined) toolCall.error = error;
      toolCall.updatedAt = new Date().toISOString();
      return toolCall;
    }
    return null;
  }

  getToolCallsForRun(runId: string) {
    return this.toolCalls.filter(tc => tc.runId === runId);
  }

  // Projects Helpers
  getProjects(orgId: string) {
    return this.projects.filter(p => p.organizationId === orgId);
  }

  createProject(orgId: string, name: string) {
    const project: MockProject = {
      id: `proj-${Date.now()}`,
      organizationId: orgId,
      name,
      createdAt: new Date().toISOString()
    };
    this.projects.push(project);
    return project;
  }

  updateProject(projectId: string, name: string) {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      project.name = name;
      return project;
    }
    return null;
  }

  deleteProject(projectId: string) {
    this.projects = this.projects.filter(p => p.id !== projectId);
    this.seoProjects = this.seoProjects.filter(sp => sp.projectId !== projectId);
    this.seoTasks = this.seoTasks.filter(t => t.projectId !== projectId);
  }

  // SEO Projects Helpers
  getSeoProjects(orgId: string) {
    // In memory, we map all seo projects whose matching parent project belongs to orgId
    const projectIds = this.getProjects(orgId).map(p => p.id);
    return this.seoProjects.filter(sp => projectIds.includes(sp.projectId));
  }

  createSeoProject(projectId: string, domain: string) {
    const seoProject: MockSeoProject = {
      id: `seo-proj-${Date.now()}`,
      projectId,
      domain,
      gscConnected: false,
      gaConnected: false,
      createdAt: new Date().toISOString()
    };
    this.seoProjects.push(seoProject);
    return seoProject;
  }

  // SEO Tasks Helpers
  getSeoTasks(projectId: string) {
    return this.seoTasks.filter(t => t.projectId === projectId);
  }

  updateSeoTask(taskId: string, status: 'todo' | 'in_progress' | 'completed') {
    const task = this.seoTasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      task.updatedAt = new Date().toISOString();
      return task;
    }
    return null;
  }

  // Background Jobs Helpers
  getJob(jobId: string) {
    return this.jobs.find(j => j.id === jobId) || null;
  }

  getJobEvents(jobId: string) {
    return this.jobEvents.filter(e => e.jobId === jobId);
  }

  createJob(orgId: string, projectId: string, name: string) {
    const job: MockJob = {
      id: `job-${Date.now()}`,
      organizationId: orgId,
      projectId: projectId,
      name,
      status: "queued",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.jobs.push(job);
    
    // Add initial log
    this.addJobEvent(job.id, "Bắt đầu khởi tạo phiên quét crawl sitemap...");
    return job;
  }

  addJobEvent(jobId: string, message: string) {
    const event: MockJobEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      jobId,
      message,
      createdAt: new Date().toISOString()
    };
    this.jobEvents.push(event);
    return event;
  }

  // Simulated Asynchronous background run trigger
  async simulateJobExecution(jobId: string, projectId: string) {
    const job = this.getJob(jobId);
    if (!job) return;

    // Transition 1: running
    await new Promise(resolve => setTimeout(resolve, 2000));
    job.status = "running";
    job.updatedAt = new Date().toISOString();
    this.addJobEvent(jobId, "Bot crawl đang kiểm tra file robots.txt và sitemap.xml...");

    // Log progress
    await new Promise(resolve => setTimeout(resolve, 2500));
    this.addJobEvent(jobId, "Đã phát hiện 32 trang mới. Tiến hành chấm điểm tối ưu thẻ Heading...");

    // Transition 2: success and generate recommendations
    await new Promise(resolve => setTimeout(resolve, 2500));
    job.status = "success";
    job.updatedAt = new Date().toISOString();
    this.addJobEvent(jobId, "Audit kết thúc! Đã đẩy 2 khuyến nghị mới vào mục Cần Xử Lý.");

    // Generate new recommendations
    this.seoTasks.push(
      {
        id: `task-${Date.now()}-1`,
        projectId,
        title: "Tối ưu hóa hình ảnh Banner trang chủ",
        description: "Ảnh Banner nặng 1.8MB làm giảm tốc độ LCP. Chuyển đổi định dạng sang WebP và kích hoạt thuộc tính loading='lazy'.",
        importance: "high",
        status: "todo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `task-${Date.now()}-2`,
        projectId,
        title: "Bổ sung Canonical Tag cho trang chính sách",
        description: "Thiếu Canonical tag tự tham chiếu trên trang điều khoản, dễ gây trùng lặp nội dung khi lập chỉ mục.",
        importance: "low",
        status: "todo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
  }

  // Wizard helpers
  createSeoProjectWithWizard(
    orgId: string,
    name: string,
    websiteUrl: string,
    countryCode: string,
    languageCode: string,
    crawlBudget: number,
    userAgent: string,
    crawlConcurrency: number,
    respectRobotsTxt: boolean,
    urlExclusionRules: string[]
  ) {
    // 1. Create parent project
    const project = this.createProject(orgId, name);
    // 2. Create seo project
    const seoProject = this.createSeoProject(project.id, websiteUrl);

    // 3. Create settings
    const settings: MockSeoProjectSettings = {
      id: `settings-${Date.now()}`,
      seoProjectId: seoProject.id,
      countryCode,
      languageCode
    };
    this.seoProjectSettings.push(settings);

    // 4. Create crawl settings
    const crawlSet: MockCrawlSettings = {
      id: `crawl-${Date.now()}`,
      seoProjectId: seoProject.id,
      crawlBudget,
      userAgent,
      crawlConcurrency,
      respectRobotsTxt,
      urlExclusionRules
    };
    this.crawlSettings.push(crawlSet);

    // 5. Create empty business profile
    const profile: MockSeoProjectBusinessProfile = {
      id: `profile-${Date.now()}`,
      seoProjectId: seoProject.id,
      businessName: name,
      businessDescription: "",
      industry: "",
      audience: "",
      location: "",
      language: languageCode,
      phone: "",
      email: "",
      address: "",
      serviceAreas: [],
      socialProfiles: []
    };
    this.businessProfiles.push(profile);

    // 6. Create empty integrations
    const integ: MockSeoProjectIntegration = {
      id: `integ-${Date.now()}`,
      seoProjectId: seoProject.id,
      gscProperty: null,
      gbpLocation: null
    };
    this.integrations.push(integ);

    // 7. Create installation setup
    const install: MockSeoProjectInstallation = {
      id: `install-${Date.now()}`,
      seoProjectId: seoProject.id,
      installationType: "custom_script",
      scriptTag: `<script async src="https://api.otto-seo.com/sdk/${seoProject.id}.js"></script>`,
      status: "not_installed"
    };
    this.installations.push(install);

    return { seoProject, settings, crawlSettings: crawlSet, businessProfile: profile, integrations: integ, installation: install };
  }

  getSeoProjectDetails(seoProjectId: string) {
    const seoProject = this.seoProjects.find(sp => sp.id === seoProjectId);
    if (!seoProject) return null;

    const settings = this.seoProjectSettings.find(s => s.seoProjectId === seoProjectId) || null;
    const crawlSet = this.crawlSettings.find(c => c.seoProjectId === seoProjectId) || null;
    const businessProfile = this.businessProfiles.find(b => b.seoProjectId === seoProjectId) || null;
    const integrations = this.integrations.find(i => i.seoProjectId === seoProjectId) || null;
    const installation = this.installations.find(inst => inst.seoProjectId === seoProjectId) || null;

    return {
      seoProject,
      settings,
      crawlSettings: crawlSet,
      businessProfile,
      integrations,
      installation
    };
  }

  updateSeoProjectSetup(
    seoProjectId: string,
    profileFields: Partial<Omit<MockSeoProjectBusinessProfile, 'id' | 'seoProjectId'>>,
    integrationsFields: Partial<Omit<MockSeoProjectIntegration, 'id' | 'seoProjectId'>>
  ) {
    const profile = this.businessProfiles.find(b => b.seoProjectId === seoProjectId);
    if (profile) {
      Object.assign(profile, profileFields);
    }
    const integ = this.integrations.find(i => i.seoProjectId === seoProjectId);
    if (integ) {
      Object.assign(integ, integrationsFields);
    }
    return { profile, integrations: integ };
  }

  updateInstallationStatus(seoProjectId: string, status: 'not_installed' | 'checking' | 'installed' | 'failed') {
    const install = this.installations.find(inst => inst.seoProjectId === seoProjectId);
    if (install) {
      install.status = status;
      return install;
    }
    return null;
  }

  // AI SEO Automation Dashboard mock helpers
  getAiSeoProjects(orgId: string) {
    const projectIds = this.getProjects(orgId).map(p => p.id);
    return this.aiSeoProjects.filter(ap => projectIds.includes(ap.projectId));
  }

  toggleFavoriteProject(projectId: string) {
    const ap = this.aiSeoProjects.find(p => p.id === projectId || p.projectId === projectId);
    if (ap) {
      ap.isFavorite = !ap.isFavorite;
      return ap;
    }
    return null;
  }

  toggleAgentStatus(projectId: string) {
    const ap = this.aiSeoProjects.find(p => p.id === projectId || p.projectId === projectId);
    if (ap) {
      ap.isEngaged = !ap.isEngaged;
      return ap;
    }
    return null;
  }

  createAiSeoProject(orgId: string, hostname: string, name: string) {
    const project = this.createProject(orgId, name);
    const ap: MockAiSeoProject = {
      id: `ai-proj-${Date.now()}`,
      uuid: crypto.randomUUID(),
      projectId: project.id,
      hostname,
      siteAudit: { checkedCount: 0, errorCount: 0 },
      readyForProcessing: false,
      isFirstProcessing: true,
      taskStatus: "pending",
      pixelTagState: "not_installed",
      isFrozen: false,
      isFavorite: false,
      isEngaged: true,
      atRiskOfWipe: false,
      connectedData: {
        isGscConnected: false,
        isGbpConnected: false
      },
      afterSummary: { healthyPages: 0, totalPages: 0 },
      holisticScores: { technicalsScore: 0, uxScore: 0, authorityScore: 0, contentScore: 0 },
      aiGradeOverall: 0,
      timeSavedTotal: 0,
      createdAt: new Date().toISOString()
    };
    this.aiSeoProjects.push(ap);
    return ap;
  }

  async simulateProjectScan(projectId: string, jobId: string) {
    const ap = this.aiSeoProjects.find(p => p.id === projectId || p.projectId === projectId);
    if (!ap) return;

    ap.taskStatus = "started";
    this.addJobEvent(jobId, "Đang khởi tạo crawler quét toàn bộ sitemap...");

    await new Promise(resolve => setTimeout(resolve, 2000));
    this.addJobEvent(jobId, "Đã crawl 45 trang. Đang chấm điểm Technical SEO và UX Signals...");

    await new Promise(resolve => setTimeout(resolve, 2000));
    this.addJobEvent(jobId, "Đang đồng bộ điểm Content & Authority...");
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    ap.readyForProcessing = true;
    ap.isFirstProcessing = false;
    ap.taskStatus = "completed";
    ap.aiGradeOverall = 82;
    ap.siteAudit = { checkedCount: 45, errorCount: 2 };
    ap.afterSummary = { healthyPages: 43, totalPages: 45 };
    ap.holisticScores = {
      technicalsScore: 85,
      uxScore: 80,
      authorityScore: 75,
      contentScore: 88
    };
    ap.lastAnalysis = new Date().toISOString();
    ap.nextAnalysisAt = new Date(Date.now() + 7 * 86400000).toISOString();
    ap.timeSavedTotal = 15;

    const job = this.getJob(jobId);
    if (job) {
      job.status = "success";
      job.updatedAt = new Date().toISOString();
    }
    this.addJobEvent(jobId, "Quá trình quét hoàn tất! Kết quả đã được cập nhật vào Dashboard.");
  }

  // Website Builder & Landing Pages Helpers
  getWebsiteProjects(orgId: string) {
    return this.websiteProjects.filter(wp => wp.organizationId === orgId);
  }

  getWebsitePages(websiteProjectId: string) {
    return this.websitePages.filter(wp => wp.websiteProjectId === websiteProjectId);
  }

  publishWebsitePage(websiteProjectId: string, pageId: string) {
    const page = this.websitePages.find(p => p.id === pageId && p.websiteProjectId === websiteProjectId);
    if (page) {
      page.status = "published";
      page.publishedUrl = page.pageUrl;
      page.updatedAt = new Date().toISOString();
      return page;
    }
    return null;
  }

  connectWebsitePageToAiSeo(websiteProjectId: string, pageId: string, aiSeoProjectId: string) {
    const page = this.websitePages.find(p => p.id === pageId && p.websiteProjectId === websiteProjectId);
    const ap = this.aiSeoProjects.find(p => p.id === aiSeoProjectId || p.projectId === aiSeoProjectId);
    
    if (page && ap) {
      const existing = this.aiSeoProjectPages.find(p => p.websitePageId === pageId && p.aiSeoProjectId === ap.id);
      if (existing) return existing;

      const newConnected: MockAiSeoProjectPage = {
        id: `seo-page-${Date.now()}`,
        organizationId: page.organizationId,
        aiSeoProjectId: ap.id,
        projectId: page.projectId,
        websitePageId: page.id,
        pageUrl: page.pageUrl,
        pageType: page.pageType,
        source: "internal",
        scanStatus: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.aiSeoProjectPages.push(newConnected);
      return newConnected;
    }
    return null;
  }

  getAiSeoProjectPages(aiSeoProjectId: string) {
    const ap = this.aiSeoProjects.find(p => p.id === aiSeoProjectId || p.projectId === aiSeoProjectId);
    if (!ap) return [];
    
    return this.aiSeoProjectPages
      .filter(p => p.aiSeoProjectId === ap.id)
      .map(p => {
        const score = this.aiSeoPageScores.find(s => s.aiSeoProjectPageId === p.id);
        return {
          ...p,
          graderScore: score?.graderScore || 0,
          contentScore: score?.contentScore || 0,
          technicalScore: score?.technicalScore || 0,
          uxScore: score?.uxScore || 0,
          authorityScore: score?.authorityScore || 0
        };
      });
  }

  linkLandingPage(aiSeoProjectId: string, pageUrl: string, websitePageId?: string | null, source: 'internal' | 'external' = 'external') {
    const ap = this.aiSeoProjects.find(p => p.id === aiSeoProjectId || p.projectId === aiSeoProjectId);
    if (!ap) return null;

    const newConnected: MockAiSeoProjectPage = {
      id: `seo-page-${Date.now()}`,
      organizationId: "org-1",
      aiSeoProjectId: ap.id,
      projectId: ap.projectId,
      websitePageId: websitePageId || null,
      pageUrl,
      pageType: "landing_page",
      source,
      scanStatus: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.aiSeoProjectPages.push(newConnected);
    return newConnected;
  }

  unlinkLandingPage(aiSeoProjectId: string, pageId: string) {
    const ap = this.aiSeoProjects.find(p => p.id === aiSeoProjectId || p.projectId === aiSeoProjectId);
    if (!ap) return false;

    this.aiSeoProjectPages = this.aiSeoProjectPages.filter(p => p.id !== pageId);
    this.aiSeoPageScores = this.aiSeoPageScores.filter(s => s.aiSeoProjectPageId !== pageId);
    this.aiSeoPageTasks = this.aiSeoPageTasks.filter(t => t.aiSeoProjectPageId !== pageId);
    return true;
  }

  getAiSeoPageScores(aiSeoProjectPageId: string) {
    return this.aiSeoPageScores.find(s => s.aiSeoProjectPageId === aiSeoProjectPageId) || null;
  }

  getAiSeoPageTasks(aiSeoProjectPageId: string) {
    return this.aiSeoPageTasks.filter(t => t.aiSeoProjectPageId === aiSeoProjectPageId);
  }

  async simulatePageScan(aiSeoProjectId: string, pageId: string, jobId: string) {
    const page = this.aiSeoProjectPages.find(p => p.id === pageId);
    if (!page) return;

    page.scanStatus = "scanning";
    this.addJobEvent(jobId, `Khởi chạy bộ chấm điểm SEO cho trang con: ${page.pageUrl}...`);

    await new Promise(resolve => setTimeout(resolve, 1500));
    this.addJobEvent(jobId, `Đang chấm điểm nội dung và tối ưu hóa thẻ heading...`);

    await new Promise(resolve => setTimeout(resolve, 1500));
    page.scanStatus = "completed";
    page.lastScannedAt = new Date().toISOString();
    
    // Upsert scores
    this.aiSeoPageScores = this.aiSeoPageScores.filter(s => s.aiSeoProjectPageId !== pageId);
    this.aiSeoPageScores.push({
      id: `score-${Date.now()}`,
      organizationId: page.organizationId,
      aiSeoProjectPageId: pageId,
      graderScore: Math.floor(Math.random() * 20) + 75,
      contentScore: Math.floor(Math.random() * 30) + 65,
      technicalScore: Math.floor(Math.random() * 20) + 80,
      uxScore: Math.floor(Math.random() * 20) + 75,
      authorityScore: Math.floor(Math.random() * 30) + 55,
      updatedAt: new Date().toISOString()
    });

    // Seed 1-2 new tasks for page
    this.aiSeoPageTasks = this.aiSeoPageTasks.filter(t => t.aiSeoProjectPageId !== pageId);
    this.aiSeoPageTasks.push({
      id: `page-task-${Date.now()}-1`,
      organizationId: page.organizationId,
      aiSeoProjectPageId: pageId,
      aiSeoProjectId: aiSeoProjectId,
      title: "Cải thiện mật độ từ khóa chính",
      description: "Mật độ từ khóa chính hiện tại chỉ đạt 0.3%. Khuyên dùng 1% - 1.5% cho tối ưu hóa on-page.",
      category: "content",
      priority: "medium",
      status: "todo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const job = this.getJob(jobId);
    if (job) {
      job.status = "success";
      job.updatedAt = new Date().toISOString();
    }
    this.addJobEvent(jobId, "Chấm điểm trang con kết thúc! Kết quả đã sẵn sàng.");
  }
}

export const mockDb = new MockDatabase();
