/**
 * query_getAchievements.ts tests
 */

import { describe, it, expect, mock, afterAll } from "bun:test";
import query_getAchievements from "../query_getAchievements";
import type { ActivitiesCollectionDocument } from "src/server/collections";
import withTestContext, { cleanUp } from "src/helpers/withTestContext";
import { getMongoDB } from "src/server/withMongoDB";
import { DateTime } from "luxon";

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
			expect(result.bestPerformance).toEqual({
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
			expect(result.bestPerformance).toEqual({
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
			expect(result.bestPerformance).toEqual({
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
		"should handle non-consecutive weeks correctly",
		withTestContext(async () => {
			const db = getMongoDB();
			const activitiesCollection =
				db.collection<ActivitiesCollectionDocument>("activities");

			const now = Date.now();
			const oneWeek = 7 * 24 * 60 * 60 * 1000;

			const activities = [
				// Week 1 (current week)
				...generateWeekActivities("athlete1", now - oneWeek),
				// Skip a week
				// Week 3
				...generateWeekActivities("athlete1", now - 3 * oneWeek),
			] as ActivitiesCollectionDocument[];

			await activitiesCollection.insertMany(activities);

			const result = await query_getAchievements();

			expect(result.longestStreak).toEqual({
				weeks: 1,
				athleteName: "Test Athlete 1",
			});
			expect(result.topAttendance).toEqual([
				{
					id: "athlete1",
					name: "Test Athlete 1",
					weeks: 1,
				},
			]);
		}),
	);

	it(
		"should handle year transitions correctly",
		withTestContext(async () => {
			const db = getMongoDB();
			const activitiesCollection =
				db.collection<ActivitiesCollectionDocument>("activities");

			// Create timestamps for the last week of one year and first week of next year
			const lastWeekOfYear = DateTime.fromObject(
				{ year: 2023, month: 12, day: 28 },
				{ zone: "Asia/Saigon" },
			).toMillis();
			const firstWeekOfYear = DateTime.fromObject(
				{ year: 2024, month: 1, day: 4 },
				{ zone: "Asia/Saigon" },
			).toMillis();

			const activities = [
				// Last week of 2023
				...generateWeekActivities("athlete1", lastWeekOfYear),
				// First week of 2024
				...generateWeekActivities("athlete1", firstWeekOfYear),
			] as ActivitiesCollectionDocument[];

			await activitiesCollection.insertMany(activities);

			const result = await query_getAchievements();

			expect(result.longestStreak).toEqual({
				weeks: 2,
				athleteName: "Test Athlete 1",
			});
			expect(result.topAttendance).toEqual([
				{
					id: "athlete1",
					name: "Test Athlete 1",
					weeks: 2,
				},
			]);
		}),
	);

	it(
		"should handle incomplete activity sets correctly",
		withTestContext(async () => {
			const db = getMongoDB();
			const activitiesCollection =
				db.collection<ActivitiesCollectionDocument>("activities");

			const now = Date.now();
			const oneWeek = 7 * 24 * 60 * 60 * 1000;

			const activities = [
				// Week 1: Incomplete set (missing 1 personal-technique and endurance runs)
				{
					attendanceId: "athlete1",
					activity: "30-minutes-session",
					thirtyMinActivity: "personal-technique",
					activityTimestamp: now - oneWeek,
				},
				{
					attendanceId: "athlete1",
					activity: "30-minutes-session",
					thirtyMinActivity: "probability-practice",
					activityTimestamp: now - oneWeek,
				},
				{
					attendanceId: "athlete1",
					activity: "30-minutes-session",
					thirtyMinActivity: "buddy-training",
					activityTimestamp: now - oneWeek,
				},

				// Week 2: Complete set
				{
					attendanceId: "athlete1",
					activity: "30-minutes-session",
					thirtyMinActivity: "personal-technique",
					activityTimestamp: now - 2 * oneWeek,
				},
				{
					attendanceId: "athlete1",
					activity: "30-minutes-session",
					thirtyMinActivity: "personal-technique",
					activityTimestamp: now - 2 * oneWeek,
				},
				{
					attendanceId: "athlete1",
					activity: "30-minutes-session",
					thirtyMinActivity: "probability-practice",
					activityTimestamp: now - 2 * oneWeek,
				},
				{
					attendanceId: "athlete1",
					activity: "30-minutes-session",
					thirtyMinActivity: "buddy-training",
					activityTimestamp: now - 2 * oneWeek,
				},
			] as ActivitiesCollectionDocument[];

			await activitiesCollection.insertMany(activities);

			const result = await query_getAchievements();

			expect(result.longestStreak).toEqual({
				weeks: 1,
				athleteName: "Test Athlete 1",
			});
			expect(result.topAttendance).toEqual([
				{
					id: "athlete1",
					name: "Test Athlete 1",
					weeks: 1,
				},
			]);
		}),
	);

	it(
		"should handle invalid running data correctly",
		withTestContext(async () => {
			const db = getMongoDB();
			const activitiesCollection =
				db.collection<ActivitiesCollectionDocument>("activities");

			const now = Date.now();
			const activities = [
				{
					attendanceId: "athlete1",
					activity: "endurance-run",
					laps: "invalid",
					minutes: "30",
					activityTimestamp: now,
				},
				{
					attendanceId: "athlete2",
					activity: "endurance-run",
					laps: "8",
					minutes: "invalid",
					activityTimestamp: now,
				},
				{
					attendanceId: "athlete3",
					activity: "endurance-run",
					laps: "5", // Less than minimum 6 laps
					minutes: "30",
					activityTimestamp: now,
				},
			] as ActivitiesCollectionDocument[];

			await activitiesCollection.insertMany(activities);

			const result = await query_getAchievements();

			expect(result.bestPerformance).toEqual({
				minutesPerLap: 0,
				laps: 0,
				minutes: 0,
				athleteName: "Unknown",
			});
		}),
	);
});
