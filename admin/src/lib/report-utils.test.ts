import { describe, expect, it } from "vitest";
import { countByMonth, fetchAllRows, lastTwelveMonths, monthKey } from "./report-utils";

describe("monthKey", () => {
  it("buckets by SAST calendar month", () => {
    // 23:30 UTC on 31 Oct is 01:30 SAST on 1 Nov.
    expect(monthKey("2026-10-31T23:30:00Z")).toBe("2026-11");
    expect(monthKey("2026-10-31T21:00:00Z")).toBe("2026-10");
  });

  it("returns null for missing or invalid dates", () => {
    expect(monthKey(null)).toBeNull();
    expect(monthKey("not a date")).toBeNull();
  });
});

describe("lastTwelveMonths", () => {
  it("returns 12 consecutive months ending with the current one", () => {
    const months = lastTwelveMonths(new Date("2026-11-03T10:00:00Z"));
    expect(months).toHaveLength(12);
    expect(months[0].key).toBe("2025-12");
    expect(months[11].key).toBe("2026-11");
  });
});

describe("countByMonth", () => {
  it("keeps the same month in different years apart", () => {
    const counts = countByMonth(
      [{ at: "2025-11-10T10:00:00Z" }, { at: "2026-11-10T10:00:00Z" }, { at: "2026-11-11T10:00:00Z" }],
      (r) => r.at
    );
    expect(counts).toEqual({ "2025-11": 1, "2026-11": 2 });
  });
});

describe("fetchAllRows", () => {
  it("pages until a short page is returned", async () => {
    const all = Array.from({ length: 2500 }, (_, i) => i);
    const rows = await fetchAllRows((from, to) =>
      Promise.resolve({ data: all.slice(from, to + 1), error: null })
    );
    expect(rows).toHaveLength(2500);
  });
});
