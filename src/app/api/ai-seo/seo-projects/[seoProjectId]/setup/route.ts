import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../mockDb";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ seoProjectId: string }> }
) {
  try {
    const { seoProjectId } = await props.params;
    const body = await request.json();

    const {
      businessName,
      businessDescription,
      industry,
      audience,
      location,
      language,
      phone,
      email,
      address,
      serviceAreas = [],
      socialProfiles = [],
      gscProperty,
      gbpLocation
    } = body;

    // Validate business profile required address constraint
    if (!address || address.trim() === "") {
      return NextResponse.json({ error: "Phải cung cấp ít nhất 1 địa chỉ doanh nghiệp" }, { status: 400 });
    }

    if (!supabase) {
      const result = mockDb.updateSeoProjectSetup(
        seoProjectId,
        {
          businessName,
          businessDescription,
          industry,
          audience,
          location,
          language,
          phone,
          email,
          address,
          serviceAreas,
          socialProfiles
        },
        {
          gscProperty,
          gbpLocation
        }
      );
      return NextResponse.json({ success: true, result });
    }

    // 1. Update business profile
    const { error: profileError } = await supabase
      .from("seo_project_business_profiles")
      .upsert({
        seo_project_id: seoProjectId,
        business_name: businessName,
        business_description: businessDescription,
        industry,
        audience,
        location,
        language,
        phone,
        email,
        address,
        service_areas: serviceAreas,
        social_profiles: socialProfiles
      }, { onConflict: "seo_project_id" });

    if (profileError) {
      throw new Error(`Profile upsert error: ${profileError.message}`);
    }

    // 2. Update integrations
    const { error: integrationsError } = await supabase
      .from("seo_project_integrations")
      .upsert({
        seo_project_id: seoProjectId,
        gsc_property: gscProperty,
        gbp_location: gbpLocation
      }, { onConflict: "seo_project_id" });

    if (integrationsError) {
      throw new Error(`Integrations upsert error: ${integrationsError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PATCH seo-project setup error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
