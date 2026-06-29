import { facebookAuthService } from "@/features/auth/services/facebook-auth.service";
import { FacebookTokenSet } from "@/features/auth/types";

export interface FacebookApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

export class FacebookApiClient {
  private baseUrl = "https://graph.facebook.com/v21.0";

  /**
   * Helper to make generic requests to Facebook Graph API
   */
  private async request<T = any>(
    path: string,
    options: RequestInit = {},
    tokenType: keyof FacebookTokenSet = "eaag"
  ): Promise<T> {
    // Ensure we have a live token for the action
    const token = await facebookAuthService.ensureLiveAccessTokenForAction(`GraphAPI ${path}`, tokenType);

    // Append access_token to URL
    const url = new URL(`${this.baseUrl}/${path}`);
    url.searchParams.append("access_token", token);

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(`[Facebook API Error] ${result.error.message} (Code: ${result.error.code})`);
    }

    return result as T;
  }

  /**
   * Fetch active user profile details
   */
  async getMe(): Promise<any> {
    return this.request("me?fields=id,name,picture");
  }

  /**
   * Fetch Pages owned by the user
   */
  async getMyPages(): Promise<any> {
    return this.request("me/accounts?fields=id,name,access_token,tasks,followers_count");
  }

  /**
   * Fetch Business Managers the user has access to
   */
  async getMyBusinesses(): Promise<any> {
    return this.request("me/businesses?fields=id,name,vertical,primary_page");
  }

  /**
   * Fetch Ad Accounts owned or managed
   */
  async getAdAccounts(): Promise<any> {
    return this.request("me/adaccounts?fields=id,name,account_id,account_status,amount_spent,currency");
  }

  /**
   * Execute custom raw Graph API GET request
   */
  async get<T = any>(path: string, tokenType: keyof FacebookTokenSet = "eaag"): Promise<T> {
    return this.request<T>(path, { method: "GET" }, tokenType);
  }

  /**
   * Execute custom raw Graph API POST request
   */
  async post<T = any>(path: string, payload: any, tokenType: keyof FacebookTokenSet = "eaag"): Promise<T> {
    return this.request<T>(
      path,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      tokenType
    );
  }
}

export const facebookApiClient = new FacebookApiClient();
