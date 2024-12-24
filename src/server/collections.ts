import type { CompletedActivity, WeeklyGoals } from "src/server/types";
import type { Brand } from "utility-types";
import type { AchievementState } from "./queries/achievementReducer";

export type ActivitiesCollectionDocument = CompletedActivity;

export const ActivitiesCollectionName = "activities";

export const WeeklyGoalsCollectionName = "weekly_goals";

export const AchievementsCollectionName = "achievements";

export type WeeklyGoalsCollectionDocument = {
	id: string;

	// has form YYYY-W{weekNumber}
	weekId: WeekId;

	goals: WeeklyGoals;

	updatedAt: number;
	updatedBy: string;
};

export type AchievementCollectionDocument = {
	id: string;
	athleteId: string;
	state: AchievementState;
	lastActivityId: string | null;
	updatedAt: number;
};

export type WeekId = Brand<string, "WeekId">;
