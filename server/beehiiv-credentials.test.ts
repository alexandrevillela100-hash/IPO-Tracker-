import { describe, it, expect } from "vitest";

/**
 * Validates that the Beehiiv API credentials are correctly configured
 * by making a lightweight API call to fetch publication info.
 */
describe("Beehiiv Credentials Validation", () => {
  it("should have BEEHIIV_API_KEY set", () => {
    const apiKey = process.env.BEEHIIV_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey!.length).toBeGreaterThan(0);
  });

  it("should have BEEHIIV_PUBLICATION_ID set", () => {
    const pubId = process.env.BEEHIIV_PUBLICATION_ID;
    expect(pubId).toBeDefined();
    expect(pubId!.length).toBeGreaterThan(0);
  });

  it("should successfully authenticate with Beehiiv API", async () => {
    const apiKey = process.env.BEEHIIV_API_KEY;
    const pubId = process.env.BEEHIIV_PUBLICATION_ID;

    if (!apiKey || !pubId) {
      console.warn("Beehiiv credentials not set, skipping live API test");
      return;
    }

    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.id).toBe(pubId);
    console.log(`[Beehiiv] Connected to publication: ${json.data.name}`);
  });
});
