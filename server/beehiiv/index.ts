/**
 * Beehiiv Integration — Main Entry Point
 *
 * Orchestrates subscriber sync, digest generation, and post creation.
 * Provides a unified interface for the tRPC router layer.
 */

import * as beehiivClient from "./client";
import { gatherDigestData, generateDigestHtml, generateDigestPlainText } from "./digest";
import { notifyOwner } from "../_core/notification";

export { unsubscribeByEmail } from "./client";

export { isConfigured } from "./client";

// ─── Subscriber Sync ──────────────────────────────────────────────────────

/**
 * Sync a new email signup to Beehiiv.
 * Called automatically when users sign up on the site.
 */
export async function syncSubscriber(
  email: string,
  source?: string
): Promise<{ synced: boolean; error?: string }> {
  if (!beehiivClient.isConfigured()) {
    return { synced: false, error: "Beehiiv not configured — subscriber saved locally only" };
  }

  const result = await beehiivClient.createSubscription(email, {
    utmSource: "ipo-radar-ai",
    utmMedium: "website",
    utmCampaign: source || "signup",
    sendWelcomeEmail: true,
  });

  return {
    synced: result.success,
    error: result.error,
  };
}

// ─── Weekly Digest ────────────────────────────────────────────────────────

export interface DigestResult {
  success: boolean;
  method: "beehiiv_post" | "notification" | "preview_only";
  postId?: string;
  html?: string;
  plainText?: string;
  data?: Awaited<ReturnType<typeof gatherDigestData>>;
  error?: string;
}

/**
 * Generate and optionally send the weekly IPO digest.
 *
 * Strategy:
 * 1. If Beehiiv is configured and on Enterprise, create a post (draft or confirmed).
 * 2. If Beehiiv is not Enterprise, generate the content and notify the owner.
 * 3. Always return the generated HTML for admin preview.
 */
export async function generateAndSendDigest(
  siteUrl: string,
  options?: {
    sendViaBeehiiv?: boolean;
    asDraft?: boolean;
  }
): Promise<DigestResult> {
  try {
    // 1. Gather data
    const data = await gatherDigestData();
    const html = generateDigestHtml(data, siteUrl);
    const plainText = generateDigestPlainText(data, siteUrl);

    const weekLabel = `${data.weekStart} to ${data.weekEnd}`;
    const title = `IPO Radar Weekly Digest — ${weekLabel}`;
    const subtitle = `${data.totalFilingsThisWeek} new filings | ${data.totalCompaniesTracked} companies tracked`;

    // 2. Try Beehiiv post creation if configured and requested
    if (options?.sendViaBeehiiv && beehiivClient.isConfigured()) {
      const postResult = await beehiivClient.createPost({
        title,
        subtitle,
        bodyContent: html,
        status: options.asDraft ? "draft" : "confirmed",
      });

      if (postResult.success) {
        return {
          success: true,
          method: "beehiiv_post",
          postId: postResult.postId,
          html,
          plainText,
          data,
        };
      }

      // If Beehiiv post failed (likely not Enterprise), fall through to notification
      console.warn("[Digest] Beehiiv post creation failed, falling back to notification:", postResult.error);
    }

    // 3. Notify owner with digest summary
    try {
      await notifyOwner({
        title: `📡 ${title}`,
        content: `Weekly IPO digest generated.\n\n${subtitle}\n\nNew filings:\n${data.newFilings
          .slice(0, 5)
          .map((f) => `• ${f.companyName} (${f.formType}) — ${f.filingDate}`)
          .join("\n")}\n\n${
          data.newFilings.length > 5
            ? `...and ${data.newFilings.length - 5} more filings.\n\n`
            : ""
        }View the full digest in your admin panel.`,
      });
    } catch {
      // Notification is best-effort
    }

    return {
      success: true,
      method: beehiivClient.isConfigured() ? "notification" : "preview_only",
      html,
      plainText,
      data,
    };
  } catch (error: any) {
    console.error("[Digest] Failed to generate digest:", error);
    return {
      success: false,
      method: "preview_only",
      error: error.message,
    };
  }
}

/**
 * Preview the digest without sending.
 * Used by the admin panel to review content before triggering a send.
 */
export async function previewDigest(siteUrl: string): Promise<{
  html: string;
  plainText: string;
  data: Awaited<ReturnType<typeof gatherDigestData>>;
}> {
  const data = await gatherDigestData();
  const html = generateDigestHtml(data, siteUrl);
  const plainText = generateDigestPlainText(data, siteUrl);
  return { html, plainText, data };
}

/**
 * Get Beehiiv subscriber stats.
 */
export async function getSubscriberStats(): Promise<{
  configured: boolean;
  totalSubscribers: number;
  publication: any | null;
}> {
  if (!beehiivClient.isConfigured()) {
    return { configured: false, totalSubscribers: 0, publication: null };
  }

  const [subs, pub] = await Promise.all([
    beehiivClient.listSubscriptions(1, 1),
    beehiivClient.getPublication(),
  ]);

  return {
    configured: true,
    totalSubscribers: subs.total,
    publication: pub,
  };
}
