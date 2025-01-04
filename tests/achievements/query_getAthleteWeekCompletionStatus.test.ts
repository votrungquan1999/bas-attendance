import { describe, test, expect, afterAll } from "bun:test";
import query_getAthleteWeekCompletionStatus from "../../src/server/queries/query_getAthleteWeekCompletionStatus";
import withTestContext, { cleanUp } from "../helpers/withTestContext";
import { getMongoDB } from "../../src/server/withMongoDB";
import {
	WeeklyGoalsCollectionName,
	type WeeklyGoalsCollectionDocument,
	type WeekId,
	ActivitiesCollectionName,
} from "../../src/server/collections";
import type {
	CompletedActivity,
	CompletedThirtyMinActivity,
	CompletedEnduranceRun,
} from "../../src/server/types";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";

// Test constants
const TEST_WEEK_KEY = "2024-W01" as WeekId;
const TEST_ATHLETE_ID = "athlete-1";

// Helper functions
async function setupWeeklyGoal(
	weekId: WeekId,
	goals: Partial<WeeklyGoalsCollectionDocument["goals"]> = {},
) {
	const defaultGoals = {
		thirtyMin: {
			personalTechnique: 0,
			probabilityPractice: 0,
			buddyTraining: 0,
		},
		enduranceRun: 0,
		normalSession: {
			trainWithCoach: 0,
			trainNewbies: 0,
		},
	};

	const weeklyGoal = {
		id: nanoid(),
		weekId,
		goals: { ...defaultGoals, ...goals },
		updatedAt: Date.now(),
		updatedBy: "test",
	};

	const db = getMongoDB();
	await db
		.collection<WeeklyGoalsCollectionDocument>(WeeklyGoalsCollectionName)
		.insertOne(weeklyGoal);

	return weeklyGoal;
}

async function createActivity(
	type: "30-minutes-session" | "endurance-run",
	athleteId: string,
	timestamp: number,
	additionalProps: Partial<CompletedActivity> = {},
): Promise<CompletedActivity> {
	const base = {
		id: nanoid(),
		attendanceId: athleteId,
		activity: type,
		activityTimestamp: timestamp,
		submittedAt: Date.now(),
	};

	let activity: CompletedActivity;
	if (type === "30-minutes-session") {
		activity = {
			...base,
			thirtyMinActivity: "personal-technique",
			thirtyMinExplanation: "test explanation",
			...additionalProps,
		} as CompletedThirtyMinActivity;
	} else {
		activity = {
			...base,
			laps: "8",
			minutes: "48",
			...additionalProps,
		} as CompletedEnduranceRun;
	}

	const db = getMongoDB();
	await db
		.collection<CompletedActivity>(ActivitiesCollectionName)
		.insertOne(activity);

	return activity;
}

afterAll(async () => {
	await cleanUp();
});

