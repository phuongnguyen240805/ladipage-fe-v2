import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pageId = formData.get("pageId") as string;
    const file = formData.get("file") as File;
    const importMode = (formData.get("importMode") as string) || "append";

    if (!pageId || !file) {
      return NextResponse.json({ error: "Missing pageId or file." }, { status: 400 });
    }

    console.info("[ZIP Import API Contract]", {
      pageId,
      fileName: file.name,
      fileSize: file.size,
      importMode,
    });

    // TODO: Implement backend ZIP extraction, HTML/assets parsing, and conversion to EditorBlock database updates
    return NextResponse.json({
      jobId: `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      pageId,
      status: "queued",
      message: "ZIP import received. Backend conversion is pending implementation.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "ZIP upload error." }, { status: 500 });
  }
}
