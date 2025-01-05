import { DateTime } from "luxon";

export function getWeekKey(timestamp: number): string {
	const dt = DateTime.fromMillis(timestamp, { zone: "Asia/Saigon" });
	return `${dt.weekYear}-${dt.weekNumber}`;
}

export function getNextWeek(
	year: number,
	week: number,
): { year: number; week: number } {
	const weeksInYear = getWeeksInYear(year);

	if (week >= weeksInYear) {
		return { year: year + 1, week: 1 };
	}

	return { year, week: week + 1 };
}

export function isConsecutiveWeeks(
	year1: number,
	week1: number,
	year2: number,
	week2: number,
): boolean {
	const next = getNextWeek(year1, week1);
	return next.year === year2 && next.week === week2;
}

export function getWeeksInYear(year: number): number {
	return DateTime.fromObject({ weekYear: year }, { zone: "Asia/Saigon" })
		.weeksInWeekYear;
}

export function parseWeekKey(weekKey: string): { year: number; week: number } {
	const [year, week] = weekKey.split("-").map(Number);
	return { year, week };
}
