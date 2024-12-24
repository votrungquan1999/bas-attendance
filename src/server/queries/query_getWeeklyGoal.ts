import { WeeklyGoalsCollectionName } from "../collections";
import type { WeekId } from "../collections";
import action_ensureGoal from "../actions/action_ensureGoal";
import { getMongoDB, injectMongoDB } from "../withMongoDB";

export default injectMongoDB(async function query_getWeeklyGoal(
	weekId: WeekId,
) {
	const db = getMongoDB();

	await action_ensureGoal(weekId);

	const weeklyGoals = await db
		.collection(WeeklyGoalsCollectionName)
		.findOne({ weekId });

	if (!weeklyGoals) {
		throw new Error("Weekly goals not found although ensureGoal was called");
	}

	return weeklyGoals;
});
