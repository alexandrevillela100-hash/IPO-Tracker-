/**
 * Weekly IPO Digest Generator
 *
 * Generates HTML content for the weekly IPO summary email.
 * Pulls data from the database (filings, companies) and formats
 * it into a newsletter-ready HTML block for Beehiiv or direct sending.
 */

import { getDb } from "../db";
import { companies, filings } from "../../drizzle/schema";
import { desc, gte, sql } from "drizzle-orm";

export interface DigestData {
  weekStart: string;
  weekEnd: string;
  newFilings: Array<{
    companyName: string;
    cik: string;
    formType: string;
    filingDate: string;
    sector: string;
    accessionNumber: string;
  }>;
  upcomingEvents: Array<{
    companyName: string;
    cik: string;
    eventType: string;
    date: string;
  }>;
  totalCompaniesTracked: number;
  totalFilingsThisWeek: number;
}

export async function gatherDigestData(): Promise<DigestData> {
  const db = await getDb();

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = now.toISOString().split("T")[0];

  if (!db) {
    return {
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      newFilings: [],
      upcomingEvents: [],
      totalCompaniesTracked: 0,
      totalFilingsThisWeek: 0,
    };
  }

  // Get filings from the past 7 days
  const recentFilings = await db
    .select({
      companyName: companies.name,
      cik: companies.cik,
      formType: filings.formType,
      filingDate: filings.filingDate,
      sector: companies.sicDescription,
      accessionNumber: filings.accessionNumber,
    })
    .from(filings)
    .innerJoin(companies, sql`${filings.companyCik} = ${companies.cik}`)
    .where(gte(filings.filingDate, weekStartStr))
    .orderBy(desc(filings.filingDate))
    .limit(50);

  // Get total companies tracked
  const companyCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(companies);

  // Build upcoming events from recent amendment filings (S-1/A, F-1/A)
  const upcomingEvents = recentFilings
    .filter((f) => f.formType?.includes("/A"))
    .map((f) => ({
      companyName: f.companyName || "Unknown",
      cik: f.cik,
      eventType: `${f.formType} Amendment Filed`,
      date: f.filingDate || weekEndStr,
    }));

  return {
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    newFilings: recentFilings.map((f) => ({
      companyName: f.companyName || "Unknown",
      cik: f.cik,
      formType: f.formType || "S-1",
      filingDate: f.filingDate || weekEndStr,
      sector: f.sector || "N/A",
      accessionNumber: f.accessionNumber || "",
    })),
    upcomingEvents,
    totalCompaniesTracked: Number(companyCount[0]?.count ?? 0),
    totalFilingsThisWeek: recentFilings.length,
  };
}

