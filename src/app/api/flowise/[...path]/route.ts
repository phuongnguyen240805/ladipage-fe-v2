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
  // Read target URL from header or default to 3100
  const customUrl = request.headers.get("x-flowise-url");
  const baseUrl = customUrl || process.env.FLOWISE_API_URL || "http://localhost:3100";
  
  // Reconstruct target URL
  const subPath = path.join("/");
  const url = new URL(request.url);
  const targetUrlStr = `${baseUrl}/api/v1/${subPath}${url.search}`;
  
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
    headers.set("x-request-from", "internal");

    const response = await fetch(targetUrlStr, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const dataText = await response.text();
    let data;
    try {
      data = JSON.parse(dataText);
    } catch (e) {
      data = dataText;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Flowise proxy error:", error);
    return NextResponse.json(
      {
        error: "Cannot connect to Flowise server",
        message: error.message,
        targetUrl: targetUrlStr,
      },
      { status: 502 }
    );
  }
}
