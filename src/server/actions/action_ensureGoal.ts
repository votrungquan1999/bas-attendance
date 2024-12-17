"use server";

import { nanoid } from "nanoid";
import { WeeklyGoalsCollectionName, type WeekId } from "../collections";
import { WEEKLY_GOALS } from "../constants";
import getDB from "../db";

// if not found, create new one, using the constants weekly goals
export default async function action_ensureGoal(weekId: WeekId) {
	// check if weekId is valid
	// some example of valid weekId
	// "Example of valid weekId: 2024-W01, 2024-W02, 2024-W03, etc."
	if (!weekId.match(/^\d{4}-W\d{1,2}$/)) {
		throw new Error("Invalid weekId");
	}

	const { db, close } = await getDB();

	const weeklyGoals = await db
		.collection(WeeklyGoalsCollectionName)
		.findOne({ weekId });

	if (!weeklyGoals) {
		await db.collection(WeeklyGoalsCollectionName).insertOne({
			id: nanoid(),

			weekId,
			goals: WEEKLY_GOALS,

			updatedAt: Date.now(),
			updatedBy: "system",
		});
	}

	await close();
}
