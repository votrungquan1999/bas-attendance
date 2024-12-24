import { describe, expect, test } from "bun:test";
import {
	achievementReducer,
	NoGoalsFoundError,
	type AchievementState,
	type WeeklyGoalsMap,
} from "../../src/server/queries/achievementReducer";
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
		"2024-12": defaultGoals,
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
		lastActivityId: null,
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
			lastActivityId: "test-30min-1",
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

	test("should break running streaks when transition to new week and goals are not met", () => {
		const week9Timestamp = getTimestampForWeek(2024, 9);
		const week10Timestamp = getTimestampForWeek(2024, 10);
		const week11Timestamp = getTimestampForWeek(2024, 11);
		const state = initialState;

		// Setup activities for week 9 - meeting running goal
		const week9Activities: CompletedActivity[] = [
			{
				id: "test-run-5a",
				activity: "endurance-run",
				activityTimestamp: week9Timestamp,
				attendanceId: "test-id",
				laps: "6",
				minutes: "42",
				submittedAt: week9Timestamp,
			},
			{
				id: "test-run-5b",
				activity: "endurance-run",
				activityTimestamp: week9Timestamp,
				attendanceId: "test-id",
				laps: "6",
				minutes: "42",
				submittedAt: week9Timestamp,
			},
		];

		// Setup activities for week 10 - meeting attendance goal but not running goal
		const week10Activities: CompletedActivity[] = [
			{
				id: "test-run-5c",
				activity: "endurance-run",
				activityTimestamp: week10Timestamp,
				attendanceId: "test-id",
				laps: "6",
				minutes: "42",
				submittedAt: week10Timestamp,
			}, // Only one run, not meeting the goal of 2
		];

		// Apply week 9 activities first
		const stateAfterWeek9 = week9Activities.reduce(
			(currentState, activity) =>
				achievementReducer(currentState, activity, goalsMap),
			state,
		);

		// Then apply week 10 activities
		const stateAfterWeek10 = week10Activities.reduce(
			(currentState, activity) =>
				achievementReducer(currentState, activity, goalsMap),
			stateAfterWeek9,
		);

		// Activity in week 11 - not meeting any goals
		const week11Activity: CompletedEnduranceRun = {
			id: "test-run-5e",
			activity: "endurance-run",
			activityTimestamp: week11Timestamp,
			attendanceId: "test-id",
			laps: "6",
			minutes: "42",
			submittedAt: week11Timestamp,
		};

		const newState = achievementReducer(
			stateAfterWeek10,
			week11Activity,
			goalsMap,
		);

		// running streak should break
		expect(newState.streaks.currentRunningStreak).toBe(0);
		expect(newState.streaks.lastRunningStreakWeek).toBe(null);
		expect(newState.currentWeek).toBe("2024-11");
		expect(newState.streaks.bestRunningStreak).toBe(1);
	});

	test("should break attendance streak when attendance goals are not met", () => {
		const week9Timestamp = getTimestampForWeek(2024, 9);
		const week10Timestamp = getTimestampForWeek(2024, 10);
		const week11Timestamp = getTimestampForWeek(2024, 11);
		const state = initialState;

		// Setup activities for week 9 - meeting all goals
		const week9Activities: CompletedActivity[] = [
			{
				id: "test-30min-6a",
				activity: "30-minutes-session",
				activityTimestamp: week9Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "week 9 activity 1",
				submittedAt: week9Timestamp,
			},
			{
				id: "test-30min-6b",
				activity: "30-minutes-session",
				activityTimestamp: week9Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "week 9 activity 2",
				submittedAt: week9Timestamp,
			},
			{
				id: "test-30min-6c",
				activity: "30-minutes-session",
				activityTimestamp: week9Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "probability-practice",
				practiceType: "layup",
				practiceLevel: "1",
				practiceDescription: "week 9 practice",
				submittedAt: week9Timestamp,
			} as CompletedProbabilityPractice,
			{
				id: "test-30min-6d",
				activity: "30-minutes-session",
				activityTimestamp: week9Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "buddy-training",
				thirtyMinExplanation: "week 9 activity 4",
				submittedAt: week9Timestamp,
			},
		];

		// Setup activities for week 10 - meeting running goal but not attendance goal
		const week10Activities: CompletedActivity[] = [
			{
				id: "test-run-6e",
				activity: "endurance-run",
				activityTimestamp: week10Timestamp,
				attendanceId: "test-id",
				laps: "6",
				minutes: "42",
				submittedAt: week10Timestamp,
			},
			{
				id: "test-run-6f",
				activity: "endurance-run",
				activityTimestamp: week10Timestamp,
				attendanceId: "test-id",
				laps: "6",
				minutes: "42",
				submittedAt: week10Timestamp,
			},
			{
				id: "test-30min-6e",
				activity: "30-minutes-session",
				activityTimestamp: week10Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "week 10 activity 1",
				submittedAt: week10Timestamp,
			}, // Only one personal technique, need 2
		];

		// Apply week 9 activities first
		const stateAfterWeek9 = week9Activities.reduce(
			(currentState, activity) =>
				achievementReducer(currentState, activity, goalsMap),
			state,
		);

		// Then apply week 10 activities
		const stateAfterWeek10 = week10Activities.reduce(
			(currentState, activity) =>
				achievementReducer(currentState, activity, goalsMap),
			stateAfterWeek9,
		);

		// Activity in week 11
		const week11Activity: CompletedThirtyMinActivity = {
			id: "test-30min-6f",
			activity: "30-minutes-session",
			activityTimestamp: week11Timestamp,
			attendanceId: "test-id",
			thirtyMinActivity: "personal-technique",
			thirtyMinExplanation: "first activity in new week",
			submittedAt: week11Timestamp,
		};

		const newState = achievementReducer(
			stateAfterWeek10,
			week11Activity,
			goalsMap,
		);

		// attendance streak should break
		expect(newState.streaks.currentAttendanceStreak).toBe(0); // attendance was not met in week 10
		expect(newState.streaks.bestAttendanceStreak).toBe(1); // best attendance streak from week 9
		expect(newState.streaks.lastAttendanceStreakWeek).toBe(null);
		expect(newState.currentWeek).toBe("2024-11");
	});

	test("should throw NoGoalsFoundError when goals are not found for a week", () => {
		const timestamp = getTimestampForWeek(2024, 1); // Week not in goalsMap
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
			new NoGoalsFoundError("2024-1"),
		);
	});

	test("should not affect streaks when activity is normal session but should still check week transition", () => {
		const week10Timestamp = getTimestampForWeek(2024, 10);
		const week11Timestamp = getTimestampForWeek(2024, 11);
		const state = initialState;

		// First establish a streak by completing week 10 goals
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
				id: "test-run-3b",
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

		// Verify state after week 10 - streaks should be 1 since goals are met
		expect(stateAfterWeek10.streaks.currentAttendanceStreak).toBe(1);
		expect(stateAfterWeek10.streaks.currentRunningStreak).toBe(1);
		expect(stateAfterWeek10.streaks.bestAttendanceStreak).toBe(1);
		expect(stateAfterWeek10.streaks.bestRunningStreak).toBe(1);
		expect(stateAfterWeek10.streaks.lastAttendanceStreakWeek).toBe("2024-10");
		expect(stateAfterWeek10.streaks.lastRunningStreakWeek).toBe("2024-10");

		// Activity in week 11 - normal session
		const week11Activity: CompletedStandardSession = {
			id: "test-normal-1",
			activity: "normal-long-session",
			activityTimestamp: week11Timestamp,
			attendanceId: "test-id",
			submittedAt: week11Timestamp,
			sessionType: "train-with-coach",
		};

		const stateAfterNormalSession = achievementReducer(
			stateAfterWeek10,
			week11Activity,
			goalsMap,
		);

		// Now add some activities in week 11 but not enough to meet goals
		const week11IncompleteActivities: CompletedActivity[] = [
			{
				id: "test-run-4a",
				activity: "endurance-run",
				activityTimestamp: week11Timestamp,
				attendanceId: "test-id",
				laps: "8",
				minutes: "48",
				submittedAt: week11Timestamp,
			}, // Only one run, need two
			{
				id: "test-30min-3a",
				activity: "30-minutes-session",
				activityTimestamp: week11Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "test explanation",
				submittedAt: week11Timestamp,
			}, // Only one personal technique, need two
			{
				id: "test-30min-3b",
				activity: "30-minutes-session",
				activityTimestamp: week11Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "probability-practice",
				practiceType: "layup",
				practiceLevel: "1",
				practiceDescription: "test practice",
				submittedAt: week11Timestamp,
			} as CompletedProbabilityPractice,
			{
				id: "test-30min-3c",
				activity: "30-minutes-session",
				activityTimestamp: week11Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "buddy-training",
				thirtyMinExplanation: "test explanation",
				submittedAt: week11Timestamp,
			},
		];

		// Apply week 11 incomplete activities
		const finalState = week11IncompleteActivities.reduce(
			(currentState, activity) =>
				achievementReducer(currentState, activity, goalsMap),
			stateAfterNormalSession,
		);

		// Verify final state - activities should be counted but streaks should remain at 1
		expect(finalState.weeklyActivities).toEqual({
			enduranceRun: 1, // one run
			personalTechnique: 1, // one personal technique
			probabilityPractice: 1,
			buddyTraining: 1,
		});

		expect(finalState.streaks.currentAttendanceStreak).toBe(1); // still 1 from week 10
		expect(finalState.streaks.currentRunningStreak).toBe(1); // still 1 from week 10
		expect(finalState.streaks.bestAttendanceStreak).toBe(1);
		expect(finalState.streaks.bestRunningStreak).toBe(1);
		expect(finalState.streaks.lastAttendanceStreakWeek).toBe("2024-10");
		expect(finalState.streaks.lastRunningStreakWeek).toBe("2024-10");

		// Week should still be week 11
		expect(finalState.currentWeek).toBe("2024-11");

		// Add normal session activity to week 12 - this should break streaks since week 11 goals weren't met
		const week12Timestamp = getTimestampForWeek(2024, 12);
		const week12Activity: CompletedStandardSession = {
			id: "test-normal-2",
			activity: "normal-long-session",
			activityTimestamp: week12Timestamp,
			attendanceId: "test-id",
			submittedAt: week12Timestamp,
			sessionType: "train-with-coach",
		};

		const stateAfterWeek12 = achievementReducer(
			finalState,
			week12Activity,
			goalsMap,
		);

		// Verify that streaks are broken since week 11 goals weren't met
		expect(stateAfterWeek12.streaks.currentAttendanceStreak).toBe(0); // reset since week 11 goals weren't met
		expect(stateAfterWeek12.streaks.currentRunningStreak).toBe(0); // reset since week 11 goals weren't met
		expect(stateAfterWeek12.streaks.bestAttendanceStreak).toBe(1); // best streak remains 1 from week 10
		expect(stateAfterWeek12.streaks.bestRunningStreak).toBe(1); // best streak remains 1 from week 10
		expect(stateAfterWeek12.streaks.lastAttendanceStreakWeek).toBe(null); // reset since streak is broken
		expect(stateAfterWeek12.streaks.lastRunningStreakWeek).toBe(null); // reset since streak is broken

		// Weekly activities should be reset for week 12
		expect(stateAfterWeek12.weeklyActivities).toEqual({
			enduranceRun: 0,
			personalTechnique: 0,
			probabilityPractice: 0,
			buddyTraining: 0,
		});

		// Week should be updated to week 12
		expect(stateAfterWeek12.currentWeek).toBe("2024-12");
	});

	test("should preserve attendance streak when week has no thirty-minute goals", () => {
		// test setup: completed week 10 goals, then not completed week 11 running goals
		// while week 11 has no thirty-minute goals
		// when add activity in week 12, attendance streak should be preserved while running streak is broken
		const week10Timestamp = getTimestampForWeek(2024, 10);
		const week11Timestamp = getTimestampForWeek(2024, 11);
		const state = initialState;

		const goalsWithNoThirtyMin: WeeklyGoalsMap = {
			"2024-10": defaultGoals,
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
			"2024-12": defaultGoals,
		};

		// Setup activities for week 10 - meeting all goals
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
				id: "test-run-3b",
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
				achievementReducer(currentState, activity, goalsWithNoThirtyMin),
			state,
		);

		// Verify state after week 10 - streaks should be 1 since goals are met
		expect(stateAfterWeek10.streaks.currentAttendanceStreak).toBe(1);
		expect(stateAfterWeek10.streaks.currentRunningStreak).toBe(1);
		expect(stateAfterWeek10.streaks.bestAttendanceStreak).toBe(1);
		expect(stateAfterWeek10.streaks.bestRunningStreak).toBe(1);
		expect(stateAfterWeek10.streaks.lastAttendanceStreakWeek).toBe("2024-10");
		expect(stateAfterWeek10.streaks.lastRunningStreakWeek).toBe("2024-10");

		// Activity in week 11 (which has no thirty-minute goals)
		const week11Activities: CompletedActivity[] = [
			{
				id: "test-run-4a",
				activity: "endurance-run",
				activityTimestamp: week11Timestamp,
				attendanceId: "test-id",
				laps: "8",
				minutes: "48",
				submittedAt: week11Timestamp,
			}, // Only one run, need two
			{
				id: "test-30min-3a",
				activity: "30-minutes-session",
				activityTimestamp: week11Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "test explanation",
				submittedAt: week11Timestamp,
			}, // Only one personal technique, need two
		];

		// Apply week 11 activities
		const stateAfterWeek11 = week11Activities.reduce(
			(currentState, activity) =>
				achievementReducer(currentState, activity, goalsWithNoThirtyMin),
			stateAfterWeek10,
		);

		// Week should be updated
		expect(stateAfterWeek11.currentWeek).toBe("2024-11");

		// Add activity in week 12 to verify streak behavior
		const week12Timestamp = getTimestampForWeek(2024, 12);
		const week12Activity: CompletedThirtyMinActivity = {
			id: "test-30min-4a",
			activity: "30-minutes-session",
			activityTimestamp: week12Timestamp,
			attendanceId: "test-id",
			thirtyMinActivity: "personal-technique",
			thirtyMinExplanation: "test explanation",
			submittedAt: week12Timestamp,
		};

		const stateAfterWeek12 = achievementReducer(
			stateAfterWeek11,
			week12Activity,
			goalsWithNoThirtyMin,
		);

		// Attendance streak should still be preserved since week 11 had no thirty-minute goals
		expect(stateAfterWeek12.streaks.currentAttendanceStreak).toBe(1); // preserves streak since week 11 had no goals
		expect(stateAfterWeek12.streaks.bestAttendanceStreak).toBe(1);
		expect(stateAfterWeek12.streaks.lastAttendanceStreakWeek).toBe("2024-10"); // stays at week 10 since week 11 had no goals

		// Running streak should be broken since week 11 running goals weren't met
		expect(stateAfterWeek12.streaks.currentRunningStreak).toBe(0); // reset since week 11 running goals weren't met
		expect(stateAfterWeek12.streaks.bestRunningStreak).toBe(1);
		expect(stateAfterWeek12.streaks.lastRunningStreakWeek).toBe(null); // reset since streak is broken

		// Weekly activities should be reset for week 12
		expect(stateAfterWeek12.weeklyActivities).toEqual({
			enduranceRun: 0,
			personalTechnique: 1, // from the new activity
			probabilityPractice: 0,
			buddyTraining: 0,
		});

		// Week should be updated to week 12
		expect(stateAfterWeek12.currentWeek).toBe("2024-12");
	});

	test("should preserve running streak when current week has no running goals", () => {
		// test setup: completed week 10 goals, then not completed week 11 thirty-minute goals
		// while week 11 has no running goals
		// when add activity in week 12, running streak should be preserved while attendance streak is broken
		const week10Timestamp = getTimestampForWeek(2024, 10);
		const week11Timestamp = getTimestampForWeek(2024, 11);
		const state = initialState;

		const goalsWithNoRunning: WeeklyGoalsMap = {
			"2024-10": defaultGoals,
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
			"2024-12": defaultGoals,
		};

		// Setup activities for week 10 - meeting all goals
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
				id: "test-run-3b",
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
				achievementReducer(currentState, activity, goalsWithNoRunning),
			state,
		);

		// Verify state after week 10 - streaks should be 1 since goals are met
		expect(stateAfterWeek10.streaks.currentAttendanceStreak).toBe(1);
		expect(stateAfterWeek10.streaks.currentRunningStreak).toBe(1);
		expect(stateAfterWeek10.streaks.bestAttendanceStreak).toBe(1);
		expect(stateAfterWeek10.streaks.bestRunningStreak).toBe(1);
		expect(stateAfterWeek10.streaks.lastAttendanceStreakWeek).toBe("2024-10");
		expect(stateAfterWeek10.streaks.lastRunningStreakWeek).toBe("2024-10");

		// Activity in week 11 (which has no running goals)
		const week11Activities: CompletedActivity[] = [
			{
				id: "test-run-4a",
				activity: "endurance-run",
				activityTimestamp: week11Timestamp,
				attendanceId: "test-id",
				laps: "8",
				minutes: "48",
				submittedAt: week11Timestamp,
			},
			{
				id: "test-30min-3a",
				activity: "30-minutes-session",
				activityTimestamp: week11Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "test explanation",
				submittedAt: week11Timestamp,
			}, // Only one personal technique, need two
		];

		// Apply week 11 activities
		const stateAfterWeek11 = week11Activities.reduce(
			(currentState, activity) =>
				achievementReducer(currentState, activity, goalsWithNoRunning),
			stateAfterWeek10,
		);

		// Week should be updated
		expect(stateAfterWeek11.currentWeek).toBe("2024-11");

		// Add activity in week 12 to verify streak behavior
		const week12Timestamp = getTimestampForWeek(2024, 12);
		const week12Activity: CompletedEnduranceRun = {
			id: "test-run-5a",
			activity: "endurance-run",
			activityTimestamp: week12Timestamp,
			attendanceId: "test-id",
			laps: "8",
			minutes: "48",
			submittedAt: week12Timestamp,
		};

		const stateAfterWeek12 = achievementReducer(
			stateAfterWeek11,
			week12Activity,
			goalsWithNoRunning,
		);

		// Running streak should still be preserved since week 11 had no running goals
		expect(stateAfterWeek12.streaks.currentRunningStreak).toBe(1); // preserves streak since week 11 had no running goals
		expect(stateAfterWeek12.streaks.bestRunningStreak).toBe(1);
		expect(stateAfterWeek12.streaks.lastRunningStreakWeek).toBe("2024-10"); // stays at week 10 since week 11 had no running goals

		// Attendance streak should be broken since week 11 thirty-minute goals weren't met
		expect(stateAfterWeek12.streaks.currentAttendanceStreak).toBe(0); // reset since week 11 thirty-minute goals weren't met
		expect(stateAfterWeek12.streaks.bestAttendanceStreak).toBe(1);
		expect(stateAfterWeek12.streaks.lastAttendanceStreakWeek).toBe(null); // reset since streak is broken

		// Weekly activities should be reset for week 12
		expect(stateAfterWeek12.weeklyActivities).toEqual({
			enduranceRun: 1, // from the new activity
			personalTechnique: 0,
			probabilityPractice: 0,
			buddyTraining: 0,
		});

		// Week should be updated to week 12
		expect(stateAfterWeek12.currentWeek).toBe("2024-12");
	});

	test("should handle multiple week transitions with mixed goal settings", () => {
		// Test setup:
		// Week 10: Has all goals, completes all goals -> streaks become 1
		// Week 11: No running goals, incomplete thirty-min goals -> running streak preserved, attendance streak broken
		// Week 12: No thirty-min goals, incomplete running goals -> attendance streak still 0, running streak broken
		// Week 13: Has all goals, completes all goals -> both streaks become 1 again
		const week10Timestamp = getTimestampForWeek(2024, 10);
		const week11Timestamp = getTimestampForWeek(2024, 11);
		const week12Timestamp = getTimestampForWeek(2024, 12);
		const week13Timestamp = getTimestampForWeek(2024, 13);
		const state = initialState;

		const mixedGoalsMap: WeeklyGoalsMap = {
			"2024-10": defaultGoals,
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
			"2024-12": {
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
			"2024-13": defaultGoals,
		};

		// Week 10 activities - meeting all goals
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
				id: "test-run-3b",
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

		// Apply week 10 activities
		const stateAfterWeek10 = week10Activities.reduce(
			(currentState, activity) =>
				achievementReducer(currentState, activity, mixedGoalsMap),
			state,
		);

		// Verify state after week 10 - streaks should be 1 since goals are met
		expect(stateAfterWeek10.streaks.currentAttendanceStreak).toBe(1);
		expect(stateAfterWeek10.streaks.currentRunningStreak).toBe(1);
		expect(stateAfterWeek10.streaks.bestAttendanceStreak).toBe(1);
		expect(stateAfterWeek10.streaks.bestRunningStreak).toBe(1);
		expect(stateAfterWeek10.streaks.lastAttendanceStreakWeek).toBe("2024-10");
		expect(stateAfterWeek10.streaks.lastRunningStreakWeek).toBe("2024-10");

		// Week 11 activities - incomplete thirty-min goals, no running goals
		const week11Activities: CompletedActivity[] = [
			{
				id: "test-run-4a",
				activity: "endurance-run",
				activityTimestamp: week11Timestamp,
				attendanceId: "test-id",
				laps: "8",
				minutes: "48",
				submittedAt: week11Timestamp,
			},
			{
				id: "test-30min-3a",
				activity: "30-minutes-session",
				activityTimestamp: week11Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "test explanation",
				submittedAt: week11Timestamp,
			}, // Only one personal technique, need two
			// add this to make the transition to week 12 without affecting anything
			{
				id: "test-normal-session-1a",
				activity: "normal-long-session",
				activityTimestamp: week12Timestamp,
				attendanceId: "test-id",
				sessionType: "train-newbies",
				submittedAt: week12Timestamp,
			},
		];

		// Apply week 11 activities
		const stateAfterWeek11 = week11Activities.reduce(
			(currentState, activity) =>
				achievementReducer(currentState, activity, mixedGoalsMap),
			stateAfterWeek10,
		);

		// Verify state after week 11

		// Running streak should still be 1 since week 11 has no running goals
		expect(stateAfterWeek11.streaks.currentRunningStreak).toBe(1); // preserves streak since week 11 had no running goals
		expect(stateAfterWeek11.streaks.bestRunningStreak).toBe(1);
		expect(stateAfterWeek11.streaks.lastRunningStreakWeek).toBe("2024-10"); // stays at week 10 since week 11 had no running goals

		// Attendance streak should be broken since thirty-min goals weren't met
		expect(stateAfterWeek11.streaks.currentAttendanceStreak).toBe(0); // reset since week 11 thirty-min goals weren't met
		expect(stateAfterWeek11.streaks.bestAttendanceStreak).toBe(1);
		expect(stateAfterWeek11.streaks.lastAttendanceStreakWeek).toBe(null); // reset since streak is broken

		// Week 12 activities - incomplete running goals, no thirty-min goals
		const week12Activities: CompletedActivity[] = [
			{
				id: "test-run-5a",
				activity: "endurance-run",
				activityTimestamp: week12Timestamp,
				attendanceId: "test-id",
				laps: "8",
				minutes: "48",
				submittedAt: week12Timestamp,
			}, // Only one run, need two
			{
				id: "test-30min-4a",
				activity: "30-minutes-session",
				activityTimestamp: week12Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "test explanation",
				submittedAt: week12Timestamp,
			},
			// add this to make the transition to week 13 without affecting anything
			{
				id: "test-normal-session-2a",
				activity: "normal-long-session",
				activityTimestamp: week13Timestamp,
				attendanceId: "test-id",
				sessionType: "train-newbies",
				submittedAt: week13Timestamp,
			},
		];

		// Apply week 12 activities
		const stateAfterWeek12 = week12Activities.reduce(
			(currentState, activity) =>
				achievementReducer(currentState, activity, mixedGoalsMap),
			stateAfterWeek11,
		);

		// Verify state after week 12
		// Attendance streak should still be 0 (the same from week 11) since week 12 has no thirty-min goals
		expect(stateAfterWeek12.streaks.currentAttendanceStreak).toBe(0);
		expect(stateAfterWeek12.streaks.bestAttendanceStreak).toBe(1);
		expect(stateAfterWeek12.streaks.lastAttendanceStreakWeek).toBe(null);
		// Running streak should be broken since week 12 running goals weren't met
		expect(stateAfterWeek12.streaks.currentRunningStreak).toBe(0);
		expect(stateAfterWeek12.streaks.bestRunningStreak).toBe(1);
		expect(stateAfterWeek12.streaks.lastRunningStreakWeek).toBe(null);

		// Week 13 activities - meeting all goals
		const week13Activities: CompletedActivity[] = [
			{
				id: "test-run-6a",
				activity: "endurance-run",
				activityTimestamp: week13Timestamp,
				attendanceId: "test-id",
				laps: "8",
				minutes: "48",
				submittedAt: week13Timestamp,
			},
			{
				id: "test-run-6b",
				activity: "endurance-run",
				activityTimestamp: week13Timestamp,
				attendanceId: "test-id",
				laps: "8",
				minutes: "48",
				submittedAt: week13Timestamp,
			},
			{
				id: "test-30min-5a",
				activity: "30-minutes-session",
				activityTimestamp: week13Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "test explanation",
				submittedAt: week13Timestamp,
			},
			{
				id: "test-30min-5b",
				activity: "30-minutes-session",
				activityTimestamp: week13Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "test explanation",
				submittedAt: week13Timestamp,
			},
			{
				id: "test-30min-5c",
				activity: "30-minutes-session",
				activityTimestamp: week13Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "probability-practice",
				practiceType: "layup",
				practiceLevel: "1",
				practiceDescription: "test practice",
				submittedAt: week13Timestamp,
			} as CompletedProbabilityPractice,
			{
				id: "test-30min-5d",
				activity: "30-minutes-session",
				activityTimestamp: week13Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "buddy-training",
				thirtyMinExplanation: "test explanation",
				submittedAt: week13Timestamp,
			},
		];

		// Apply week 13 activities
		const stateAfterWeek13 = week13Activities.reduce(
			(currentState, activity) =>
				achievementReducer(currentState, activity, mixedGoalsMap),
			stateAfterWeek12,
		);

		// Verify final state - both streaks should be 1 since week 13 goals are met
		expect(stateAfterWeek13.streaks.currentAttendanceStreak).toBe(1);
		expect(stateAfterWeek13.streaks.currentRunningStreak).toBe(1);
		expect(stateAfterWeek13.streaks.bestAttendanceStreak).toBe(1);
		expect(stateAfterWeek13.streaks.bestRunningStreak).toBe(1);
		expect(stateAfterWeek13.streaks.lastAttendanceStreakWeek).toBe("2024-13");
		expect(stateAfterWeek13.streaks.lastRunningStreakWeek).toBe("2024-13");

		// Weekly activities should be counted for week 13
		expect(stateAfterWeek13.weeklyActivities).toEqual({
			enduranceRun: 2,
			personalTechnique: 2,
			probabilityPractice: 1,
			buddyTraining: 1,
		});

		// Week should be updated to week 13
		expect(stateAfterWeek13.currentWeek).toBe("2024-13");
	});

	test("should update lastActivityId with each activity", () => {
		const week10Timestamp = getTimestampForWeek(2024, 10);
		const state = initialState;

		// First activity
		const firstActivity: CompletedEnduranceRun = {
			id: "test-run-1",
			activity: "endurance-run",
			activityTimestamp: week10Timestamp,
			attendanceId: "test-id",
			laps: "8",
			minutes: "48",
			submittedAt: week10Timestamp,
		};

		const stateAfterFirstActivity = achievementReducer(
			state,
			firstActivity,
			goalsMap,
		);
		expect(stateAfterFirstActivity.lastActivityId).toBe("test-run-1");

		// Second activity
		const secondActivity: CompletedThirtyMinActivity = {
			id: "test-30min-1",
			activity: "30-minutes-session",
			activityTimestamp: week10Timestamp,
			attendanceId: "test-id",
			thirtyMinActivity: "personal-technique",
			thirtyMinExplanation: "test explanation",
			submittedAt: week10Timestamp,
		};

		const stateAfterSecondActivity = achievementReducer(
			stateAfterFirstActivity,
			secondActivity,
			goalsMap,
		);
		expect(stateAfterSecondActivity.lastActivityId).toBe("test-30min-1");

		// Normal session activity
		const thirdActivity: CompletedStandardSession = {
			id: "test-normal-1",
			activity: "normal-long-session",
			activityTimestamp: week10Timestamp,
			attendanceId: "test-id",
			submittedAt: week10Timestamp,
			sessionType: "train-with-coach",
		};

		const stateAfterThirdActivity = achievementReducer(
			stateAfterSecondActivity,
			thirdActivity,
			goalsMap,
		);
		expect(stateAfterThirdActivity.lastActivityId).toBe("test-normal-1");

		// Week transition should preserve the last activity ID
		const week11Timestamp = getTimestampForWeek(2024, 11);
		const fourthActivity: CompletedEnduranceRun = {
			id: "test-run-2",
			activity: "endurance-run",
			activityTimestamp: week11Timestamp,
			attendanceId: "test-id",
			laps: "8",
			minutes: "48",
			submittedAt: week11Timestamp,
		};

		const stateAfterFourthActivity = achievementReducer(
			stateAfterThirdActivity,
			fourthActivity,
			goalsMap,
		);
		expect(stateAfterFourthActivity.lastActivityId).toBe("test-run-2");
	});

	test("should check the weekly goals in between if the new activity is not consecutive with the current week", () => {
		const week8Timestamp = getTimestampForWeek(2024, 8);
		const week11Timestamp = getTimestampForWeek(2024, 11);
		const state = initialState;

		// Setup activities for week 8 - meeting all goals
		const week8Activities: CompletedActivity[] = [
			{
				id: "test-run-8a",
				activity: "endurance-run",
				activityTimestamp: week8Timestamp,
				attendanceId: "test-id",
				laps: "8",
				minutes: "48",
				submittedAt: week8Timestamp,
			},
			{
				id: "test-run-8b",
				activity: "endurance-run",
				activityTimestamp: week8Timestamp,
				attendanceId: "test-id",
				laps: "8",
				minutes: "48",
				submittedAt: week8Timestamp,
			},
			{
				id: "test-30min-8a",
				activity: "30-minutes-session",
				activityTimestamp: week8Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "test explanation",
				submittedAt: week8Timestamp,
			},
			{
				id: "test-30min-8b",
				activity: "30-minutes-session",
				activityTimestamp: week8Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "test explanation",
				submittedAt: week8Timestamp,
			},
			{
				id: "test-30min-8c",
				activity: "30-minutes-session",
				activityTimestamp: week8Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "probability-practice",
				practiceType: "layup",
				practiceLevel: "1",
				practiceDescription: "test practice",
				submittedAt: week8Timestamp,
			} as CompletedProbabilityPractice,
			{
				id: "test-30min-8d",
				activity: "30-minutes-session",
				activityTimestamp: week8Timestamp,
				attendanceId: "test-id",
				thirtyMinActivity: "buddy-training",
				thirtyMinExplanation: "test explanation",
				submittedAt: week8Timestamp,
			},
		];

		// Apply week 8 activities
		const stateAfterWeek8 = week8Activities.reduce(
			(currentState, activity) =>
				achievementReducer(currentState, activity, goalsMap),
			state,
		);

		// Verify state after week 8 - streaks should be 1 since goals are met
		expect(stateAfterWeek8.streaks.currentAttendanceStreak).toBe(1);
		expect(stateAfterWeek8.streaks.currentRunningStreak).toBe(1);
		expect(stateAfterWeek8.streaks.bestAttendanceStreak).toBe(1);
		expect(stateAfterWeek8.streaks.bestRunningStreak).toBe(1);
		expect(stateAfterWeek8.streaks.lastAttendanceStreakWeek).toBe("2024-8");
		expect(stateAfterWeek8.streaks.lastRunningStreakWeek).toBe("2024-8");

		// Add activity in week 11 - this should break streaks since week 9 and 10 had goals
		const week11Activity: CompletedEnduranceRun = {
			id: "test-run-11a",
			activity: "endurance-run",
			activityTimestamp: week11Timestamp,
			attendanceId: "test-id",
			laps: "8",
			minutes: "48",
			submittedAt: week11Timestamp,
		};

		const stateAfterWeek11 = achievementReducer(
			stateAfterWeek8,
			week11Activity,
			goalsMap,
		);

		// Verify that streaks are broken since week 9 and 10 had goals but no activities
		expect(stateAfterWeek11.streaks.currentAttendanceStreak).toBe(0);
		expect(stateAfterWeek11.streaks.currentRunningStreak).toBe(0);
		expect(stateAfterWeek11.streaks.bestAttendanceStreak).toBe(1);
		expect(stateAfterWeek11.streaks.bestRunningStreak).toBe(1);
		expect(stateAfterWeek11.streaks.lastAttendanceStreakWeek).toBe(null);
		expect(stateAfterWeek11.streaks.lastRunningStreakWeek).toBe(null);

		// Weekly activities should be reset for week 11
		expect(stateAfterWeek11.weeklyActivities).toEqual({
			enduranceRun: 1, // from the new activity
			personalTechnique: 0,
			probabilityPractice: 0,
			buddyTraining: 0,
		});

		// Week should be updated to week 11
		expect(stateAfterWeek11.currentWeek).toBe("2024-11");
	});
});
