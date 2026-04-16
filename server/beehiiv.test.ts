import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Beehiiv Client", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    process.env.BEEHIIV_API_KEY = "test_api_key";
    process.env.BEEHIIV_PUBLICATION_ID = "pub_test_123";
  });

  it("isConfigured returns true when both env vars are set", async () => {
    const { isConfigured } = await import("./beehiiv/client");
    expect(isConfigured()).toBe(true);
  });

  it("isConfigured returns false when API key is missing", async () => {
    delete process.env.BEEHIIV_API_KEY;
    const { isConfigured } = await import("./beehiiv/client");
    expect(isConfigured()).toBe(false);
  });

  it("isConfigured returns false when publication ID is missing", async () => {
    delete process.env.BEEHIIV_PUBLICATION_ID;
    const { isConfigured } = await import("./beehiiv/client");
    expect(isConfigured()).toBe(false);
  });

  it("createSubscription sends correct request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "sub_123",
          email: "test@example.com",
          status: "active",
          created: Date.now(),
        },
      }),
    });

    const { createSubscription } = await import("./beehiiv/client");
    const result = await createSubscription("test@example.com", {
      utmSource: "ipo-radar-ai",
      sendWelcomeEmail: true,
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("test@example.com");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/subscriptions");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer test_api_key");

    const body = JSON.parse(options.body);
    expect(body.email).toBe("test@example.com");
    expect(body.utm_source).toBe("ipo-radar-ai");
  });

  it("createSubscription returns error when not configured", async () => {
    delete process.env.BEEHIIV_API_KEY;
    const { createSubscription } = await import("./beehiiv/client");
    const result = await createSubscription("test@example.com");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not configured");
  });

  it("createSubscription handles API errors gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      text: async () => "Invalid email",
    });

    const { createSubscription } = await import("./beehiiv/client");
    const result = await createSubscription("bad-email");
    expect(result.success).toBe(false);
    expect(result.error).toContain("422");
  });

  it("createPost sends correct request for Enterprise", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: "post_abc123" } }),
    });

    const { createPost } = await import("./beehiiv/client");
    const result = await createPost({
      title: "Weekly Digest",
      bodyContent: "<h1>Hello</h1>",
      status: "draft",
    });

    expect(result.success).toBe(true);
    expect(result.postId).toBe("post_abc123");

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/posts");
    const body = JSON.parse(options.body);
    expect(body.title).toBe("Weekly Digest");
    expect(body.body_content).toBe("<h1>Hello</h1>");
    expect(body.status).toBe("draft");
  });

  it("createPost returns helpful error for non-Enterprise plans", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => "Enterprise plan required",
    });

    const { createPost } = await import("./beehiiv/client");
    const result = await createPost({
      title: "Test",
      bodyContent: "<p>test</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Enterprise");
  });

  it("listSubscriptions returns empty when not configured", async () => {
    delete process.env.BEEHIIV_API_KEY;
    const { listSubscriptions } = await import("./beehiiv/client");
    const result = await listSubscriptions();
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("getSubscriptionByEmail returns null when not configured", async () => {
    delete process.env.BEEHIIV_API_KEY;
    const { getSubscriptionByEmail } = await import("./beehiiv/client");
    const result = await getSubscriptionByEmail("test@example.com");
    expect(result).toBeNull();
  });

  it("deleteSubscription returns false when not configured", async () => {
    delete process.env.BEEHIIV_API_KEY;
    const { deleteSubscription } = await import("./beehiiv/client");
    const result = await deleteSubscription("sub_123");
    expect(result).toBe(false);
  });

  it("getPublication returns null when not configured", async () => {
    delete process.env.BEEHIIV_API_KEY;
    const { getPublication } = await import("./beehiiv/client");
    const result = await getPublication();
    expect(result).toBeNull();
  });
});

describe("Beehiiv Unsubscribe", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    process.env.BEEHIIV_API_KEY = "test_api_key";
    process.env.BEEHIIV_PUBLICATION_ID = "pub_test_123";
  });

  it("unsubscribeByEmail looks up and deletes the subscription", async () => {
    // First call: getSubscriptionByEmail
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: "sub_456", email: "test@example.com", status: "active" } }),
    });
    // Second call: deleteSubscription
    mockFetch.mockResolvedValueOnce({ ok: true });

    const { unsubscribeByEmail } = await import("./beehiiv/client");
    const result = await unsubscribeByEmail("test@example.com");

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("unsubscribeByEmail returns error when subscription not found", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    const { unsubscribeByEmail } = await import("./beehiiv/client");
    const result = await unsubscribeByEmail("nonexistent@example.com");

    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });

  it("unsubscribeByEmail returns error when not configured", async () => {
    delete process.env.BEEHIIV_API_KEY;
    const { unsubscribeByEmail } = await import("./beehiiv/client");
    const result = await unsubscribeByEmail("test@example.com");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not configured");
  });
});