export function generateDigestHtml(
  data: DigestData,
  siteUrl: string
): string {
  const filingsRows = data.newFilings
    .slice(0, 15)
    .map(
      (f) => `
      <tr style="border-bottom: 1px solid #2a2f3a;">
        <td style="padding: 12px 16px; color: #e0e0e0; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px;">
          <a href="${siteUrl}/company/${f.cik}" style="color: #2dd4bf; text-decoration: none; font-weight: 600;">${f.companyName}</a>
        </td>
        <td style="padding: 12px 16px; color: #a0a0a0; font-family: 'JetBrains Mono', monospace; font-size: 13px;">${f.formType}</td>
        <td style="padding: 12px 16px; color: #a0a0a0; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px;">${f.filingDate}</td>
        <td style="padding: 12px 16px; color: #a0a0a0; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px;">${f.sector}</td>
      </tr>`
    )
    .join("");

  const upcomingRows = data.upcomingEvents
    .slice(0, 10)
    .map(
      (e) => `
      <tr style="border-bottom: 1px solid #2a2f3a;">
        <td style="padding: 10px 16px; color: #e0e0e0; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px;">
          <a href="${siteUrl}/company/${e.cik}" style="color: #2dd4bf; text-decoration: none;">${e.companyName}</a>
        </td>
        <td style="padding: 10px 16px; color: #d4a843; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px;">${e.eventType}</td>
        <td style="padding: 10px 16px; color: #a0a0a0; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px;">${e.date}</td>
      </tr>`
    )
    .join("");

  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f1117; font-family: 'DM Sans', Arial, sans-serif;">
  <tbody>
    <tr>
      <td style="padding: 40px 24px;">

        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom: 32px; border-bottom: 2px solid #2dd4bf;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; font-family: 'DM Sans', Arial, sans-serif;">
                📡 IPO Radar AI — Weekly Digest
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #a0a0a0; font-family: 'JetBrains Mono', monospace;">
                ${data.weekStart} — ${data.weekEnd}
              </p>
            </td>
          </tr>
        </table>

        <!-- Stats Banner -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
          <tr>
            <td width="50%" style="padding: 20px; background: linear-gradient(135deg, #1a1f2e, #0f1117); border: 1px solid #2a2f3a; border-radius: 8px;">
              <p style="margin: 0; font-size: 32px; font-weight: 700; color: #2dd4bf; font-family: 'JetBrains Mono', monospace;">${data.totalFilingsThisWeek}</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #a0a0a0; text-transform: uppercase; letter-spacing: 1px;">New Filings This Week</p>
            </td>
            <td width="16"></td>
            <td width="50%" style="padding: 20px; background: linear-gradient(135deg, #1a1f2e, #0f1117); border: 1px solid #2a2f3a; border-radius: 8px;">
              <p style="margin: 0; font-size: 32px; font-weight: 700; color: #d4a843; font-family: 'JetBrains Mono', monospace;">${data.totalCompaniesTracked}</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #a0a0a0; text-transform: uppercase; letter-spacing: 1px;">Companies Tracked</p>
            </td>
          </tr>
        </table>

        <!-- New Filings Section -->
        ${
          data.newFilings.length > 0
            ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
          <tr>
            <td>
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #ffffff; font-family: 'DM Sans', Arial, sans-serif;">
                🗂️ New SEC Filings
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1f2e; border: 1px solid #2a2f3a; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background: #252a3a;">
                    <th style="padding: 12px 16px; text-align: left; color: #a0a0a0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Company</th>
                    <th style="padding: 12px 16px; text-align: left; color: #a0a0a0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Form</th>
                    <th style="padding: 12px 16px; text-align: left; color: #a0a0a0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Filed</th>
                    <th style="padding: 12px 16px; text-align: left; color: #a0a0a0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Sector</th>
                  </tr>
                </thead>
                <tbody>
                  ${filingsRows}
                </tbody>
              </table>
            </td>
          </tr>
        </table>`
            : ""
        }

        <!-- Upcoming Events Section -->
        ${
          data.upcomingEvents.length > 0
            ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
          <tr>
            <td>
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #ffffff; font-family: 'DM Sans', Arial, sans-serif;">
                📅 Upcoming Events
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1f2e; border: 1px solid #2a2f3a; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background: #252a3a;">
                    <th style="padding: 10px 16px; text-align: left; color: #a0a0a0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Company</th>
                    <th style="padding: 10px 16px; text-align: left; color: #a0a0a0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Event</th>
                    <th style="padding: 10px 16px; text-align: left; color: #a0a0a0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${upcomingRows}
                </tbody>
              </table>
            </td>
          </tr>
        </table>`
            : ""
        }

        <!-- CTA Buttons -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
          <tr>
            <td align="center" style="padding: 24px; background: linear-gradient(135deg, #1a1f2e, #0f1117); border: 1px solid #2a2f3a; border-radius: 8px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #e0e0e0;">Explore full reports and track your watchlist</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="${siteUrl}/app/calendar" style="display: inline-block; padding: 12px 24px; background: #2dd4bf; color: #0f1117; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 6px; font-family: 'DM Sans', Arial, sans-serif;">
                      View IPO Calendar
                    </a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="${siteUrl}/discover" style="display: inline-block; padding: 12px 24px; background: transparent; color: #2dd4bf; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 6px; border: 1px solid #2dd4bf; font-family: 'DM Sans', Arial, sans-serif;">
                      Browse All IPOs
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px; border-top: 1px solid #2a2f3a;">
          <tr>
            <td style="padding-top: 24px;">
              <p style="margin: 0; font-size: 12px; color: #666; font-family: 'DM Sans', Arial, sans-serif; text-align: center;">
                Powered by IPO Radar AI — Real-time SEC EDGAR intelligence.<br/>
                Data sourced from SEC EDGAR public filings. Not financial advice.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </tbody>
</table>`;
}

export function generateDigestPlainText(data: DigestData, siteUrl: string): string {
  let text = `IPO RADAR AI — WEEKLY DIGEST\n`;
  text += `${data.weekStart} — ${data.weekEnd}\n\n`;
  text += `${data.totalFilingsThisWeek} new filings this week | ${data.totalCompaniesTracked} companies tracked\n\n`;

  if (data.newFilings.length > 0) {
    text += `NEW SEC FILINGS\n${"─".repeat(40)}\n`;
    for (const f of data.newFilings.slice(0, 15)) {
      text += `• ${f.companyName} — ${f.formType} filed ${f.filingDate} (${f.sector})\n`;
      text += `  ${siteUrl}/company/${f.cik}\n`;
    }
    text += "\n";
  }

  if (data.upcomingEvents.length > 0) {
    text += `UPCOMING EVENTS\n${"─".repeat(40)}\n`;
    for (const e of data.upcomingEvents.slice(0, 10)) {
      text += `• ${e.companyName} — ${e.eventType} (${e.date})\n`;
    }
    text += "\n";
  }

  text += `View IPO Calendar: ${siteUrl}/app/calendar\n`;
  text += `Browse All IPOs: ${siteUrl}/discover\n\n`;
  text += `Powered by IPO Radar AI. Data from SEC EDGAR. Not financial advice.\n`;

  return text;
}
