import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const landingPageId = formData.get("landingPageId") as string;
    const file = formData.get("file") as File;
    const mode = (formData.get("mode") as string) || "append";

    if (!landingPageId || !file) {
      return NextResponse.json({ error: "Missing landingPageId or file." }, { status: 400 });
    }

    console.info("[ZIP Import API Contract]", {
      landingPageId,
      fileName: file.name,
      fileSize: file.size,
      mode,
    });

    // API contract returns jobId for backend processing simulation
    return NextResponse.json({
      jobId: `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      landingPageId,
      status: "queued",
      message: "ZIP import file uploaded successfully. Backend conversion is pending implementation.",
      sections: [], // Mock empty sections for contract placeholder
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "ZIP upload error." }, { status: 500 });
  }
}
