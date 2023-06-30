import { DateTime } from "luxon";

export function formatDateTime(ISO: string, style: "date" | "time"): string {
  return DateTime.fromISO(ISO).toFormat(
    style === "date" ? "MM.dd.yyyy" : "MM.dd.yyyy, h:mm a"
  );
}
