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
import { unstable_cacheLife as cacheLife } from "next/cache";

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

function getWeekNumber(timestamp: number): number {
	const date = new Date(timestamp);
	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() + 4 - (date.getDay() || 7));
	const yearStart = new Date(date.getFullYear(), 0, 1);
	return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
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
	weeks: Map<number, CompletedActivity[]>,
	checkFn: (activities: CompletedActivity[]) => boolean,
): number {
	let maxStreak = 0;
	let currentStreak = 0;
	let lastWeek: number | null = null;

	// Sort weeks in ascending order
	const sortedWeeks = Array.from(weeks.entries()).sort(([a], [b]) => a - b);

	for (const [week, activities] of sortedWeeks) {
		if ((lastWeek === null || week === lastWeek + 1) && checkFn(activities)) {
			currentStreak++;
		} else {
			currentStreak = checkFn(activities) ? 1 : 0;
		}
		maxStreak = Math.max(maxStreak, currentStreak);
		lastWeek = week;
	}

	return maxStreak;
}

export default async function query_getAchievements(): Promise<Achievement> {
	cacheLife("hours");

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

				// Group activities by week
				const weeklyActivities = new Map<number, CompletedActivity[]>();
				let bestPerformance: {
					minutesPerLap: number;
					laps: number;
					minutes: number;
				} | null = null;

				// Process all activities
				for (const activity of activities) {
					const weekNumber = getWeekNumber(activity.activityTimestamp);

					if (!weeklyActivities.has(weekNumber)) {
						weeklyActivities.set(weekNumber, []);
					}
					weeklyActivities.get(weekNumber)?.push(activity);

					if (activity.activity === "endurance-run") {
						const runActivity = activity as CompletedEnduranceRun;
						const laps = Number(runActivity.laps);
						const minutes = Number(runActivity.minutes);

						if (Number.isFinite(laps) && Number.isFinite(minutes) && laps > 0) {
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
