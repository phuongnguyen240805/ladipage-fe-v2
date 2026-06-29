import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const { path } = await props.params;
  return handleProxy(request, "GET", path);
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const { path } = await props.params;
  return handleProxy(request, "POST", path);
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const { path } = await props.params;
  return handleProxy(request, "PUT", path);
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const { path } = await props.params;
  return handleProxy(request, "DELETE", path);
}

async function handleProxy(request: NextRequest, method: string, path: string[]) {
  const url = new URL(request.url);
  const customUrl = request.headers.get("x-gads-url") || url.searchParams.get("gadsUrl");
  const baseUrl = customUrl || process.env.GADS_API_URL || "http://localhost:10000";
  
  // Reconstruct target URL, removing proxy-specific query param if present
  const subPath = path.join("/");
  const cleanParams = new URLSearchParams(url.searchParams);
  cleanParams.delete("gadsUrl");
  const searchStr = cleanParams.toString();
  const targetUrlStr = `${baseUrl}/${subPath}${searchStr ? "?" + searchStr : ""}`;
  
  try {
    let body: any = undefined;
    if (method !== "GET" && method !== "HEAD") {
      try {
        body = await request.text();
      } catch (e) {}
    }

    const headers = new Headers();
    if (request.headers.get("content-type")) {
      headers.set("content-type", request.headers.get("content-type")!);
    }
    if (request.headers.get("authorization")) {
      headers.set("authorization", request.headers.get("authorization")!);
    }

    const response = await fetch(targetUrlStr, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/event-stream")) {
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        },
      });
    }

    const dataText = await response.text();
    let data;
    try {
      data = JSON.parse(dataText);
    } catch (e) {
      data = dataText;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("GADS proxy error:", error);
    return NextResponse.json(
      {
        error: "Cannot connect to GADS server",
        message: error.message,
        targetUrl: targetUrlStr,
      },
      { status: 502 }
    );
  }
}
