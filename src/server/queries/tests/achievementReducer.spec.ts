import { describe, expect, test } from "bun:test";
import {
	achievementReducer,
	type AchievementState,
} from "../achievementReducer";
import type {
	CompletedEnduranceRun,
	CompletedThirtyMinActivity,
} from "../../types";
import { DateTime } from "luxon";

describe("achievementReducer", () => {
	const initialState: AchievementState = {
		currentWeek: "",
		weeklyActivities: {
			enduranceRun: 0,
			personalTechnique: 0,
			probabilityPractice: 0,
			buddyTraining: 0,
		},
		streaks: {
			currentAttendanceStreak: 0,
			bestAttendanceStreak: 0,
			currentRunningStreak: 0,
			bestRunningStreak: 0,
			lastAttendanceStreakWeek: null,
			lastRunningStreakWeek: null,
		},
		bestRun: {
			minutesPerLap: 0,
			laps: 0,
			minutes: 0,
			timestamp: 0,
		},
	};

	function getTimestampForWeek(year: number, week: number): number {
		return DateTime.fromObject(
			{ weekYear: year, weekNumber: week },
			{ zone: "Asia/Saigon" },
		).toMillis();
	}

	test("should handle endurance run activity", () => {
		const timestamp = getTimestampForWeek(2024, 10);
		const activity: CompletedEnduranceRun = {
			id: "test-run-1",
			activity: "endurance-run",
			activityTimestamp: timestamp,
			attendanceId: "test-id",
			laps: "8",
			minutes: "48", // 6 min per lap
			submittedAt: timestamp,
		};

		const newState = achievementReducer(initialState, activity);

		expect(newState.weeklyActivities.enduranceRun).toBe(1);
		expect(newState.bestRun).toEqual({
			minutesPerLap: 6,
			laps: 8,
			minutes: 48,
			timestamp: activity.activityTimestamp,
		});
		expect(newState.currentWeek).toBe("2024-10");
	});

	test("should update best run only when better", () => {
		const timestamp = getTimestampForWeek(2024, 10);
		const state: AchievementState = {
			...initialState,
			currentWeek: "2024-10",
			bestRun: {
				minutesPerLap: 7, // worse performance
				laps: 6,
				minutes: 42,
				timestamp: timestamp - 1000,
			},
		};

		const activity: CompletedEnduranceRun = {
			id: "test-run-2",
			activity: "endurance-run",
			activityTimestamp: timestamp,
			attendanceId: "test-id",
			laps: "8",
			minutes: "48", // 6 min per lap - better performance
			submittedAt: timestamp,
		};

		const newState = achievementReducer(state, activity);
		expect(newState.bestRun.minutesPerLap).toBe(6);
	});

	test("should handle 30-minute session activities", () => {
		const timestamp = getTimestampForWeek(2024, 10);
		const activity: CompletedThirtyMinActivity = {
			id: "test-30min-1",
			activity: "30-minutes-session",
			activityTimestamp: timestamp,
			attendanceId: "test-id",
			thirtyMinActivity: "personal-technique",
			thirtyMinExplanation: "test explanation",
			submittedAt: timestamp,
		};

		const newState = achievementReducer(initialState, activity);
		expect(newState.weeklyActivities.personalTechnique).toBe(1);
		expect(newState.currentWeek).toBe("2024-10");
	});

	test("should reset weekly activities when week changes", () => {
		const state: AchievementState = {
			...initialState,
			currentWeek: "2024-10",
			weeklyActivities: {
				enduranceRun: 2, // met running goal
				personalTechnique: 2, // met personal technique goal
				probabilityPractice: 1, // met probability practice goal
				buddyTraining: 1, // met buddy training goal
			},
		};

		const week11Timestamp = getTimestampForWeek(2024, 11);
		const activity: CompletedThirtyMinActivity = {
			id: "test-30min-2",
			activity: "30-minutes-session",
			activityTimestamp: week11Timestamp,
			attendanceId: "test-id",
			thirtyMinActivity: "personal-technique",
			thirtyMinExplanation: "test explanation",
			submittedAt: week11Timestamp,
		};

		const newState = achievementReducer(state, activity);

		expect(newState.currentWeek).toBe("2024-11");
		expect(newState.weeklyActivities).toEqual({
			enduranceRun: 0,
			personalTechnique: 1,
			probabilityPractice: 0,
			buddyTraining: 0,
		});
	});

	test("should update attendance streak independently when completing attendance goal", () => {
		const timestamp = getTimestampForWeek(2024, 10);
		const state: AchievementState = {
			...initialState,
			currentWeek: "2024-10",
			weeklyActivities: {
				enduranceRun: 1, // running goal not met (needs 2)
				personalTechnique: 2, // met
				probabilityPractice: 1, // met
				buddyTraining: 0, // needs 1 more
			},
			streaks: {
				currentAttendanceStreak: 1,
				bestAttendanceStreak: 1,
				currentRunningStreak: 0, // running streak is 0 because previous week didn't meet running goal
				bestRunningStreak: 1,
				lastAttendanceStreakWeek: "2024-9",
				lastRunningStreakWeek: null,
			},
		};

		// This activity will complete the attendance goal
		const activity: CompletedThirtyMinActivity = {
			id: "test-30min-3",
			activity: "30-minutes-session",
			activityTimestamp: timestamp,
			attendanceId: "test-id",
			thirtyMinActivity: "buddy-training",
			thirtyMinExplanation: "completing attendance goal",
			submittedAt: timestamp,
		};

		const newState = achievementReducer(state, activity);

		// Attendance streak should increase while running streak remains at 0
		expect(newState.weeklyActivities.buddyTraining).toBe(1);
		expect(newState.streaks.currentAttendanceStreak).toBe(2); // increased because attendance goal was met
		expect(newState.streaks.currentRunningStreak).toBe(0); // remains 0 because running goal is still not met
		expect(newState.streaks.lastAttendanceStreakWeek).toBe("2024-10");
		expect(newState.streaks.lastRunningStreakWeek).toBe(null); // unchanged because running goal not met
	});

	test("should update running streak independently when completing running goal", () => {
		const timestamp = getTimestampForWeek(2024, 10);
		const state: AchievementState = {
			...initialState,
			currentWeek: "2024-10",
			weeklyActivities: {
				enduranceRun: 1, // needs 1 more
				personalTechnique: 1, // attendance goal not met (needs 2)
				probabilityPractice: 1, // met
				buddyTraining: 1, // met
			},
			streaks: {
				currentAttendanceStreak: 0, // attendance streak already broken
				bestAttendanceStreak: 1,
				currentRunningStreak: 1,
				bestRunningStreak: 1,
				lastAttendanceStreakWeek: null,
				lastRunningStreakWeek: "2024-9",
			},
		};

		// This activity will complete the running goal
		const activity: CompletedEnduranceRun = {
			id: "test-run-3",
			activity: "endurance-run",
			activityTimestamp: timestamp,
			attendanceId: "test-id",
			laps: "6",
			minutes: "42",
			submittedAt: timestamp,
		};

		const newState = achievementReducer(state, activity);

		// Running streak should increase while attendance streak remains at 0
		expect(newState.weeklyActivities.enduranceRun).toBe(2);
		expect(newState.streaks.currentRunningStreak).toBe(2); // increased
		expect(newState.streaks.currentAttendanceStreak).toBe(0); // unchanged
		expect(newState.streaks.lastRunningStreakWeek).toBe("2024-10");
		expect(newState.streaks.lastAttendanceStreakWeek).toBe(null); // unchanged
	});

	test("should break streaks independently when goals are not met", () => {
		const state: AchievementState = {
			...initialState,
			currentWeek: "2024-10",
			weeklyActivities: {
				enduranceRun: 1, // running not met (needs 2)
				personalTechnique: 2, // met
				probabilityPractice: 1, // met
				buddyTraining: 1, // met
			},
			streaks: {
				currentAttendanceStreak: 2,
				bestAttendanceStreak: 2,
				currentRunningStreak: 2,
				bestRunningStreak: 2,
				lastAttendanceStreakWeek: "2024-10",
				lastRunningStreakWeek: "2024-10",
			},
		};

		const week11Timestamp = getTimestampForWeek(2024, 11);
		const activity: CompletedEnduranceRun = {
			id: "test-run-4",
			activity: "endurance-run",
			activityTimestamp: week11Timestamp,
			attendanceId: "test-id",
			laps: "6",
			minutes: "42",
			submittedAt: week11Timestamp,
		};

		const newState = achievementReducer(state, activity);

		// Only running streak should break, attendance streak continues
		expect(newState.streaks.currentAttendanceStreak).toBe(3); // attendance was met in week 10
		expect(newState.streaks.currentRunningStreak).toBe(0); // running was not met in week 10
		expect(newState.streaks.bestAttendanceStreak).toBe(3);
		expect(newState.streaks.bestRunningStreak).toBe(2);
	});

	test("should break attendance streak independently when attendance goals are not met", () => {
		const state: AchievementState = {
			...initialState,
			currentWeek: "2024-10",
			weeklyActivities: {
				enduranceRun: 2, // running met (needs 2)
				personalTechnique: 1, // not met (needs 2)
				probabilityPractice: 1, // met (needs 1)
				buddyTraining: 1, // met (needs 1)
			},
			streaks: {
				currentAttendanceStreak: 2,
				bestAttendanceStreak: 2,
				currentRunningStreak: 2,
				bestRunningStreak: 2,
				lastAttendanceStreakWeek: "2024-10",
				lastRunningStreakWeek: "2024-10",
			},
		};

		const week11Timestamp = getTimestampForWeek(2024, 11);
		const activity: CompletedThirtyMinActivity = {
			id: "test-30min-4",
			activity: "30-minutes-session",
			activityTimestamp: week11Timestamp,
			attendanceId: "test-id",
			thirtyMinActivity: "personal-technique",
			thirtyMinExplanation: "first activity in new week",
			submittedAt: week11Timestamp,
		};

		const newState = achievementReducer(state, activity);

		// Only attendance streak should break, running streak continues
		expect(newState.streaks.currentAttendanceStreak).toBe(0); // attendance was not met in week 10
		expect(newState.streaks.currentRunningStreak).toBe(3); // running was met in week 10
		expect(newState.streaks.bestAttendanceStreak).toBe(2); // best attendance streak remains
		expect(newState.streaks.bestRunningStreak).toBe(3); // best running streak increases

		// New week should start with the new activity counted
		expect(newState.weeklyActivities).toEqual({
			enduranceRun: 0,
			personalTechnique: 1, // from the new activity
			probabilityPractice: 0,
			buddyTraining: 0,
		});
	});
});
