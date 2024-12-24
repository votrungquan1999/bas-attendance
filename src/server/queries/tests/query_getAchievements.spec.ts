/**
 * query_getAchievements.ts tests
 */

import { describe, it, expect, mock, afterAll } from "bun:test";
import query_getAchievements from "../query_getAchievements";
import type { ActivitiesCollectionDocument } from "src/server/collections";
import withTestContext, { cleanUp } from "src/helpers/withTestContext";
import { getMongoDB } from "src/server/withMongoDB";

mock.module(
	"src/app/admin/attendance/by-week/query_getEligibleAthletes",
	() => ({
		default: async () => [
			{
				id: "athlete1",
				value: "Test Athlete 1",
			},
			{
				id: "athlete2",
				value: "Test Athlete 2",
			},
			{
				id: "athlete3",
				value: "Test Athlete 3",
			},
		],
	}),
);

describe("query_getAchievements", () => {
	afterAll(async () => {
		await cleanUp();
	});

	const generateWeekActivities = (
		athleteId: string,
		timestamp: number,
		includeRun = true,
	) => [
		// Personal Technique (2 required)
		{
			attendanceId: athleteId,
			activity: "30-minutes-session",
			thirtyMinActivity: "personal-technique",
			activityTimestamp: timestamp,
		},
		{
			attendanceId: athleteId,
			activity: "30-minutes-session",
			thirtyMinActivity: "personal-technique",
			activityTimestamp: timestamp,
		},
		// Probability Practice (1 required)
		{
			attendanceId: athleteId,
			activity: "30-minutes-session",
			thirtyMinActivity: "probability-practice",
			activityTimestamp: timestamp,
		},
		// Buddy Training (1 required)
		{
			attendanceId: athleteId,
			activity: "30-minutes-session",
			thirtyMinActivity: "buddy-training",
			activityTimestamp: timestamp,
		},
		...(includeRun
			? [
					// Endurance Run (2 required)
					{
						attendanceId: athleteId,
						activity: "endurance-run",
						laps: "8",
						minutes: "48",
						activityTimestamp: timestamp,
					},
					{
						attendanceId: athleteId,
						activity: "endurance-run",
						laps: "8",
						minutes: "48",
						activityTimestamp: timestamp,
					},
				]
			: []),
	];

	it(
		"should calculate achievements with basic sample data",
		withTestContext(async () => {
			const db = getMongoDB();
			const activitiesCollection =
				db.collection<ActivitiesCollectionDocument>("activities");

			const sampleData = [
				// Personal Technique (2 required)
				{
					attendanceId: "athlete1",
					activity: "30-minutes-session",
					thirtyMinActivity: "personal-technique",
					activityTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
				},
				{
					attendanceId: "athlete1",
					activity: "30-minutes-session",
					thirtyMinActivity: "personal-technique",
					activityTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
				},
				// Probability Practice (1 required)
				{
					attendanceId: "athlete1",
					activity: "30-minutes-session",
					thirtyMinActivity: "probability-practice",
					activityTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
				},
				// Buddy Training (1 required)
				{
					attendanceId: "athlete1",
					activity: "30-minutes-session",
					thirtyMinActivity: "buddy-training",
					activityTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
				},
				// Endurance Run (2 required)
				{
					attendanceId: "athlete1",
					activity: "endurance-run",
					laps: "8",
					minutes: "48",
					activityTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
				},
				{
					attendanceId: "athlete1",
					activity: "endurance-run",
					laps: "8",
					minutes: "48",
					activityTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
				},
			] as ActivitiesCollectionDocument[];

			await activitiesCollection.insertMany(sampleData);

			const result = await query_getAchievements();

			expect(result.longestStreak).toEqual({
				weeks: 1,
				athleteName: "Test Athlete 1",
			});
			expect(result.runningStreak).toEqual({
				weeks: 1,
				athleteName: "Test Athlete 1",
			});
			expect(result.bestPerformance).toMatchObject({
				minutesPerLap: 6,
				laps: 8,
				minutes: 48,
				athleteName: "Test Athlete 1",
			});
			expect(result.topAttendance).toEqual([
				{
					id: "athlete1",
					name: "Test Athlete 1",
					weeks: 1,
				},
			]);
			expect(result.topRunning).toEqual([
				{
					id: "athlete1",
					name: "Test Athlete 1",
					weeks: 1,
				},
			]);
		}),
	);

	it(
		"should handle multiple athletes with different achievements",
		withTestContext(async () => {
			const db = getMongoDB();
			const activitiesCollection =
				db.collection<ActivitiesCollectionDocument>("activities");

			const now = Date.now();
			const oneWeek = 7 * 24 * 60 * 60 * 1000;

			const activities = [
				// Athlete 1: 2 weeks streak with complete activities
				...generateWeekActivities("athlete1", now - oneWeek),
				...generateWeekActivities("athlete1", now - 2 * oneWeek),

				// Athlete 2: 3 weeks streak
				...generateWeekActivities("athlete2", now - oneWeek),
				...generateWeekActivities("athlete2", now - 2 * oneWeek),
				...generateWeekActivities("athlete2", now - 3 * oneWeek),

				// Athlete 3: 1 week with no running
				...generateWeekActivities("athlete3", now - oneWeek, false),
			] as ActivitiesCollectionDocument[];

			await activitiesCollection.insertMany(activities);

			const result = await query_getAchievements();

			expect(result.longestStreak).toEqual({
				weeks: 3,
				athleteName: "Test Athlete 2",
			});
			expect(result.runningStreak).toEqual({
				weeks: 3,
				athleteName: "Test Athlete 2",
			});
			expect(result.bestPerformance).toMatchObject({
				minutesPerLap: 6,
				laps: 8,
				minutes: 48,
				athleteName: "Test Athlete 1",
			});
			expect(result.topAttendance).toEqual([
				{
					id: "athlete2",
					name: "Test Athlete 2",
					weeks: 3,
				},
				{
					id: "athlete1",
					name: "Test Athlete 1",
					weeks: 2,
				},
				{
					id: "athlete3",
					name: "Test Athlete 3",
					weeks: 1,
				},
			]);
			expect(result.topRunning).toEqual([
				{
					id: "athlete2",
					name: "Test Athlete 2",
					weeks: 3,
				},
				{
					id: "athlete1",
					name: "Test Athlete 1",
					weeks: 2,
				},
			]);
		}),
	);

	it(
		"should handle empty activities",
		withTestContext(async () => {
			const result = await query_getAchievements();

			expect(result.longestStreak).toEqual({
				weeks: 0,
				athleteName: "Unknown",
			});
			expect(result.runningStreak).toEqual({
				weeks: 0,
				athleteName: "Unknown",
			});
			expect(result.bestPerformance).toMatchObject({
				minutesPerLap: 0,
				laps: 0,
				minutes: 0,
				athleteName: "Unknown",
			});
			expect(result.topAttendance).toEqual([]);
			expect(result.topRunning).toEqual([]);
		}),
	);

	it(
		"should handle multiple athletes with different running performances",
		withTestContext(async () => {
			const db = getMongoDB();
			const activitiesCollection =
				db.collection<ActivitiesCollectionDocument>("activities");

			const now = Date.now();
			const activities = [
				// Athlete 1: 8 laps in 48 minutes (6 min/lap)
				{
					attendanceId: "athlete1",
					activity: "endurance-run",
					laps: "8",
					minutes: "48",
					activityTimestamp: now,
				},
				// Athlete 2: 10 laps in 55 minutes (5.5 min/lap - better performance)
				{
					attendanceId: "athlete2",
					activity: "endurance-run",
					laps: "10",
					minutes: "55",
					activityTimestamp: now,
				},
				// Athlete 3: 6 laps in 42 minutes (7 min/lap)
				{
					attendanceId: "athlete3",
					activity: "endurance-run",
					laps: "6",
					minutes: "42",
					activityTimestamp: now,
				},
			] as ActivitiesCollectionDocument[];

			await activitiesCollection.insertMany(activities);

			const result = await query_getAchievements();

			expect(result.bestPerformance).toMatchObject({
				minutesPerLap: 5.5,
				laps: 10,
				minutes: 55,
				athleteName: "Test Athlete 2",
			});
		}),
	);

	it(
		"should handle multiple athletes with overlapping streaks",
		withTestContext(async () => {
			const db = getMongoDB();
			const activitiesCollection =
				db.collection<ActivitiesCollectionDocument>("activities");

			const now = Date.now();
			const oneWeek = 7 * 24 * 60 * 60 * 1000;

			const activities = [
				// Athlete 1: 2 consecutive weeks
				...generateWeekActivities("athlete1", now),
				...generateWeekActivities("athlete1", now - oneWeek),

				// Athlete 2: 3 consecutive weeks
				...generateWeekActivities("athlete2", now),
				...generateWeekActivities("athlete2", now - oneWeek),
				...generateWeekActivities("athlete2", now - 2 * oneWeek),

				// Athlete 3: 1 week only
				...generateWeekActivities("athlete3", now),
			] as ActivitiesCollectionDocument[];

			await activitiesCollection.insertMany(activities);

			const result = await query_getAchievements();

			expect(result.longestStreak).toEqual({
				weeks: 3,
				athleteName: "Test Athlete 2",
			});
			expect(result.runningStreak).toEqual({
				weeks: 3,
				athleteName: "Test Athlete 2",
			});
			expect(result.topAttendance).toEqual([
				{
					id: "athlete2",
					name: "Test Athlete 2",
					weeks: 3,
				},
				{
					id: "athlete1",
					name: "Test Athlete 1",
					weeks: 2,
				},
				{
					id: "athlete3",
					name: "Test Athlete 3",
					weeks: 1,
				},
			]);
			expect(result.topRunning).toEqual([
				{
					id: "athlete2",
					name: "Test Athlete 2",
					weeks: 3,
				},
				{
					id: "athlete1",
					name: "Test Athlete 1",
					weeks: 2,
				},
				{
					id: "athlete3",
					name: "Test Athlete 3",
					weeks: 1,
				},
			]);
		}),
	);

	it(
		"should handle multiple athletes with different activity types",
		withTestContext(async () => {
			const db = getMongoDB();
			const activitiesCollection =
				db.collection<ActivitiesCollectionDocument>("activities");

			const now = Date.now();

			const activities = [
				// Athlete 1: Complete set with running
				...generateWeekActivities("athlete1", now),

				// Athlete 2: Complete set without running
				...generateWeekActivities("athlete2", now, false),

				// Athlete 3: Only running activities
				{
					attendanceId: "athlete3",
					activity: "endurance-run",
					laps: "8",
					minutes: "48",
					activityTimestamp: now,
				},
				{
					attendanceId: "athlete3",
					activity: "endurance-run",
					laps: "8",
					minutes: "48",
					activityTimestamp: now,
				},
			] as ActivitiesCollectionDocument[];

			await activitiesCollection.insertMany(activities);

			const result = await query_getAchievements();

			expect(result.topAttendance).toEqual([
				{
					id: "athlete1",
					name: "Test Athlete 1",
					weeks: 1,
				},
				{
					id: "athlete2",
					name: "Test Athlete 2",
					weeks: 1,
				},
			]);
			expect(result.topRunning).toEqual([
				{
					id: "athlete1",
					name: "Test Athlete 1",
					weeks: 1,
				},
				{
					id: "athlete3",
					name: "Test Athlete 3",
					weeks: 1,
				},
			]);
			expect(result.bestPerformance).toMatchObject({
				minutesPerLap: 6,
				laps: 8,
				minutes: 48,
				athleteName: "Test Athlete 1",
			});
		}),
	);
});
