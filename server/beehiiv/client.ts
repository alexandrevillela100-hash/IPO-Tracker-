/**
 * Beehiiv API Client
 *
 * Handles subscriber management and post creation via the Beehiiv REST API v2.
 * Subscriber endpoints work on all plans; Create Post requires Enterprise.
 *
 * Docs: https://developers.beehiiv.com
 */

const BEEHIIV_API_BASE = "https://api.beehiiv.com/v2";

function getConfig() {
  const apiKey = process.env.BEEHIIV_API_KEY || "";
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID || "";
  return { apiKey, publicationId };
}

function headers() {
  const { apiKey } = getConfig();
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function pubUrl(path: string) {
  const { publicationId } = getConfig();
  return `${BEEHIIV_API_BASE}/publications/${publicationId}${path}`;
}

export function isConfigured(): boolean {
  const { apiKey, publicationId } = getConfig();
  return !!(apiKey && publicationId);
}

// ─── Subscriber Management ────────────────────────────────────────────────

export interface BeehiivSubscription {
  id: string;
  email: string;
  status: string;
  created: number;
  subscription_tier?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export async function createSubscription(
  email: string,
  options?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    sendWelcomeEmail?: boolean;
    reactivateExisting?: boolean;
  }
): Promise<{ success: boolean; data?: BeehiivSubscription; error?: string }> {
  if (!isConfigured()) {
    return { success: false, error: "Beehiiv not configured" };
  }

  try {
    const res = await fetch(pubUrl("/subscriptions"), {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        email,
        reactivate_existing: options?.reactivateExisting ?? false,
        send_welcome_email: options?.sendWelcomeEmail ?? true,
        utm_source: options?.utmSource ?? "ipo-radar-ai",
        utm_medium: options?.utmMedium ?? "website",
        utm_campaign: options?.utmCampaign ?? "signup",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Beehiiv] Create subscription failed:", res.status, err);
      return { success: false, error: `API error ${res.status}: ${err}` };
    }

    const json = await res.json();
    return { success: true, data: json.data };
  } catch (error: any) {
    console.error("[Beehiiv] Create subscription error:", error);
    return { success: false, error: error.message };
  }
}

export async function getSubscriptionByEmail(
  email: string
): Promise<BeehiivSubscription | null> {
  if (!isConfigured()) return null;

  try {
    const encoded = encodeURIComponent(email);
    const res = await fetch(pubUrl(`/subscriptions/by_email/${encoded}`), {
      method: "GET",
      headers: headers(),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function listSubscriptions(
  page: number = 1,
  limit: number = 100
): Promise<{ data: BeehiivSubscription[]; total: number }> {
  if (!isConfigured()) return { data: [], total: 0 };

  try {
    const res = await fetch(
      pubUrl(`/subscriptions?page=${page}&limit=${limit}&status=active`),
      { method: "GET", headers: headers() }
    );

    if (!res.ok) return { data: [], total: 0 };
    const json = await res.json();
    return {
      data: json.data ?? [],
      total: json.total_results ?? 0,
    };
  } catch {
    return { data: [], total: 0 };
  }
}

export async function deleteSubscription(
  subscriptionId: string
): Promise<boolean> {
  if (!isConfigured()) return false;

  try {
    const res = await fetch(pubUrl(`/subscriptions/${subscriptionId}`), {
      method: "DELETE",
      headers: headers(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Unsubscribe a user by email. Looks up their subscription ID first,
 * then deletes the subscription.
 */
export async function unsubscribeByEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured()) {
    return { success: false, error: "Beehiiv not configured" };
  }

  const sub = await getSubscriptionByEmail(email);
  if (!sub) {
    return { success: false, error: "Subscription not found" };
  }

  const deleted = await deleteSubscription(sub.id);
  return deleted
    ? { success: true }
    : { success: false, error: "Failed to delete subscription" };
}

// ─── Post Creation (Enterprise only) ──────────────────────────────────────

export interface BeehiivBlock {
  type: "heading" | "paragraph" | "html" | "image" | "button" | "divider";
  [key: string]: any;
}

export interface CreatePostOptions {
  title: string;
  subtitle?: string;
  blocks?: BeehiivBlock[];
  bodyContent?: string;
  status?: "draft" | "confirmed";
  scheduledAt?: string; // ISO datetime
  postTemplateId?: string;
}

export async function createPost(
  options: CreatePostOptions
): Promise<{ success: boolean; postId?: string; error?: string }> {
  if (!isConfigured()) {
    return { success: false, error: "Beehiiv not configured" };
  }

  try {
    const body: Record<string, any> = {
      title: options.title,
      status: options.status ?? "draft",
    };

    if (options.subtitle) body.subtitle = options.subtitle;
    if (options.scheduledAt) body.scheduled_at = options.scheduledAt;
    if (options.postTemplateId) body.post_template_id = options.postTemplateId;

    if (options.blocks) {
      body.blocks = options.blocks;
    } else if (options.bodyContent) {
      body.body_content = options.bodyContent;
    }

    const res = await fetch(pubUrl("/posts"), {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Beehiiv] Create post failed:", res.status, err);
      return {
        success: false,
        error: `API error ${res.status}. Note: Create Post requires Beehiiv Enterprise plan. ${err}`,
      };
    }

    const json = await res.json();
    return { success: true, postId: json.data?.id };
  } catch (error: any) {
    console.error("[Beehiiv] Create post error:", error);
    return { success: false, error: error.message };
  }
}

// ─── Publication Info ─────────────────────────────────────────────────────

export async function getPublication(): Promise<any | null> {
  if (!isConfigured()) return null;

  try {
    const { publicationId } = getConfig();
    const res = await fetch(
      `${BEEHIIV_API_BASE}/publications/${publicationId}`,
      { method: "GET", headers: headers() }
    );

    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}
