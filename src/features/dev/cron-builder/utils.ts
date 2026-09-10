export interface CronFields {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export function cronToString(f: CronFields): string {
  return `${f.minute || "*"} ${f.hour || "*"} ${f.dayOfMonth || "*"} ${f.month || "*"} ${f.dayOfWeek || "*"}`;
}

export function parseCronString(cron: string): CronFields {
  const parts = cron.trim().split(/\s+/);
  return {
    minute: parts[0] || "*",
    hour: parts[1] || "*",
    dayOfMonth: parts[2] || "*",
    month: parts[3] || "*",
    dayOfWeek: parts[4] || "*",
  };
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function explainCron(f: CronFields): string {
  try {
    let desc = "";

    // Minutes
    if (f.minute === "*") {
      desc += "Every minute";
    } else if (f.minute.startsWith("*/")) {
      desc += `Every ${f.minute.slice(2)} minutes`;
    } else {
      desc += `At minute ${f.minute}`;
    }

    // Hours
    if (f.hour === "*") {
      desc += ", past every hour";
    } else if (f.hour.startsWith("*/")) {
      desc += `, every ${f.hour.slice(2)} hours`;
    } else {
      desc += `, at ${f.hour.padStart(2, "0")}:00`;
    }

    // Day of Month
    if (f.dayOfMonth !== "*") {
      desc += `, on day ${f.dayOfMonth} of the month`;
    }

    // Month
    if (f.month !== "*") {
      const mNum = parseInt(f.month, 10);
      const mName = mNum >= 1 && mNum <= 12 ? MONTHS[mNum - 1] : f.month;
      desc += `, in ${mName}`;
    }

    // Day of Week
    if (f.dayOfWeek !== "*") {
      const dNum = parseInt(f.dayOfWeek, 10);
      const dName = dNum >= 0 && dNum <= 6 ? DAYS[dNum] : f.dayOfWeek;
      desc += `, on ${dName}`;
    }

    return desc;
  } catch {
    return "Custom schedule";
  }
}

export function calculateNextRuns(f: CronFields, count = 5): string[] {
  const runs: string[] = [];
  let current = new Date();
  // Round to next minute
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  // Simple simulator to project next occurrences
  let attempts = 0;
  while (runs.length < count && attempts < 100000) {
    attempts++;
    const min = current.getMinutes();
    const hr = current.getHours();
    const dom = current.getDate();
    const mon = current.getMonth() + 1;
    const dow = current.getDay();

    if (
      matchField(f.minute, min, 0, 59) &&
      matchField(f.hour, hr, 0, 23) &&
      matchField(f.dayOfMonth, dom, 1, 31) &&
      matchField(f.month, mon, 1, 12) &&
      matchField(f.dayOfWeek, dow, 0, 6)
    ) {
      runs.push(current.toLocaleString());
    }

    current = new Date(current.getTime() + 60000);
  }

  return runs;
}

function matchField(
  pattern: string,
  value: number,
  min: number,
  max: number,
): boolean {
  if (pattern === "*" || pattern === "?") return true;
  if (pattern.startsWith("*/")) {
    const step = parseInt(pattern.slice(2), 10);
    return step > 0 && value % step === 0;
  }
  if (pattern.includes(",")) {
    const parts = pattern.split(",");
    return parts.some((p) => matchField(p.trim(), value, min, max));
  }
  if (pattern.includes("-")) {
    const [startStr, endStr] = pattern.split("-");
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    return value >= start && value <= end;
  }
  return parseInt(pattern, 10) === value;
}
