import type { CompletedActivity, WeeklyGoals } from "src/server/types";
import type { Brand } from "utility-types";

export type ActivitiesCollection = CompletedActivity;

export const ActivitiesCollectionName = "activities";

export const WeeklyGoalsCollectionName = "weekly_goals";

export type WeeklyGoalsCollection = {
	id: string;

	// has form YYYY-W{weekNumber}
	weekId: WeekId;

	goals: WeeklyGoals;

	updatedAt: number;
	updatedBy: string;
};

export type WeekId = Brand<string, "WeekId">;
