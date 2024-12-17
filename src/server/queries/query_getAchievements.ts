"use cache";

import { groupBy } from "lodash/fp";
import type {
	CompletedEnduranceRun,
	CompletedActivity,
} from "src/server/types";
import {
	type ActivitiesCollection,
	ActivitiesCollectionName,
} from "src/server/collections";
import getDB from "src/server/db";
import query_getEligibleAthletes from "src/app/admin/attendance/by-week/query_getEligibleAthletes";
import { WEEKLY_GOALS } from "src/server/constants";
import {
	unstable_cacheLife as cacheLife,
	unstable_cacheTag as cacheTag,
} from "next/cache";
import { DateTime } from "luxon";

interface Achievement {
	longestStreak: {
		weeks: number;
		athleteName: string;
	};
	runningStreak: {
		weeks: number;
		athleteName: string;
	};
	bestPerformance: {
		minutesPerLap: number;
		laps: number;
		minutes: number;
		athleteName: string;
	};
	topAttendance: Array<{
		id: string;
		name: string;
		weeks: number;
	}>;
	topRunning: Array<{
		id: string;
		name: string;
		weeks: number;
	}>;
}

function getWeekKey(timestamp: number): string {
	const dt = DateTime.fromMillis(timestamp, {
		zone: "Asia/Saigon",
	});
	return `${dt.year}-${dt.weekNumber}`;
}

function isWeekCompleted(activities: CompletedActivity[]): boolean {
	const thirtyMinActivities = activities.filter(
		(a) => a.activity === "30-minutes-session",
	);

	// Count different types of 30-min activities
	const personalTechnique = thirtyMinActivities.filter(
		(a) =>
			"thirtyMinActivity" in a && a.thirtyMinActivity === "personal-technique",
	).length;
	const probabilityPractice = thirtyMinActivities.filter(
		(a) =>
			"thirtyMinActivity" in a &&
			a.thirtyMinActivity === "probability-practice",
	).length;
	const buddyTraining = thirtyMinActivities.filter(
		(a) => "thirtyMinActivity" in a && a.thirtyMinActivity === "buddy-training",
	).length;

	// Check if all 30-minute goals are met
	return (
		personalTechnique >= WEEKLY_GOALS.thirtyMin.personalTechnique &&
		probabilityPractice >= WEEKLY_GOALS.thirtyMin.probabilityPractice &&
		buddyTraining >= WEEKLY_GOALS.thirtyMin.buddyTraining
	);
}

function isRunningWeekCompleted(activities: CompletedActivity[]): boolean {
	const enduranceRuns = activities.filter(
		(a) => a.activity === "endurance-run",
	).length;
	return enduranceRuns >= WEEKLY_GOALS.enduranceRun;
}

function calculateStreak(
	weeks: Map<string, CompletedActivity[]>,
	checkFn: (activities: CompletedActivity[]) => boolean,
): number {
	let maxStreak = 0;
	let currentStreak = 0;

	let lastWeekKey: string | null = null;

	// Sort weeks in ascending order by year and week number
	const sortedWeeks = Array.from(weeks.entries()).sort(([a], [b]) => {
		const [yearA, weekA] = a.split("-").map(Number);
		const [yearB, weekB] = b.split("-").map(Number);
		if (yearA !== yearB) return yearA - yearB;
		return weekA - weekB;
	});

	for (const [weekKey, activities] of sortedWeeks) {
		if (lastWeekKey === null) {
			currentStreak = checkFn(activities) ? 1 : 0;
		} else {
			const [lastYear, lastWeek] = lastWeekKey.split("-").map(Number);
			const [currentYear, currentWeek] = weekKey.split("-").map(Number);

			const isConsecutive =
				(currentYear === lastYear && currentWeek === lastWeek + 1) ||
				(currentYear === lastYear + 1 &&
					lastWeek ===
						DateTime.local(lastYear, { zone: "Asia/Saigon" }).weeksInWeekYear &&
					currentWeek === 1);

			if (isConsecutive && checkFn(activities)) {
				currentStreak++;
			} else {
				currentStreak = checkFn(activities) ? 1 : 0;
			}
		}
		maxStreak = Math.max(maxStreak, currentStreak);
		lastWeekKey = weekKey;
	}

	return maxStreak;
}

