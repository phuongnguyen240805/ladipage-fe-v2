export async function triggerLandingRevalidate(slug: string): Promise<void> {
  const secret = process.env.LANDING_REVALIDATE_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;

  if (!secret || !baseUrl) {
    return;
  }

  const origin = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;

  try {
    const response = await fetch(`${origin}/api/revalidate/landing`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ slug }),
    });

    if (!response.ok) {
      console.warn(
        `Landing revalidate failed for platform path of slug=${slug}: ${response.status} ${await response.text()}`,
      );
    }
  } catch (error) {
    console.warn(`Landing revalidate request failed for slug=${slug}:`, error);
  }
}