import { connection } from "next/server";

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

	// Create date in Asia/Saigon timezone
	const today = new Date(
		new Date().toLocaleString("en-US", { timeZone: "Asia/Saigon" }),
	);

	// Calculate start of week (Monday)
	const startOfWeek = new Date(today);
	const currentDay = today.getDay();
	// Convert Sunday (0) to 7 for easier calculation
	const daysFromMonday = currentDay === 0 ? 7 : currentDay;
	// Subtract days to get to Monday, then add offset weeks
	startOfWeek.setDate(today.getDate() - (daysFromMonday - 1) + weekOffset * 7);
	startOfWeek.setHours(0, 0, 0, 0);

	// Calculate end of week (Sunday)
	const endOfWeek = new Date(startOfWeek);
	// Add 6 days to Monday to get to Sunday
	endOfWeek.setDate(startOfWeek.getDate() + 6);
	endOfWeek.setHours(23, 59, 59, 999);

	return {
		start: startOfWeek,
		end: endOfWeek,
	};
}