export default async function query_getAchievements(): Promise<Achievement> {
	cacheLife("hours");
	cacheTag("achievement_aggregation");

	const { db, close } = await getDB();

	try {
		const activitiesCollection = db.collection<ActivitiesCollection>(
			ActivitiesCollectionName,
		);

		const activities = await activitiesCollection
			.find({})
			.sort({ activityTimestamp: -1 })
			.toArray();

		const athletes = await query_getEligibleAthletes();
		const athleteMap = new Map(athletes.map((a) => [a.id, a.value]));

		const groupedByAthlete = groupBy("attendanceId", activities);

		const athleteStats = Object.entries(groupedByAthlete)
			.map(([attendanceId, activities]) => {
				if (!athleteMap.has(attendanceId)) return null;

				// Group activities by week-year instead of just week
				const weeklyActivities = new Map<string, CompletedActivity[]>();
				let bestPerformance: {
					minutesPerLap: number;
					laps: number;
					minutes: number;
				} | null = null;

				// Process all activities
				for (const activity of activities) {
					const weekKey = getWeekKey(activity.activityTimestamp);

					if (!weeklyActivities.has(weekKey)) {
						weeklyActivities.set(weekKey, []);
					}
					weeklyActivities.get(weekKey)?.push(activity);

					if (activity.activity === "endurance-run") {
						const runActivity = activity as CompletedEnduranceRun;
						const laps = Number(runActivity.laps);
						const minutes = Number(runActivity.minutes);

						if (
							Number.isFinite(laps) &&
							Number.isFinite(minutes) &&
							laps >= 6 // Only consider performances with at least 6 laps
						) {
							const minutesPerLap = minutes / laps;
							if (
								!bestPerformance ||
								minutesPerLap < bestPerformance.minutesPerLap
							) {
								bestPerformance = {
									minutesPerLap,
									laps,
									minutes,
								};
							}
						}
					}
				}

				return {
					id: attendanceId,
					name: athleteMap.get(attendanceId) || "Unknown",
					thirtyMinStreak: calculateStreak(weeklyActivities, isWeekCompleted),
					runningStreak: calculateStreak(
						weeklyActivities,
						isRunningWeekCompleted,
					),
					bestPerformance,
				};
			})
			.filter((stat): stat is NonNullable<typeof stat> => stat !== null);

		// Sort athletes by different metrics
		const topThirtyMin = [...athleteStats].sort(
			(a, b) => b.thirtyMinStreak - a.thirtyMinStreak,
		);
		const topRunning = [...athleteStats].sort(
			(a, b) => b.runningStreak - a.runningStreak,
		);
		const bestRunner = athleteStats.reduce((best, current) => {
			if (!current.bestPerformance) return best;
			if (!best?.bestPerformance) return current;
			return current.bestPerformance.minutesPerLap <
				best.bestPerformance.minutesPerLap
				? current
				: best;
		});

		return {
			longestStreak: {
				weeks: topThirtyMin[0]?.thirtyMinStreak || 0,
				athleteName: topThirtyMin[0]?.name || "Unknown",
			},
			runningStreak: {
				weeks: topRunning[0]?.runningStreak || 0,
				athleteName: topRunning[0]?.name || "Unknown",
			},
			bestPerformance: bestRunner?.bestPerformance
				? {
						...bestRunner.bestPerformance,
						athleteName: bestRunner.name,
					}
				: {
						minutesPerLap: 0,
						laps: 0,
						minutes: 0,
						athleteName: "Unknown",
					},
			topAttendance: topThirtyMin
				.filter((stat) => stat.thirtyMinStreak > 0)
				.slice(0, 3)
				.map((stat) => ({
					id: stat.id,
					name: stat.name,
					weeks: stat.thirtyMinStreak,
				})),
			topRunning: topRunning
				.filter((stat) => stat.runningStreak > 0)
				.slice(0, 3)
				.map((stat) => ({
					id: stat.id,
					name: stat.name,
					weeks: stat.runningStreak,
				})),
		};
	} finally {
		await close();
	}
}
