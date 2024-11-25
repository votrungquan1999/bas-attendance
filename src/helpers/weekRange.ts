import { connection } from "next/server";
import { DateTime } from "luxon";

export type WeekRange = {
	start: Date;
	end: Date;
};

/**
 * Calculates the start and end dates of a week based on a week offset
 * @param weekOffset - Number of weeks to offset from current week (negative for past weeks)
 * @returns Object containing start date (Monday) and end date (Sunday) of the specified week
 *
 * Examples:
 * - weekOffset = 0: Current week
 * - weekOffset = -1: Last week
 * - weekOffset = -2: Two weeks ago
 *
 * Note: Week starts on Monday and ends on Sunday, using Asia/Saigon timezone
 */
export default async function getWeekRange(weekOffset = 0) {
	await connection();

	const timeZone = "Asia/Saigon";

	// Get current date in Saigon timezone
	const now = DateTime.now().setZone(timeZone);

	// Get start of week (Monday) in Saigon timezone
	const startOfWeek = now.startOf("week").plus({ weeks: weekOffset });

	// Get end of week (Sunday) in Saigon timezone
	const endOfWeek = startOfWeek.endOf("week");

	return {
		start: startOfWeek.toJSDate(),
		end: endOfWeek.toJSDate(),
	};
}
