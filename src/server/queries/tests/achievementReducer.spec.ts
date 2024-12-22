import { describe, expect, test } from "bun:test";
import {
	achievementReducer,
	type AchievementState,
	type WeeklyGoalsMap,
} from "../achievementReducer";
import type {
	CompletedEnduranceRun,
	CompletedThirtyMinActivity,
	CompletedStandardSession,
	CompletedActivity,
	WeeklyGoals,
	CompletedProbabilityPractice,
} from "src/server/types";
import { DateTime } from "luxon";

describe("achievementReducer", () => {
	const defaultGoals: WeeklyGoals = {
		thirtyMin: {
			personalTechnique: 2,
			probabilityPractice: 1,
			buddyTraining: 1,
		},
		enduranceRun: 2,
		normalSession: {
			trainWithCoach: 1,
			trainNewbies: 1,
		},
	};

	const goalsMap: WeeklyGoalsMap = {
		"2024-8": defaultGoals,
		"2024-9": defaultGoals,
		"2024-10": defaultGoals,
		"2024-11": defaultGoals,
	};

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
		const state = initialState;

		const activity: CompletedEnduranceRun = {
			id: "test-run-1",
			activity: "endurance-run",
			activityTimestamp: timestamp,
			attendanceId: "test-id",
			laps: "8",
			minutes: "48", // 6 min per lap
			submittedAt: timestamp,
		};

		const newState = achievementReducer(state, activity, goalsMap);

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
		const state = initialState;

		// First activity - worse performance
		const firstActivity: CompletedEnduranceRun = {
			id: "test-run-2a",
			activity: "endurance-run",
			activityTimestamp: timestamp - 1000,
			attendanceId: "test-id",
			laps: "6",
			minutes: "42", // 7 min per lap
			submittedAt: timestamp - 1000,
		};

		// Second activity - better performance
		const secondActivity: CompletedEnduranceRun = {
			id: "test-run-2b",
			activity: "endurance-run",
			activityTimestamp: timestamp,
			attendanceId: "test-id",
			laps: "8",
			minutes: "48", // 6 min per lap
			submittedAt: timestamp,
		};

		const intermediateState = achievementReducer(
			state,
			firstActivity,
			goalsMap,
		);
		const newState = achievementReducer(
			intermediateState,
			secondActivity,
			goalsMap,
		);

		expect(newState.bestRun.minutesPerLap).toBe(6);
	});

	test("should handle 30-minute session activities", () => {
		const timestamp = getTimestampForWeek(2024, 10);
		const state = initialState;

		const activity: CompletedThirtyMinActivity = {
			id: "test-30min-1",
			activity: "30-minutes-session",
			activityTimestamp: timestamp,
			attendanceId: "test-id",
			thirtyMinActivity: "personal-technique",
			thirtyMinExplanation: "test explanation",
			submittedAt: timestamp,
		};

		const newState = achievementReducer(state, activity, goalsMap);
		// assert whole state
		expect(newState).toEqual({
			currentWeek: "2024-10",
			weeklyActivities: {
			enduranceRun: 0,
			personalTechnique: 1,
			probabilityPractice: 0,
			buddyTraining: 0,
			},
			streaks: {
				currentAttendanceStreak: 0,
				currentRunningStreak: 0,
				bestAttendanceStreak: 0,
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
		});
	});

	test("should increase the attendance streak when the goals are met", () => {
		const week10Timestamp = getTimestampForWeek(2024, 10);
		const state = initialState;

		// Setup activities for week 10
		const week10Activities: CompletedActivity[] = [
			{
				id: "test-run-3a",
				activity: "endurance-run",
				activityTimestamp: week10Timestamp,
				attendanceId: "test-id",
				laps: "8",
				minutes: "48",
				submittedAt: week10Timestamp,
			},
			{
				id: "test-30min-2a",
			activity: "30-minutes-session",
				activityTimestamp: week10Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "test explanation",
				submittedAt: week10Timestamp,
			},
			{
				id: "test-30min-2b",
				activity: "30-minutes-session",
				activityTimestamp: week10Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "test explanation",
				submittedAt: week10Timestamp,
			},
			{
				id: "test-30min-2c",
				activity: "30-minutes-session",
				activityTimestamp: week10Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "probability-practice",
				practiceType: "layup",
				practiceLevel: "1",
				practiceDescription: "test practice",
				submittedAt: week10Timestamp,
			} as CompletedProbabilityPractice,
			{
				id: "test-30min-2d",
				activity: "30-minutes-session",
				activityTimestamp: week10Timestamp,
			attendanceId: "test-id",
			thirtyMinActivity: "buddy-training",
				thirtyMinExplanation: "test explanation",
				submittedAt: week10Timestamp,
			},
		];

		// Apply all week 10 activities
		const stateAfterWeek10 = week10Activities.reduce(
			(currentState, activity) =>
				achievementReducer(currentState, activity, goalsMap),
			state,
		);

		// Verify state after week 10 activities - streak is 1 because week 10 goals are met
		expect(stateAfterWeek10.streaks.currentAttendanceStreak).toBe(1);
		// streak is 0 because running goal is not met
		expect(stateAfterWeek10.streaks.currentRunningStreak).toBe(0);
		expect(stateAfterWeek10.streaks.lastAttendanceStreakWeek).toBe("2024-10");
	});

	test("should increase running streak when the goals are met", () => {
		const week9Timestamp = getTimestampForWeek(2024, 9);
		const state = initialState;

		// Setup activities for week 9 to establish streak
		const week9Activities: CompletedActivity[] = [
			{
				id: "test-run-3e",
			activity: "endurance-run",
				activityTimestamp: week9Timestamp,
			attendanceId: "test-id",
			laps: "6",
			minutes: "42",
				submittedAt: week9Timestamp,
			},
			{
				id: "test-run-3f",
				activity: "endurance-run",
				activityTimestamp: week9Timestamp,
				attendanceId: "test-id",
				laps: "6",
				minutes: "42",
				submittedAt: week9Timestamp,
			},
		];

		// Apply all week 9 activities first
		const stateAfterWeek9 = week9Activities.reduce(
			(currentState, activity) =>
				achievementReducer(currentState, activity, goalsMap),
			state,
		);

		// assert that attendance streak is 1 since it meets the goal
		expect(stateAfterWeek9.streaks.currentRunningStreak).toBe(1);
		expect(stateAfterWeek9.streaks.lastRunningStreakWeek).toBe("2024-9");
		expect(stateAfterWeek9.currentWeek).toBe("2024-9");
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

		const newState = achievementReducer(state, activity, goalsMap);

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

		const newState = achievementReducer(state, activity, goalsMap);

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

	test("should throw error when goals are not found for a week", () => {
		const timestamp = getTimestampForWeek(2024, 12); // Week not in goalsMap
		const activity: CompletedThirtyMinActivity = {
			id: "test-30min-5",
			activity: "30-minutes-session",
			activityTimestamp: timestamp,
			attendanceId: "test-id",
			thirtyMinActivity: "personal-technique",
			thirtyMinExplanation: "activity in week without goals",
			submittedAt: timestamp,
		};

		expect(() => achievementReducer(initialState, activity, goalsMap)).toThrow(
			"No goals found for week 2024-12",
		);
	});

	test("should not affect streaks when activity is normal session but should still check week transition", () => {
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

		// Activity in the next week
		const activity: CompletedStandardSession = {
			id: "test-normal-1",
			activity: "normal-long-session",
			activityTimestamp: getTimestampForWeek(2024, 11),
			attendanceId: "test-id",
			submittedAt: getTimestampForWeek(2024, 11),
			sessionType: "train-with-coach",
		};

		const newState = achievementReducer(state, activity, goalsMap);

		// Streaks should be updated based on previous week's completion
		expect(newState.streaks.currentAttendanceStreak).toBe(3); // attendance was met in week 10
		expect(newState.streaks.currentRunningStreak).toBe(0); // running was not met in week 10
		expect(newState.streaks.bestAttendanceStreak).toBe(3);
		expect(newState.streaks.bestRunningStreak).toBe(2);

		// Weekly activities should be reset for the new week
		expect(newState.weeklyActivities).toEqual({
			enduranceRun: 0,
			personalTechnique: 0,
			probabilityPractice: 0,
			buddyTraining: 0,
		});

		// Week should be updated
		expect(newState.currentWeek).toBe("2024-11");
	});

	test("should preserve attendance streak when week has no thirty-minute goals", () => {
		const goalsWithNoThirtyMin: WeeklyGoalsMap = {
			"2024-10": {
				thirtyMin: {
					personalTechnique: 2,
					probabilityPractice: 1,
					buddyTraining: 1,
				},
				enduranceRun: 2,
				normalSession: {
					trainWithCoach: 1,
					trainNewbies: 1,
				},
			},
			"2024-11": {
				thirtyMin: {
					personalTechnique: 0,
					probabilityPractice: 0,
					buddyTraining: 0,
				},
				enduranceRun: 2,
				normalSession: {
					trainWithCoach: 1,
					trainNewbies: 1,
				},
			},
		};

		const state: AchievementState = {
			...initialState,
			currentWeek: "2024-10",
			weeklyActivities: {
				enduranceRun: 1,
				personalTechnique: 2, // met for week 10
				probabilityPractice: 1, // met for week 10
				buddyTraining: 1, // met for week 10
			},
			streaks: {
				currentAttendanceStreak: 2,
				bestAttendanceStreak: 2,
				currentRunningStreak: 1,
				bestRunningStreak: 1,
				lastAttendanceStreakWeek: "2024-10",
				lastRunningStreakWeek: "2024-10",
			},
		};

		// Activity in week 11 (which has no thirty-minute goals)
		const activity: CompletedThirtyMinActivity = {
			id: "test-30min-6",
			activity: "30-minutes-session",
			activityTimestamp: getTimestampForWeek(2024, 11),
			attendanceId: "test-id",
			thirtyMinActivity: "personal-technique",
			thirtyMinExplanation: "activity in week without goals",
			submittedAt: getTimestampForWeek(2024, 11),
		};

		const newState = achievementReducer(state, activity, goalsWithNoThirtyMin);

		// Attendance streak should be preserved since week 11 has no goals
		expect(newState.streaks.currentAttendanceStreak).toBe(2); // preserves streak since week 11 has no goals
		expect(newState.streaks.bestAttendanceStreak).toBe(2);
		expect(newState.streaks.lastAttendanceStreakWeek).toBe("2024-10"); // stays at week 10 since week 11 has no goals

		// Running streak should still be evaluated normally
		expect(newState.streaks.currentRunningStreak).toBe(0); // running was not met in week 10
		expect(newState.streaks.bestRunningStreak).toBe(1);

		// Weekly activities should be reset for the new week
		expect(newState.weeklyActivities).toEqual({
			enduranceRun: 0,
			personalTechnique: 1, // from the new activity
			probabilityPractice: 0,
			buddyTraining: 0,
		});

		// Week should be updated
		expect(newState.currentWeek).toBe("2024-11");
	});

	test("should not increase streak when current week has no goals", () => {
		const goalsWithNoThirtyMin: WeeklyGoalsMap = {
			"2024-10": {
				thirtyMin: {
					personalTechnique: 0,
					probabilityPractice: 0,
					buddyTraining: 0,
				},
				enduranceRun: 2,
				normalSession: {
					trainWithCoach: 1,
					trainNewbies: 1,
				},
			},
		};

		const state: AchievementState = {
			...initialState,
			currentWeek: "2024-10",
			weeklyActivities: {
				enduranceRun: 1,
				personalTechnique: 0,
				probabilityPractice: 0,
				buddyTraining: 0,
			},
			streaks: {
				currentAttendanceStreak: 2,
				bestAttendanceStreak: 2,
				currentRunningStreak: 1,
				bestRunningStreak: 1,
				lastAttendanceStreakWeek: "2024-9",
				lastRunningStreakWeek: "2024-9",
			},
		};

		// Activity in current week that has no goals
		const activity: CompletedThirtyMinActivity = {
			id: "test-30min-7",
			activity: "30-minutes-session",
			activityTimestamp: getTimestampForWeek(2024, 10),
			attendanceId: "test-id",
			thirtyMinActivity: "personal-technique",
			thirtyMinExplanation: "activity in week without goals",
			submittedAt: getTimestampForWeek(2024, 10),
		};

		const newState = achievementReducer(state, activity, goalsWithNoThirtyMin);

		// Streak should not increase since current week has no goals
		expect(newState.streaks.currentAttendanceStreak).toBe(2);
		expect(newState.streaks.bestAttendanceStreak).toBe(2);
		expect(newState.streaks.lastAttendanceStreakWeek).toBe("2024-9");

		// Weekly activities should be updated
		expect(newState.weeklyActivities).toEqual({
			enduranceRun: 1,
			personalTechnique: 1, // from the new activity
			probabilityPractice: 0,
			buddyTraining: 0,
		});

		// Week should remain the same
		expect(newState.currentWeek).toBe("2024-10");
	});

	test("should preserve streak when transitioning from week with no goals", () => {
		const goalsWithNoThirtyMin: WeeklyGoalsMap = {
			"2024-10": {
				thirtyMin: {
					personalTechnique: 0,
					probabilityPractice: 0,
					buddyTraining: 0,
				},
				enduranceRun: 2,
				normalSession: {
					trainWithCoach: 1,
					trainNewbies: 1,
				},
			},
			"2024-11": {
				thirtyMin: {
					personalTechnique: 2,
					probabilityPractice: 1,
					buddyTraining: 1,
				},
				enduranceRun: 2,
				normalSession: {
					trainWithCoach: 1,
					trainNewbies: 1,
				},
			},
		};

		const state: AchievementState = {
			...initialState,
			currentWeek: "2024-10",
			weeklyActivities: {
				enduranceRun: 1,
				personalTechnique: 1,
				probabilityPractice: 0,
				buddyTraining: 0,
			},
			streaks: {
				currentAttendanceStreak: 2,
				bestAttendanceStreak: 2,
				currentRunningStreak: 1,
				bestRunningStreak: 1,
				lastAttendanceStreakWeek: "2024-9",
				lastRunningStreakWeek: "2024-9",
			},
		};

		// Activity in next week (which has goals)
		const activity: CompletedThirtyMinActivity = {
			id: "test-30min-8",
			activity: "30-minutes-session",
			activityTimestamp: getTimestampForWeek(2024, 11),
			attendanceId: "test-id",
			thirtyMinActivity: "personal-technique",
			thirtyMinExplanation: "activity in new week",
			submittedAt: getTimestampForWeek(2024, 11),
		};

		const newState = achievementReducer(state, activity, goalsWithNoThirtyMin);

		// Streak should be preserved since previous week had no goals
		expect(newState.streaks.currentAttendanceStreak).toBe(2);
		expect(newState.streaks.bestAttendanceStreak).toBe(2);
		expect(newState.streaks.lastAttendanceStreakWeek).toBe("2024-9");

		// Weekly activities should be reset for the new week
		expect(newState.weeklyActivities).toEqual({
			enduranceRun: 0,
			personalTechnique: 1, // from the new activity
			probabilityPractice: 0,
			buddyTraining: 0,
		});

		// Week should be updated
		expect(newState.currentWeek).toBe("2024-11");
	});

	test("should preserve running streak when week has no running goals", () => {
		const goalsWithNoRunning: WeeklyGoalsMap = {
			"2024-10": {
				thirtyMin: {
					personalTechnique: 2,
					probabilityPractice: 1,
					buddyTraining: 1,
				},
				enduranceRun: 2,
				normalSession: {
					trainWithCoach: 1,
					trainNewbies: 1,
				},
			},
			"2024-11": {
				thirtyMin: {
					personalTechnique: 2,
					probabilityPractice: 1,
					buddyTraining: 1,
				},
				enduranceRun: 0, // no running goals
				normalSession: {
					trainWithCoach: 1,
					trainNewbies: 1,
				},
			},
		};

		const state: AchievementState = {
			...initialState,
			currentWeek: "2024-10",
			weeklyActivities: {
				enduranceRun: 2, // met for week 10
				personalTechnique: 1,
				probabilityPractice: 0,
				buddyTraining: 0,
			},
			streaks: {
				currentAttendanceStreak: 1,
				bestAttendanceStreak: 2,
				currentRunningStreak: 2,
				bestRunningStreak: 2,
				lastAttendanceStreakWeek: "2024-10",
				lastRunningStreakWeek: "2024-10",
			},
		};

		// Activity in week 11 (which has no running goals)
		const activity: CompletedEnduranceRun = {
			id: "test-run-5",
			activity: "endurance-run",
			activityTimestamp: getTimestampForWeek(2024, 11),
			attendanceId: "test-id",
			laps: "6",
			minutes: "42",
			submittedAt: getTimestampForWeek(2024, 11),
		};

		const newState = achievementReducer(state, activity, goalsWithNoRunning);

		// Running streak should be preserved since week 11 has no running goals
		expect(newState.streaks.currentRunningStreak).toBe(2); // preserves streak since week 11 has no goals
		expect(newState.streaks.bestRunningStreak).toBe(2);
		expect(newState.streaks.lastRunningStreakWeek).toBe("2024-10"); // stays at week 10 since week 11 has no goals

		// Attendance streak should still be evaluated normally
		expect(newState.streaks.currentAttendanceStreak).toBe(0); // attendance was not met in week 10
		expect(newState.streaks.bestAttendanceStreak).toBe(2);

		// Weekly activities should be reset for the new week
		expect(newState.weeklyActivities).toEqual({
			enduranceRun: 1, // from the new activity
			personalTechnique: 0,
			probabilityPractice: 0,
			buddyTraining: 0,
		});

		// Week should be updated
		expect(newState.currentWeek).toBe("2024-11");
	});

	test("should not increase running streak when current week has no running goals", () => {
		const goalsWithNoRunning: WeeklyGoalsMap = {
			"2024-10": {
				thirtyMin: {
					personalTechnique: 2,
					probabilityPractice: 1,
					buddyTraining: 1,
				},
				enduranceRun: 0, // no running goals
				normalSession: {
					trainWithCoach: 1,
					trainNewbies: 1,
				},
			},
		};

		const state: AchievementState = {
			...initialState,
			currentWeek: "2024-10",
			weeklyActivities: {
				enduranceRun: 1,
				personalTechnique: 0,
				probabilityPractice: 0,
				buddyTraining: 0,
			},
			streaks: {
				currentAttendanceStreak: 1,
				bestAttendanceStreak: 2,
				currentRunningStreak: 2,
				bestRunningStreak: 2,
				lastAttendanceStreakWeek: "2024-9",
				lastRunningStreakWeek: "2024-9",
			},
		};

		// Activity in current week that has no running goals
		const activity: CompletedEnduranceRun = {
			id: "test-run-6",
			activity: "endurance-run",
			activityTimestamp: getTimestampForWeek(2024, 10),
			attendanceId: "test-id",
			laps: "6",
			minutes: "42",
			submittedAt: getTimestampForWeek(2024, 10),
		};

		const newState = achievementReducer(state, activity, goalsWithNoRunning);

		// Running streak should not increase since current week has no goals
		expect(newState.streaks.currentRunningStreak).toBe(2);
		expect(newState.streaks.bestRunningStreak).toBe(2);
		expect(newState.streaks.lastRunningStreakWeek).toBe("2024-9");

		// Weekly activities should be updated
		expect(newState.weeklyActivities).toEqual({
			enduranceRun: 2, // from the new activity
			personalTechnique: 0,
			probabilityPractice: 0,
			buddyTraining: 0,
		});

		// Week should remain the same
		expect(newState.currentWeek).toBe("2024-10");
	});

	test("should preserve running streak when transitioning from week with no running goals", () => {
		const goalsWithNoRunning: WeeklyGoalsMap = {
			"2024-10": {
				thirtyMin: {
					personalTechnique: 2,
					probabilityPractice: 1,
					buddyTraining: 1,
				},
				enduranceRun: 0, // no running goals
				normalSession: {
					trainWithCoach: 1,
					trainNewbies: 1,
				},
			},
			"2024-11": {
				thirtyMin: {
					personalTechnique: 2,
					probabilityPractice: 1,
					buddyTraining: 1,
				},
				enduranceRun: 2,
				normalSession: {
					trainWithCoach: 1,
					trainNewbies: 1,
				},
			},
		};

		const state: AchievementState = {
			...initialState,
			currentWeek: "2024-10",
			weeklyActivities: {
				enduranceRun: 1,
				personalTechnique: 2, // met attendance goals
				probabilityPractice: 1,
				buddyTraining: 1,
			},
			streaks: {
				currentAttendanceStreak: 1,
				bestAttendanceStreak: 2,
				currentRunningStreak: 2,
				bestRunningStreak: 2,
				lastAttendanceStreakWeek: "2024-9",
				lastRunningStreakWeek: "2024-9",
			},
		};

		// Activity in next week (which has running goals)
		const activity: CompletedEnduranceRun = {
			id: "test-run-7",
			activity: "endurance-run",
			activityTimestamp: getTimestampForWeek(2024, 11),
			attendanceId: "test-id",
			laps: "6",
			minutes: "42",
			submittedAt: getTimestampForWeek(2024, 11),
		};

		const newState = achievementReducer(state, activity, goalsWithNoRunning);

		// Running streak should be preserved since previous week had no goals
		expect(newState.streaks.currentRunningStreak).toBe(2);
		expect(newState.streaks.bestRunningStreak).toBe(2);
		expect(newState.streaks.lastRunningStreakWeek).toBe("2024-9");

		// Attendance streak should still be evaluated normally
		expect(newState.streaks.currentAttendanceStreak).toBe(2); // attendance was met in week 10
		expect(newState.streaks.bestAttendanceStreak).toBe(2);

		// Weekly activities should be reset for the new week
		expect(newState.weeklyActivities).toEqual({
			enduranceRun: 1, // from the new activity
			personalTechnique: 0,
			probabilityPractice: 0,
			buddyTraining: 0,
		});

		// Week should be updated
		expect(newState.currentWeek).toBe("2024-11");
	});
});
