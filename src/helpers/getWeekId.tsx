import type { DateTime } from "luxon";
import type { WeekId } from "src/server/collections";

export function getWeekId(date: DateTime) {
	return `${date.weekYear}-W${date.weekNumber}` as WeekId;
}
