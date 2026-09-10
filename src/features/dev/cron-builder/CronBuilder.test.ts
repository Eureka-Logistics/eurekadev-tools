import { describe, it, expect } from "vitest";
import {
  cronToString,
  parseCronString,
  explainCron,
  calculateNextRuns,
} from "./utils";

describe("Cron Builder utils", () => {
  it("parses and formats cron string round-trip", () => {
    const raw = "15 10 * * 1-5";
    const fields = parseCronString(raw);
    expect(fields.minute).toBe("15");
    expect(fields.hour).toBe("10");
    expect(fields.dayOfWeek).toBe("1-5");

    const formatted = cronToString(fields);
    expect(formatted).toBe(raw);
  });

  it("generates descriptive explanation for cron schedule", () => {
    const fields = {
      minute: "*/5",
      hour: "*",
      dayOfMonth: "*",
      month: "*",
      dayOfWeek: "*",
    };
    const desc = explainCron(fields);
    expect(desc).toContain("Every 5 minutes");
  });

  it("calculates next run times correctly", () => {
    const fields = {
      minute: "*",
      hour: "*",
      dayOfMonth: "*",
      month: "*",
      dayOfWeek: "*",
    };
    const runs = calculateNextRuns(fields, 5);
    expect(runs).toHaveLength(5);
  });
});
