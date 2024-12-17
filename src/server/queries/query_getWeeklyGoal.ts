import { WeeklyGoalsCollectionName } from "../collections";
import getDB from "../db";
import type { WeekId } from "../collections";
import action_ensureGoal from "../actions/action_ensureGoal";

export default async function query_getWeeklyGoal(weekId: WeekId) {
	const { db, close } = await getDB();

	await action_ensureGoal(weekId);

	const weeklyGoals = await db
		.collection(WeeklyGoalsCollectionName)
		.findOne({ weekId });

	if (!weeklyGoals) {
		throw new Error("Weekly goals not found although ensureGoal was called");
	}

	await close();

	return weeklyGoals;
}
