"use server";

import type { WeeklyGoals } from "../types";
import {
	WeeklyGoalsCollectionName,
	type WeekId,
	type WeeklyGoalsCollectionDocument,
} from "../collections";
import getDB from "../db";
import { revalidateTag } from "next/cache";

export async function action_saveWeeklyGoal(
	goals: WeeklyGoals,
	weekId: WeekId,
) {
	const { db, close } = await getDB();

	await db
		.collection<WeeklyGoalsCollectionDocument>(WeeklyGoalsCollectionName)
		.updateOne(
			{ weekId },
			{ $set: { goals, updatedAt: Date.now(), updatedBy: "system" } },
		);

	await close();

	revalidateTag("achievement_aggregation");
}
