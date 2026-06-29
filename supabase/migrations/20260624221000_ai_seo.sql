-- Supabase Migration: 20260624221000_ai_seo.sql
-- Description: Schema for Next-Gen AI SEO Agent Hub including agents, conversations, messages, runs, and tool calls.

-- 1. AI Agents table
CREATE TABLE IF NOT EXISTS public.ai_agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT NOT NULL,
    avatar TEXT,
    playbooks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. AI Conversations table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Cuộc hội thoại mới',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. AI Messages table
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. AI Runs table (tracks agent runs)
CREATE TABLE IF NOT EXISTS public.ai_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. AI Tool Calls table (tracks tools invoked during a run)
CREATE TABLE IF NOT EXISTS public.ai_tool_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.ai_runs(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    input JSONB NOT NULL DEFAULT '{}'::jsonb,
    output JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('calling', 'completed', 'failed')),
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Indexes for Query Optimization
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_agent_id ON public.ai_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_conversation_id ON public.ai_runs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_calls_run_id ON public.ai_tool_calls(run_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tool_calls ENABLE ROW LEVEL SECURITY;

-- 1. Policies for ai_agents (Anyone can read, write is admin/system only)
CREATE POLICY "Allow public read access to ai_agents"
    ON public.ai_agents FOR SELECT
    USING (true);

-- 2. Policies for ai_conversations
CREATE POLICY "Users can manage their own conversations"
    ON public.ai_conversations FOR ALL
    USING (user_id = auth.uid() OR user_id IS NULL)
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- 3. Policies for ai_messages
CREATE POLICY "Users can manage messages in their conversations"
    ON public.ai_messages FOR ALL
    USING (
        conversation_id IN (
            SELECT id FROM public.ai_conversations 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    )
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM public.ai_conversations 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- 4. Policies for ai_runs
CREATE POLICY "Users can view runs in their conversations"
    ON public.ai_runs FOR ALL
    USING (
        conversation_id IN (
            SELECT id FROM public.ai_conversations 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    )
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM public.ai_conversations 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- 5. Policies for ai_tool_calls
CREATE POLICY "Users can view tool calls in their runs"
    ON public.ai_tool_calls FOR ALL
    USING (
        run_id IN (
            SELECT r.id FROM public.ai_runs r
            JOIN public.ai_conversations c ON r.conversation_id = c.id
            WHERE c.user_id = auth.uid() OR c.user_id IS NULL
        )
    )
    WITH CHECK (
        run_id IN (
            SELECT r.id FROM public.ai_runs r
            JOIN public.ai_conversations c ON r.conversation_id = c.id
            WHERE c.user_id = auth.uid() OR c.user_id IS NULL
        )
    );

-- Seed Initial AI Agents data
INSERT INTO public.ai_agents (id, name, role, description, avatar, playbooks)
VALUES 
(
    'chat-assistant', 
    'AI Chat Assistant', 
    'Trợ lý SEO đa năng', 
    'Hỗ trợ giải đáp các câu hỏi về SEO, phân tích sơ bộ và tư vấn chiến lược nội dung, kỹ thuật tổng quan.',
    '🤖',
    '[
        {"id": "seo-intro", "name": "Giải thích chuẩn SEO", "prompt": "Hãy giải thích thế nào là cấu trúc website chuẩn SEO và các bước tối ưu hóa ban đầu."},
        {"id": "seo-check-list", "name": "Checklist tối ưu SEO Onpage", "prompt": "Cung cấp cho tôi một checklist chi tiết 15 điểm tối ưu SEO Onpage cho bài đăng mới."}
    ]'::jsonb
),
(
    'seo-audit', 
    'SEO Audit Agent', 
    'Chuyên gia kiểm toán kỹ thuật website', 
    'Phân tích cấu trúc website, thẻ meta, sơ đồ trang web, tốc độ tải trang và các lỗi kỹ thuật chuẩn SEO.',
    '🔍',
    '[
        {"id": "meta-audit", "name": "Kiểm tra Meta Tags", "prompt": "Kiểm tra cấu trúc và nội dung các thẻ title, description của domain sau đây và đề xuất cải thiện: "},
        {"id": "technical-health", "name": "Kiểm tra kỹ thuật website", "prompt": "Phân tích file robots.txt, sitemap.xml và cấu trúc URL của website để phát hiện lỗi thu thập thông tin."}
    ]'::jsonb
),
(
    'content-strategy', 
    'Content Strategy Agent', 
    'Kiến trúc sư nội dung', 
    'Lập kế hoạch phát triển nội dung, tối ưu hóa outline bài viết, phân bổ từ khóa tự nhiên và gia tăng tỷ lệ chuyển đổi.',
    '✍️',
    '[
        {"id": "content-plan", "name": "Kế hoạch nội dung 30 ngày", "prompt": "Lập kế hoạch nội dung 30 ngày cho một trang web trong lĩnh vực: "},
        {"id": "article-outline", "name": "Dàn ý bài viết chuẩn SEO", "prompt": "Tạo dàn ý bài viết chuẩn SEO (gồm H1, H2, H3) và danh sách từ khóa phụ cho chủ đề: "}
    ]'::jsonb
),
(
    'topical-authority', 
    'Topical Authority Agent', 
    'Chuyên gia phủ chủ đề & liên kết', 
    'Xây dựng bản đồ chủ đề (Topic Map), cấu trúc Silo, liên kết nội bộ thông minh và gia tăng độ uy tín tên miền (Authority) trên Google.',
    '🕸️',
    '[
        {"id": "topic-map", "name": "Thiết lập Topic Map", "prompt": "Xây dựng bản đồ chủ đề (Topical Map) toàn diện để bao phủ hoàn toàn chủ đề: "},
        {"id": "silo-structure", "name": "Cấu trúc Silo liên kết", "prompt": "Thiết kế cấu trúc liên kết nội bộ Silo cho cụm chủ đề cốt lõi."}
    ]'::jsonb
),
(
    'keyword-research', 
    'Keyword Research Agent', 
    'Nhà nghiên cứu từ khóa', 
    'Tìm kiếm từ khóa tiềm năng, phân tích khối lượng tìm kiếm (volume), độ khó từ khóa (KD) và ý định tìm kiếm (search intent).',
    '📊',
    '[
        {"id": "keyword-discovery", "name": "Tìm kiếm từ khóa ngách", "prompt": "Tìm kiếm 20 từ khóa ngách có độ khó thấp (KD < 30) và volume cao trong ngành: "},
        {"id": "intent-mapping", "name": "Phân loại Search Intent", "prompt": "Phân loại ý định tìm kiếm (Informational, Transactional, Navigational) cho danh sách từ khóa sau: "}
    ]'::jsonb
),
(
    'competitor-analysis', 
    'Competitor Analysis Agent', 
    'Chuyên gia phân tích đối thủ', 
    'Phân tích backlink, từ khóa xếp hạng cao, chiến lược SEO của đối thủ cạnh tranh và tìm kiếm khoảng trống cơ hội (gap-analysis).',
    '⚔️',
    '[
        {"id": "backlink-gap", "name": "Phân tích khoảng trống Backlink", "prompt": "Làm thế nào để phân tích khoảng trống backlink giữa website của tôi và 3 đối thủ lớn nhất?"},
        {"id": "keyword-gap", "name": "Phân tích khoảng trống Từ khóa", "prompt": "Đề xuất chiến lược khai thác các từ khóa mà đối thủ đang xếp hạng trang nhất nhưng trang của tôi chưa có."}
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    description = EXCLUDED.description,
    avatar = EXCLUDED.avatar,
    playbooks = EXCLUDED.playbooks;
