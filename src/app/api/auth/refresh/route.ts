import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  SESSION_COOKIE_NAME,
  SB_REFRESH_COOKIE_NAME,
} from "@/features/auth/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7002/api";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const SB_REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

export async function GET(request: NextRequest) {
  const redirectTo = request.nextUrl.searchParams.get("redirect") || "/";
  const refreshToken = request.cookies.get(SB_REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new Error(error?.message ?? "Refresh failed");
    }

    const exchangeRes = await fetch(`${API_URL}/auth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supabaseAccessToken: data.session.access_token,
      }),
    });

    const exchangeBody = await exchangeRes.json();
    if (!exchangeRes.ok || exchangeBody.code !== 200) {
      throw new Error(exchangeBody.message ?? "Token exchange failed");
    }

    const nestToken = exchangeBody.data?.token as string;
    if (!nestToken) {
      throw new Error("No Nest token in exchange response");
    }

    const response = NextResponse.redirect(new URL(redirectTo, request.url));

    response.cookies.set(SESSION_COOKIE_NAME, nestToken, {
      path: "/",
      maxAge: SESSION_MAX_AGE,
      sameSite: "lax",
    });

    if (data.session.refresh_token) {
      response.cookies.set(SB_REFRESH_COOKIE_NAME, data.session.refresh_token, {
        path: "/",
        maxAge: SB_REFRESH_MAX_AGE,
        sameSite: "lax",
        httpOnly: true,
      });
    }

    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/signin", request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    response.cookies.delete(SB_REFRESH_COOKIE_NAME);
    return response;
  }
}