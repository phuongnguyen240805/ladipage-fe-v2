import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../mockDb";

export const runtime = "nodejs";

// Helper to define mock agent outputs
function getSimulatedAgentSteps(agentId: string, prompt: string) {
  const searchPrompt = prompt.toLowerCase();
  
  switch (agentId) {
    case "seo-audit":
      return [
        {
          type: "tool",
          toolName: "crawler_bot",
          input: { url: "https://example.com", limit: 100 },
          output: { urls_scanned: 48, status_200: 45, status_404: 3, redirect_301: 0 }
        },
        {
          type: "tool",
          toolName: "lighthouse_audit",
          input: { url: "https://example.com", device: "mobile" },
          output: { performance: 82, accessibility: 95, best_practices: 89, seo: 92 }
        },
        {
          type: "text",
          text: `### Kết quả SEO Audit trang web của bạn:

Dựa trên phân tích tự động từ các công cụ kiểm toán kỹ thuật:
1. **Chỉ số Hiệu suất Lighthouse (SEO Score)**: Đạt **92/100**. Tốc độ tải trang khá tốt, tuy nhiên chỉ số **TTFB** (Time to First Byte) hơi chậm. Đề xuất bật nén gzip/brotli và tối ưu hóa phản hồi database ở máy chủ.
2. **Lỗi liên kết hỏng (Broken Links)**: Phát hiện **3 liên kết lỗi 404** cần sửa:
   - \`/about-us-old\` (Đang được liên kết từ thanh Header)
   - \`/product-deprecated\` (Liên kết từ trang tin tức)
   - \`/static/files/guide.pdf\` (Không tìm thấy tệp tin)
3. **Thẻ tiêu đề & mô tả (Meta Tags)**:
   - Trang chủ hiện có thẻ Description dài **195 ký tự** (Khuyên dùng từ **150-160 ký tự** để tránh bị Google cắt bớt trên kết quả tìm kiếm).
   - Có **2 trang** thiếu thẻ Title (Trang liên hệ và trang điều khoản dịch vụ).

**Đề xuất xử lý tiếp theo**: Thiết lập chuyển hướng 301 cho các liên kết hỏng và rút gọn meta description của trang chủ.`
        }
      ];

    case "content-strategy":
      return [
        {
          type: "tool",
          toolName: "content_gap_analyzer",
          input: { topic: searchPrompt, focus_keywords: ["landing page", "builder"] },
          output: { top_competitor_coverage: "88%", our_coverage: "40%", gap_level: "High" }
        },
        {
          type: "text",
          text: `### Chiến lược Nội dung & Dàn ý Bài viết Đề xuất: "${prompt}"

Dưới đây là dàn ý tối ưu hóa chuẩn SEO cùng các từ khóa ngữ nghĩa đi kèm để tối ưu hóa khả năng xếp hạng:

#### Cấu trúc tiêu đề (Outline)
- **H1: Cách Thiết Kế Landing Page SaaS Đạt Tỷ Lệ Chuyển Đổi Trên 15%**
- **H2: 1. Landing Page SaaS là gì và tại sao nó khác biệt?**
- **H2: 2. 5 thành phần cốt lõi của Landing Page chuyển đổi cao**
  - H3: Tiêu đề thu hút & Khơi gợi giá trị (Headline & Value Prop)
  - H3: Form đăng ký tối giản & CTA nổi bật
  - H3: Bằng chứng xã hội (Social Proof / Testimonials)
- **H2: 3. Quy trình 6 bước xây dựng Landing Page hoàn chỉnh**
- **H2: 4. Các chỉ số đo lường hiệu quả Landing Page cần theo dõi**
- **H2: 5. Kết luận và các template Landing Page SaaS có sẵn**

#### Danh sách từ khóa ngữ nghĩa nên chèn (Semantic Keywords)
- *mẫu landing page saas đẹp* (Volume: 450/tháng, KD: 15)
- *tối ưu hóa landing page* (Volume: 820/tháng, KD: 28)
- *tạo landing page chuyển đổi cao* (Volume: 1,100/tháng, KD: 24)

**Mật độ từ khóa khuyến nghị**: Phân bổ từ khóa chính ở thẻ H1, trong 100 từ đầu tiên của bài viết, và rải đều ở ít nhất 2 thẻ H2. Mật độ từ khóa lý tưởng khoảng **1.8%**.`
      }
    ];

    case "topical-authority":
      return [
        {
          type: "tool",
          toolName: "topic_cluster_generator",
          input: { root_topic: prompt },
          output: { total_nodes: 12, clusters: 3, depth: 3 }
        },
        {
          type: "text",
          text: `### Bản đồ phủ chủ đề (Topical Authority Map) cho: "${prompt}"

Để thiết lập độ phủ chủ đề rộng và xây dựng Authority (Uy tín) đối với công cụ tìm kiếm, bạn nên triển khai mô hình **Topic Cluster** dưới đây:

#### 1. Pillar Page (Trang trụ cột chính)
- **Tiêu đề**: Hướng dẫn toàn tập từ cơ bản đến nâng cao về **${prompt}**
- **Mục tiêu**: Đóng vai trò là trung tâm kiến thức, bao quát sơ bộ toàn bộ khía cạnh của chủ đề.

#### 2. Sub-Clusters & Internal Linking (Cụm nội dung & Liên kết nội bộ)
- **Cụm 1: Hướng dẫn cốt lõi (Core Guides)**
  - *Bài 1*: ${prompt} là gì? Ý nghĩa và cách triển khai cơ bản.
  - *Bài 2*: 10 quy tắc vàng cần nhớ khi làm ${prompt}.
- **Cụm 2: Công cụ hỗ trợ (Tools & Software)**
  - *Bài 1*: Top 5 công cụ đắc lực nhất cho ${prompt} hiện nay.
  - *Bài 2*: Hướng dẫn chi tiết sử dụng phần mềm tối ưu ${prompt}.
- **Cụm 3: Case Study & Nâng cao**
  - *Bài 1*: Cách chúng tôi tăng gấp đôi hiệu suất nhờ áp dụng ${prompt}.
  - *Bài 2*: Những lỗi phổ biến gây thất bại khi tối ưu ${prompt}.

#### 3. Nguyên tắc đi liên kết (Internal Link Blueprint)
- Tất cả bài viết phụ (Cluster Pages) phải đặt anchor text liên kết trực tiếp về Pillar Page.
- Pillar Page liên kết đến từng bài viết phụ để tạo dòng chảy PageRank khép kín.`
      }
    ];

    case "keyword-research":
      return [
        {
          type: "tool",
          toolName: "keyword_difficulty_api",
          input: { keyword: searchPrompt, geo: "vn" },
          output: { search_volume: 2400, CPC: "$0.65", difficulty_score: 31, intent: "Informational" }
        },
        {
          type: "tool",
          toolName: "related_keywords_spy",
          input: { keyword: searchPrompt },
          output: { count: 4, keywords: [
            { term: searchPrompt + " là gì", volume: 1200, difficulty: 18 },
            { term: "hướng dẫn " + searchPrompt, volume: 450, difficulty: 12 },
            { term: "phần mềm " + searchPrompt, volume: 300, difficulty: 42 },
            { term: "dịch vụ " + searchPrompt, volume: 250, difficulty: 35 }
          ] }
        },
        {
          type: "text",
          text: `### Báo cáo Nghiên cứu Từ khóa chi tiết: "${prompt}"

Dữ liệu phân tích lượng tìm kiếm và mức độ cạnh tranh tại thị trường Việt Nam:

| Từ khóa | Volume tìm kiếm | Độ khó (KD) | CPC ước tính | Ý định tìm kiếm (Intent) |
| :--- | :---: | :---: | :---: | :---: |
| **${prompt}** | **2,400** | **31 (Trung bình)** | **$0.65** | Informational |
| ${prompt} là gì | 1,200 | 18 (Rất dễ) | $0.15 | Informational |
| hướng dẫn ${prompt} | 450 | 12 (Rất dễ) | $0.22 | Informational |
| phần mềm ${prompt} | 300 | 42 (Khá khó) | $0.85 | Commercial |
| dịch vụ ${prompt} | 250 | 35 (Trung bình) | $1.10 | Transactional |

#### Nhận xét & Đề xuất hành động:
1. Từ khóa chính **${prompt}** có độ khó **31**, ở mức trung bình. Bạn hoàn toàn có thể cạnh tranh Top 10 nếu xây dựng nội dung chất lượng cao.
2. Từ khóa ngách \`${prompt} là gì\` có volume rất tốt (1,200) và độ khó cực thấp (18). Đây là bài viết bạn nên viết đầu tiên để thu hút lượng traffic ban đầu nhanh nhất.`
      }
    ];

    case "competitor-analysis":
      return [
        {
          type: "tool",
          toolName: "backlink_gap_checker",
          input: { target: "domain.com", competitor: "competitor-seo.com" },
          output: { target_da: 24, competitor_da: 42, backlinks_gap: 950 }
        },
        {
          type: "tool",
          toolName: "competitor_keywords_spy",
          input: { domain: "competitor-seo.com" },
          output: { total_keywords: 4500, ranking_top_3: 450 }
        },
        {
          type: "text",
          text: `### Phân tích Khoảng trống SEO với Đối thủ Cạnh tranh:

Tôi đã quét cấu trúc backlinks và lượng từ khóa tự nhiên của đối thủ cạnh tranh chính của bạn:

1. **Thông số SEO của đối thủ (competitor-seo.com)**:
   - **Domain Authority (DA)**: **42** (Web của bạn là **24**). Họ có sức mạnh tên miền lớn hơn, do đó bài viết mới của họ sẽ được Google index và xếp hạng nhanh hơn.
   - **Hồ sơ liên kết (Backlinks)**: Có **950 referring domains**. Hơn 60% liên kết đến từ các trang báo và guest post chất lượng cao.
2. **Điểm yếu của đối thủ có thể khai thác**:
   - Đối thủ đang tập trung xếp hạng cho các từ khóa thương mại lớn. Tuy nhiên, họ viết bài cẩm nang khá mỏng và không tối ưu hóa UX (thiếu bảng biểu, checklist, hình ảnh hướng dẫn tự chụp).
   - Họ có ít backlinks dạng tài nguyên/link bait (bài tổng hợp số liệu).

**Khuyến nghị hành động**:
- Viết bài cẩm nang chuyên sâu gấp 2 lần đối thủ, bổ sung tối thiểu 3 biểu đồ dữ liệu tự thiết kế.
- Tiếp cận 15 referring domains chất lượng đang liên kết đến đối thủ để đề xuất thay thế bằng bài viết có giá trị cao hơn của bạn.`
      }
    ];

    default:
      return [
        {
          type: "tool",
          toolName: "web_search",
          input: { query: prompt },
          output: { results_found: 8, query_matched: true }
        },
        {
          type: "text",
          text: `Chào bạn! Tôi là Trợ lý SEO đa năng.
Tôi đã phân tích câu hỏi của bạn: "${prompt}".

Dưới đây là một số tư vấn định hướng SEO ban đầu dành cho bạn:
- Hãy kiểm tra xem website đã cài đặt **Sitemap.xml** và cấu hình **Google Search Console** đúng chưa.
- Hãy tập trung giải quyết ý định tìm kiếm (Search Intent) của người dùng trước khi tối ưu hóa mật độ từ khóa kỹ thuật.
- Cải thiện trải nghiệm trang web (Core Web Vitals) để giảm tỷ lệ thoát (Bounce Rate) trên di động.

Để có kết quả phân tích sâu hơn theo từng chuyên môn, bạn có thể chuyển sang chọn các Agent chuyên biệt tương ứng ở menu bên trái (ví dụ: SEO Audit Agent, Keyword Research Agent...).`
      }
  ];
  }
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!supabase) {
      return NextResponse.json(mockDb.getMessages(id));
    }

    const { data, error } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Supabase fetch messages error, using mockDb:", error);
      return NextResponse.json(mockDb.getMessages(id));
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET messages error:", err);
    try {
      const { id } = await props.params;
      return NextResponse.json(mockDb.getMessages(id));
    } catch {
      return NextResponse.json([]);
    }
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await props.params;

  try {
    const body = await request.json();
    const { content, agentId } = body;

    if (!content || !agentId) {
      return NextResponse.json({ error: "Missing parameters content or agentId" }, { status: 400 });
    }

    // Prepare response headers for SSE streaming
    const headers = {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    };

    // Define Encoder to stream chunks
    const encoder = new TextEncoder();

    // Create ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event, data })}\n\n`));
        };

        try {
          // 1. Save user message to database or mockDb
          let userMsg;
          if (!supabase) {
            userMsg = mockDb.addMessage(conversationId, "user", content);
          } else {
            const { data, error } = await supabase
              .from("ai_messages")
              .insert({ conversation_id: conversationId, role: "user", content })
              .select()
              .single();
            if (error || !data) {
              console.warn("Supabase user message write error, falling back to mockDb:", error);
              userMsg = mockDb.addMessage(conversationId, "user", content);
            } else {
              userMsg = data;
              // Update conversation timestamp
              await supabase
                .from("ai_conversations")
                .update({ updated_at: new Date() })
                .eq("id", conversationId);
            }
          }
          sendEvent("message", userMsg);

          // 2. Create Run
          let run;
          if (!supabase) {
            run = mockDb.createRun(conversationId, agentId);
          } else {
            const { data, error } = await supabase
              .from("ai_runs")
              .insert({ conversation_id: conversationId, agent_id: agentId, status: "queued" })
              .select()
              .single();
            run = error || !data ? mockDb.createRun(conversationId, agentId) : data;
          }
          sendEvent("run_status", run);

          // 3. Update Run Status to running
          if (!supabase) {
            run = mockDb.updateRunStatus(run.id, "running");
          } else {
            const { data } = await supabase
              .from("ai_runs")
              .update({ status: "running", updated_at: new Date() })
              .eq("id", run.id)
              .select()
              .single();
            if (data) run = data;
          }
          sendEvent("run_status", run);

          // Get the execution blueprint
          const steps = getSimulatedAgentSteps(agentId, content);
          let finalResponse = "";

          for (const step of steps) {
            if (step.type === "tool") {
              const toolName = step.toolName || "";
              const input = step.input || {};
              // 3a. Save Tool Call Start
              let toolCall;
              if (!supabase) {
                toolCall = mockDb.createToolCall(run.id, toolName, input);
              } else {
                const { data } = await supabase
                  .from("ai_tool_calls")
                  .insert({
                    run_id: run.id,
                    tool_name: toolName,
                    input: input,
                    status: "calling"
                  })
                  .select()
                  .single();
                toolCall = data || mockDb.createToolCall(run.id, toolName, input);
              }
              sendEvent("tool_start", toolCall);

              // Simulate tool latency
              await new Promise((resolve) => setTimeout(resolve, 1500));

              // 3b. Save Tool Call Completed
              if (!supabase) {
                toolCall = mockDb.updateToolCall(toolCall.id, "completed", step.output);
              } else {
                const { data } = await supabase
                  .from("ai_tool_calls")
                  .update({
                    status: "completed",
                    output: step.output,
                    updated_at: new Date()
                  })
                  .eq("id", toolCall.id)
                  .select()
                  .single();
                if (data) toolCall = data;
              }
              sendEvent("tool_end", toolCall);
            } else if (step.type === "text") {
              // 4. Stream response content chunk-by-chunk
              const text = step.text || "";
              const chunkSize = 16;
              for (let i = 0; i < text.length; i += chunkSize) {
                const chunk = text.slice(i, i + chunkSize);
                finalResponse += chunk;
                sendEvent("text_chunk", chunk);
                await new Promise((resolve) => setTimeout(resolve, 40));
              }
            }
          }

          // 5. Save assistant message
          let assistantMsg;
          if (!supabase) {
            assistantMsg = mockDb.addMessage(conversationId, "assistant", finalResponse);
          } else {
            const { data } = await supabase
              .from("ai_messages")
              .insert({
                conversation_id: conversationId,
                role: "assistant",
                content: finalResponse
              })
              .select()
              .single();
            assistantMsg = data || mockDb.addMessage(conversationId, "assistant", finalResponse);
          }
          sendEvent("final_message", assistantMsg);

          // 6. Update Run to completed
          if (!supabase) {
            run = mockDb.updateRunStatus(run.id, "completed");
          } else {
            const { data } = await supabase
              .from("ai_runs")
              .update({ status: "completed", updated_at: new Date() })
              .eq("id", run.id)
              .select()
              .single();
            if (data) run = data;
          }
          sendEvent("run_status", run);
          
          controller.close();
        } catch (streamErr: any) {
          console.error("Streaming execution failed:", streamErr);
          sendEvent("error", streamErr.message);
          controller.close();
        }
      }
    });

    return new Response(stream, { headers });
  } catch (err: any) {
    console.error("POST messages streaming error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