describe("query_getAthleteWeekCompletionStatus", () => {
	test(
		"should return week completion status with correct shape",
		withTestContext(async () => {
			// Insert default weekly goal
			await setupWeeklyGoal(TEST_WEEK_KEY);

			const result = await query_getAthleteWeekCompletionStatus(
				TEST_WEEK_KEY,
				TEST_ATHLETE_ID,
			);

			expect(result).toHaveProperty("weekKey");
			expect(result).toHaveProperty("attendanceStatus");
			expect(result.attendanceStatus).toHaveProperty("hasNoGoal");
			expect(result.attendanceStatus).toHaveProperty("completed");
			expect(result.attendanceStatus).toHaveProperty("remainingGoals");
			expect(result.attendanceStatus.remainingGoals).toHaveProperty(
				"personalTechnique",
			);
			expect(result.attendanceStatus.remainingGoals).toHaveProperty(
				"probabilityPractice",
			);
			expect(result.attendanceStatus.remainingGoals).toHaveProperty(
				"buddyTraining",
			);

			expect(result).toHaveProperty("runningStatus");
			expect(result.runningStatus).toHaveProperty("hasNoGoal");
			expect(result.runningStatus).toHaveProperty("completed");
			expect(result.runningStatus.remainingGoals).toHaveProperty(
				"enduranceRun",
			);
		}),
	);

	test(
		"should return hasNoGoal true when no goals are set for the week",
		withTestContext(async () => {
			await setupWeeklyGoal(TEST_WEEK_KEY);

			const result = await query_getAthleteWeekCompletionStatus(
				TEST_WEEK_KEY,
				TEST_ATHLETE_ID,
			);

			expect(result.weekKey).toBe(TEST_WEEK_KEY);
			expect(result.attendanceStatus.hasNoGoal).toBe(true);
			expect(result.runningStatus.hasNoGoal).toBe(true);
		}),
	);

	test(
		"should calculate remaining goals correctly when activities are completed",
		withTestContext(async () => {
			const weekStart = DateTime.fromISO(TEST_WEEK_KEY)
				.setZone("Asia/Saigon")
				.startOf("week");

			// Insert weekly goals
			await setupWeeklyGoal(TEST_WEEK_KEY, {
				thirtyMin: {
					personalTechnique: 2,
					probabilityPractice: 1,
					buddyTraining: 1,
				},
				enduranceRun: 2,
			});

			// Insert activities within the week
			await Promise.all([
				createActivity(
					"30-minutes-session",
					TEST_ATHLETE_ID,
					weekStart.toMillis(),
				),
				createActivity("endurance-run", TEST_ATHLETE_ID, weekStart.toMillis()),
			]);

			// Insert activities outside the week range
			await Promise.all([
				createActivity(
					"30-minutes-session",
					TEST_ATHLETE_ID,
					weekStart.minus({ days: 1 }).toMillis(),
				),
				createActivity(
					"endurance-run",
					TEST_ATHLETE_ID,
					weekStart.plus({ days: 7 }).toMillis(),
				),
			]);

			const result = await query_getAthleteWeekCompletionStatus(
				TEST_WEEK_KEY,
				TEST_ATHLETE_ID,
			);

			expect(result.weekKey).toBe(TEST_WEEK_KEY);
			expect(result.attendanceStatus.hasNoGoal).toBe(false);
			expect(result.attendanceStatus.completed).toBe(false);
			expect(result.attendanceStatus.remainingGoals).toEqual({
				personalTechnique: 1, // 2 required - 1 completed
				probabilityPractice: 1, // 1 required - 0 completed
				buddyTraining: 1, // 1 required - 0 completed
			});

			expect(result.runningStatus.hasNoGoal).toBe(false);
			expect(result.runningStatus.completed).toBe(false);
			expect(result.runningStatus.remainingGoals).toEqual({
				enduranceRun: 1, // 2 required - 1 completed
			});
		}),
	);

	test(
		"should mark status as completed when all goals are met",
		withTestContext(async () => {
			const weekStart = DateTime.fromISO(TEST_WEEK_KEY)
				.setZone("Asia/Saigon")
				.startOf("week");

			// Insert weekly goals
			await setupWeeklyGoal(TEST_WEEK_KEY, {
				thirtyMin: {
					personalTechnique: 2,
					probabilityPractice: 1,
					buddyTraining: 1,
				},
				enduranceRun: 2,
			});

			// Insert all required activities
			await Promise.all([
				// Personal Technique (2 required)
				createActivity(
					"30-minutes-session",
					TEST_ATHLETE_ID,
					weekStart.toMillis(),
					{
						thirtyMinActivity: "personal-technique",
					},
				),
				createActivity(
					"30-minutes-session",
					TEST_ATHLETE_ID,
					weekStart.plus({ hours: 1 }).toMillis(),
					{
						thirtyMinActivity: "personal-technique",
					},
				),
				// Probability Practice (1 required)
				createActivity(
					"30-minutes-session",
					TEST_ATHLETE_ID,
					weekStart.plus({ hours: 2 }).toMillis(),
					{
						thirtyMinActivity: "probability-practice",
					},
				),
				// Buddy Training (1 required)
				createActivity(
					"30-minutes-session",
					TEST_ATHLETE_ID,
					weekStart.plus({ hours: 3 }).toMillis(),
					{
						thirtyMinActivity: "buddy-training",
					},
				),
				// Endurance Runs (2 required)
				createActivity(
					"endurance-run",
					TEST_ATHLETE_ID,
					weekStart.plus({ hours: 4 }).toMillis(),
				),
				createActivity(
					"endurance-run",
					TEST_ATHLETE_ID,
					weekStart.plus({ hours: 5 }).toMillis(),
				),
			]);

			const result = await query_getAthleteWeekCompletionStatus(
				TEST_WEEK_KEY,
				TEST_ATHLETE_ID,
			);

			expect(result.weekKey).toBe(TEST_WEEK_KEY);
			expect(result.attendanceStatus.hasNoGoal).toBe(false);
			expect(result.attendanceStatus.completed).toBe(true);
			expect(result.attendanceStatus.remainingGoals).toEqual({
				personalTechnique: 0,
				probabilityPractice: 0,
				buddyTraining: 0,
			});

			expect(result.runningStatus.hasNoGoal).toBe(false);
			expect(result.runningStatus.completed).toBe(true);
			expect(result.runningStatus.remainingGoals).toEqual({
				enduranceRun: 0,
			});
		}),
	);

	test(
		"should not count activities from other athletes",
		withTestContext(async () => {
			const weekStart = DateTime.fromISO(TEST_WEEK_KEY)
				.setZone("Asia/Saigon")
				.startOf("week");
			const otherAthleteId = "other-athlete";

			// Insert weekly goals
			await setupWeeklyGoal(TEST_WEEK_KEY, {
				thirtyMin: {
					personalTechnique: 1,
					probabilityPractice: 1,
					buddyTraining: 1,
				},
				enduranceRun: 1,
			});

			// Insert activities for other athlete
			await Promise.all([
				createActivity(
					"30-minutes-session",
					otherAthleteId,
					weekStart.toMillis(),
					{
						thirtyMinActivity: "personal-technique",
					},
				),
				createActivity(
					"30-minutes-session",
					otherAthleteId,
					weekStart.plus({ hours: 1 }).toMillis(),
					{
						thirtyMinActivity: "probability-practice",
					},
				),
				createActivity(
					"30-minutes-session",
					otherAthleteId,
					weekStart.plus({ hours: 2 }).toMillis(),
					{
						thirtyMinActivity: "buddy-training",
					},
				),
				createActivity(
					"endurance-run",
					otherAthleteId,
					weekStart.plus({ hours: 3 }).toMillis(),
				),
			]);

			// Insert one activity for test athlete
			await createActivity(
				"30-minutes-session",
				TEST_ATHLETE_ID,
				weekStart.toMillis(),
				{
					thirtyMinActivity: "personal-technique",
				},
			);

			const result = await query_getAthleteWeekCompletionStatus(
				TEST_WEEK_KEY,
				TEST_ATHLETE_ID,
			);

			expect(result.weekKey).toBe(TEST_WEEK_KEY);
			expect(result.attendanceStatus.hasNoGoal).toBe(false);
			expect(result.attendanceStatus.completed).toBe(false);
			expect(result.attendanceStatus.remainingGoals).toEqual({
				personalTechnique: 0, // 1 required - 1 completed
				probabilityPractice: 1, // 1 required - 0 completed
				buddyTraining: 1, // 1 required - 0 completed
			});

			expect(result.runningStatus.hasNoGoal).toBe(false);
			expect(result.runningStatus.completed).toBe(false);
			expect(result.runningStatus.remainingGoals).toEqual({
				enduranceRun: 1, // 1 required - 0 completed
			});
		}),
	);

	test(
		"should handle more activities than required goals",
		withTestContext(async () => {
			const weekStart = DateTime.fromISO(TEST_WEEK_KEY)
				.setZone("Asia/Saigon")
				.startOf("week");

			// Insert weekly goals with small requirements
			await setupWeeklyGoal(TEST_WEEK_KEY, {
				thirtyMin: {
					personalTechnique: 1,
					probabilityPractice: 1,
					buddyTraining: 1,
				},
				enduranceRun: 1,
			});

			// Insert more activities than required
			await Promise.all([
				// Personal Technique (1 required, adding 3)
				createActivity(
					"30-minutes-session",
					TEST_ATHLETE_ID,
					weekStart.toMillis(),
					{
						thirtyMinActivity: "personal-technique",
					},
				),
				createActivity(
					"30-minutes-session",
					TEST_ATHLETE_ID,
					weekStart.plus({ hours: 1 }).toMillis(),
					{
						thirtyMinActivity: "personal-technique",
					},
				),
				createActivity(
					"30-minutes-session",
					TEST_ATHLETE_ID,
					weekStart.plus({ hours: 2 }).toMillis(),
					{
						thirtyMinActivity: "personal-technique",
					},
				),
				// Probability Practice (1 required, adding 2)
				createActivity(
					"30-minutes-session",
					TEST_ATHLETE_ID,
					weekStart.plus({ hours: 3 }).toMillis(),
					{
						thirtyMinActivity: "probability-practice",
					},
				),
				createActivity(
					"30-minutes-session",
					TEST_ATHLETE_ID,
					weekStart.plus({ hours: 4 }).toMillis(),
					{
						thirtyMinActivity: "probability-practice",
					},
				),
				// Buddy Training (1 required, adding 2)
				createActivity(
					"30-minutes-session",
					TEST_ATHLETE_ID,
					weekStart.plus({ hours: 5 }).toMillis(),
					{
						thirtyMinActivity: "buddy-training",
					},
				),
				createActivity(
					"30-minutes-session",
					TEST_ATHLETE_ID,
					weekStart.plus({ hours: 6 }).toMillis(),
					{
						thirtyMinActivity: "buddy-training",
					},
				),
				// Endurance Runs (1 required, adding 3)
				createActivity(
					"endurance-run",
					TEST_ATHLETE_ID,
					weekStart.plus({ hours: 7 }).toMillis(),
				),
				createActivity(
					"endurance-run",
					TEST_ATHLETE_ID,
					weekStart.plus({ hours: 8 }).toMillis(),
				),
				createActivity(
					"endurance-run",
					TEST_ATHLETE_ID,
					weekStart.plus({ hours: 9 }).toMillis(),
				),
			]);

			const result = await query_getAthleteWeekCompletionStatus(
				TEST_WEEK_KEY,
				TEST_ATHLETE_ID,
			);

			expect(result.weekKey).toBe(TEST_WEEK_KEY);
			expect(result.attendanceStatus.hasNoGoal).toBe(false);
			expect(result.attendanceStatus.completed).toBe(true);
			expect(result.attendanceStatus.remainingGoals).toEqual({
				personalTechnique: 0, // 1 required - 3 completed
				probabilityPractice: 0, // 1 required - 2 completed
				buddyTraining: 0, // 1 required - 2 completed
			});

			expect(result.runningStatus.hasNoGoal).toBe(false);
			expect(result.runningStatus.completed).toBe(true);
			expect(result.runningStatus.remainingGoals).toEqual({
				enduranceRun: 0, // 1 required - 3 completed
			});
		}),
	);

	test(
		"should use cached status when available and no new activities",
		withTestContext(async () => {
			const weekStart = DateTime.fromISO(TEST_WEEK_KEY)
				.setZone("Asia/Saigon")
				.startOf("week");

			// Insert weekly goals
			await setupWeeklyGoal(TEST_WEEK_KEY, {
				thirtyMin: {
					personalTechnique: 1,
					probabilityPractice: 1,
					buddyTraining: 1,
				},
				enduranceRun: 1,
			});

			// Insert one activity
			await createActivity(
				"30-minutes-session",
				TEST_ATHLETE_ID,
				weekStart.toMillis(),
				{
					thirtyMinActivity: "personal-technique",
				},
			);

			// First call should calculate and cache
			const firstResult = await query_getAthleteWeekCompletionStatus(
				TEST_WEEK_KEY,
				TEST_ATHLETE_ID,
			);

			// Second call should use cache
			const secondResult = await query_getAthleteWeekCompletionStatus(
				TEST_WEEK_KEY,
				TEST_ATHLETE_ID,
			);

			expect(secondResult).toEqual(firstResult);
		}),
	);

	test(
		"should recalculate status when new activities are added",
		withTestContext(async () => {
			const weekStart = DateTime.fromISO(TEST_WEEK_KEY)
				.setZone("Asia/Saigon")
				.startOf("week");

			// Insert weekly goals
			await setupWeeklyGoal(TEST_WEEK_KEY, {
				thirtyMin: {
					personalTechnique: 2,
					probabilityPractice: 0,
					buddyTraining: 0,
				},
				enduranceRun: 0,
			});

			// Insert first activity
			await createActivity(
				"30-minutes-session",
				TEST_ATHLETE_ID,
				weekStart.toMillis(),
				{
					thirtyMinActivity: "personal-technique",
				},
			);

			// First call should calculate and cache
			const firstResult = await query_getAthleteWeekCompletionStatus(
				TEST_WEEK_KEY,
				TEST_ATHLETE_ID,
			);

			expect(
				firstResult.attendanceStatus.remainingGoals.personalTechnique,
			).toBe(1);

			// Add another activity
			await createActivity(
				"30-minutes-session",
				TEST_ATHLETE_ID,
				weekStart.plus({ hours: 1 }).toMillis(),
				{
					thirtyMinActivity: "personal-technique",
				},
			);

			// Second call should recalculate
			const secondResult = await query_getAthleteWeekCompletionStatus(
				TEST_WEEK_KEY,
				TEST_ATHLETE_ID,
			);

			expect(
				secondResult.attendanceStatus.remainingGoals.personalTechnique,
			).toBe(0);
		}),
	);
});
