"use cache";

import query_getEligibleAthletes from "src/app/admin/attendance/by-week/query_getEligibleAthletes";
import {
	unstable_cacheLife as cacheLife,
	unstable_cacheTag as cacheTag,
} from "next/cache";
import query_getAchievementForAthlete from "./query_getAchievementForAthlete";

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

export default async function query_getAchievements(): Promise<Achievement> {
	cacheLife("hours");
	cacheTag("achievement_aggregation");

	const athletes = await query_getEligibleAthletes();
	const athleteMap = new Map(athletes.map((a) => [a.id, a.value]));

	// Get achievements for all athletes
	const athleteAchievements = await Promise.all(
		athletes.map(async (athlete) => {
			const achievement = await query_getAchievementForAthlete(athlete.id);
			return {
				id: athlete.id,
				name: athleteMap.get(athlete.id) || "Unknown",
				achievement,
			};
		}),
	);

	// Sort athletes by different metrics
	const topThirtyMin = [...athleteAchievements].sort(
		(a, b) =>
			b.achievement.streaks.bestAttendanceStreak -
			a.achievement.streaks.bestAttendanceStreak,
	);
	const topRunning = [...athleteAchievements].sort(
		(a, b) =>
			b.achievement.streaks.bestRunningStreak -
			a.achievement.streaks.bestRunningStreak,
	);
	const bestRunner = athleteAchievements.reduce(
		(best, current) => {
			if (current.achievement.bestRun.laps < 6) return best;
			if (!best || best.achievement.bestRun.laps < 6) return current;
			return current.achievement.bestRun.minutesPerLap <
				best.achievement.bestRun.minutesPerLap
				? current
				: best;
		},
		undefined as (typeof athleteAchievements)[number] | undefined,
	);

	return {
		longestStreak: {
			weeks: topThirtyMin[0]?.achievement.streaks.bestAttendanceStreak || 0,
			athleteName: topThirtyMin[0]?.achievement.streaks.bestAttendanceStreak
				? topThirtyMin[0].name
				: "Unknown",
		},
		runningStreak: {
			weeks: topRunning[0]?.achievement.streaks.bestRunningStreak || 0,
			athleteName: topRunning[0]?.achievement.streaks.bestRunningStreak
				? topRunning[0].name
				: "Unknown",
		},
		bestPerformance:
			bestRunner && bestRunner.achievement.bestRun.laps >= 6
				? {
						...bestRunner.achievement.bestRun,
						athleteName: bestRunner.name,
					}
				: {
						minutesPerLap: 0,
						laps: 0,
						minutes: 0,
						athleteName: "Unknown",
					},
		topAttendance: topThirtyMin
			.filter((stat) => stat.achievement.streaks.bestAttendanceStreak > 0)
			.slice(0, 3)
			.map((stat) => ({
				id: stat.id,
				name: stat.name,
				weeks: stat.achievement.streaks.bestAttendanceStreak,
			})),
		topRunning: topRunning
			.filter((stat) => stat.achievement.streaks.bestRunningStreak > 0)
			.slice(0, 3)
			.map((stat) => ({
				id: stat.id,
				name: stat.name,
				weeks: stat.achievement.streaks.bestRunningStreak,
			})),
	};
}