describe("Newsletter tRPC Integration", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    process.env.BEEHIIV_API_KEY = "test_api_key";
    process.env.BEEHIIV_PUBLICATION_ID = "pub_test_123";
  });

  it("syncSubscriber calls Beehiiv createSubscription", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: "sub_789", email: "user@test.com", status: "active" } }),
    });

    const { syncSubscriber } = await import("./beehiiv");
    const result = await syncSubscriber("user@test.com", "homepage");

    expect(result.synced).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("syncSubscriber returns graceful error when not configured", async () => {
    delete process.env.BEEHIIV_API_KEY;
    const { syncSubscriber } = await import("./beehiiv");
    const result = await syncSubscriber("user@test.com");

    expect(result.synced).toBe(false);
    expect(result.error).toContain("not configured");
  });

  it("previewDigest returns HTML and plain text without sending", async () => {
    const { previewDigest } = await import("./beehiiv");
    const result = await previewDigest("https://iporadar.ai");

    expect(result.html).toContain("IPO Radar AI");
    expect(result.html).toContain("Weekly Digest");
    expect(result.plainText).toContain("IPO RADAR AI");
    expect(result.data).toBeDefined();
    expect(result.data.weekStart).toBeDefined();
    expect(result.data.weekEnd).toBeDefined();
    // No fetch calls — preview doesn't send
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("generateAndSendDigest falls back to notification when Beehiiv post fails", async () => {
    // Beehiiv post creation fails (non-Enterprise)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => "Enterprise plan required",
    });
    // notifyOwner call
    mockFetch.mockResolvedValueOnce({ ok: true });

    const { generateAndSendDigest } = await import("./beehiiv");
    const result = await generateAndSendDigest("https://iporadar.ai", {
      sendViaBeehiiv: true,
      asDraft: false,
    });

    expect(result.success).toBe(true);
    expect(result.method).toBe("notification");
    expect(result.html).toContain("IPO Radar AI");
  });

  it("generateAndSendDigest returns preview_only when Beehiiv not configured", async () => {
    delete process.env.BEEHIIV_API_KEY;
    const { generateAndSendDigest } = await import("./beehiiv");
    const result = await generateAndSendDigest("https://iporadar.ai");

    expect(result.success).toBe(true);
    expect(result.method).toBe("preview_only");
    expect(result.html).toBeDefined();
  });
});

describe("Digest Generator", () => {
  it("generateDigestHtml produces valid HTML with Dark Terminal Luxe styling", async () => {
    const { generateDigestHtml } = await import("./beehiiv/digest");

    const html = generateDigestHtml(
      {
        weekStart: "2026-04-09",
        weekEnd: "2026-04-16",
        newFilings: [
          {
            companyName: "Acme Corp",
            cik: "0001234567",
            formType: "S-1",
            filingDate: "2026-04-14",
            sector: "Technology",
            accessionNumber: "0001234567-26-000001",
          },
        ],
        upcomingEvents: [
          {
            companyName: "Acme Corp",
            cik: "0001234567",
            eventType: "S-1/A Amendment Filed",
            date: "2026-04-15",
          },
        ],
        totalCompaniesTracked: 42,
        totalFilingsThisWeek: 7,
      },
      "https://iporadar.ai"
    );

    expect(html).toContain("IPO Radar AI");
    expect(html).toContain("Weekly Digest");
    expect(html).toContain("Acme Corp");
    expect(html).toContain("S-1");
    expect(html).toContain("2026-04-09");
    expect(html).toContain("2026-04-16");
    expect(html).toContain("https://iporadar.ai/company/0001234567");
    expect(html).toContain("#0f1117"); // Dark Terminal Luxe bg
    expect(html).toContain("#2dd4bf"); // Teal accent
    expect(html).toContain("View IPO Calendar");
    expect(html).toContain("Browse All IPOs");
  });

  it("generateDigestHtml handles empty data gracefully", async () => {
    const { generateDigestHtml } = await import("./beehiiv/digest");

    const html = generateDigestHtml(
      {
        weekStart: "2026-04-09",
        weekEnd: "2026-04-16",
        newFilings: [],
        upcomingEvents: [],
        totalCompaniesTracked: 0,
        totalFilingsThisWeek: 0,
      },
      "https://iporadar.ai"
    );

    expect(html).toContain("IPO Radar AI");
    expect(html).toContain("0"); // zero filings
    expect(html).not.toContain("New SEC Filings"); // section should be omitted
  });

  it("generateDigestPlainText produces readable text", async () => {
    const { generateDigestPlainText } = await import("./beehiiv/digest");

    const text = generateDigestPlainText(
      {
        weekStart: "2026-04-09",
        weekEnd: "2026-04-16",
        newFilings: [
          {
            companyName: "Acme Corp",
            cik: "0001234567",
            formType: "S-1",
            filingDate: "2026-04-14",
            sector: "Technology",
            accessionNumber: "0001234567-26-000001",
          },
        ],
        upcomingEvents: [],
        totalCompaniesTracked: 42,
        totalFilingsThisWeek: 1,
      },
      "https://iporadar.ai"
    );

    expect(text).toContain("IPO RADAR AI");
    expect(text).toContain("Acme Corp");
    expect(text).toContain("S-1");
    expect(text).toContain("https://iporadar.ai/company/0001234567");
  });
});
