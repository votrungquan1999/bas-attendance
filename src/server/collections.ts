import type { CompletedActivity, WeeklyGoals } from "src/server/types";
import type { Brand } from "utility-types";
import type { AchievementState } from "./queries/achievementReducer";

export type ActivitiesCollectionDocument = CompletedActivity;

export const ActivitiesCollectionName = "activities";

export const WeeklyGoalsCollectionName = "weekly_goals";

export const AchievementsCollectionName = "achievements";

export const WeekCompletionStatusCollectionName = "week_completion_status";

export interface WeekCompletionStatusCollectionDocument {
	id: string;
	weekId: WeekId;
	athleteId: string;
	attendanceStatus: {
		hasNoGoal: boolean;
		completed: boolean;
		remainingGoals: {
			personalTechnique: number;
			probabilityPractice: number;
			buddyTraining: number;
		};
	};
	runningStatus: {
		hasNoGoal: boolean;
		completed: boolean;
		remainingGoals: {
			enduranceRun: number;
		};
	};
	lastUpdatedAt: number;
}

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

// Summer Practices Collection
export const SummerPracticesCollectionName = "summer_practices";

export type SummerPracticesCollectionDocument = {
	id: string;
	// date is in format: "YYYY-MM-DD" (e.g., "2024-07-15")
	date: string;
	attendance_data: {
		athletes: SummerAttendanceRecord[];
	};
	created_at: number;
	updated_at: number;
};

export type BusySummerAttendanceRecord = {
	athlete_id: string;
	registered: false;
	reason: string;
};

export type ShowedSummerAttendanceRecord = {
	athlete_id: string;
	registered: true;
	showed: true;
	tracking: {
		late: boolean;
		leave_early: boolean;
	};
};

export type NoShowSummerAttendanceRecord = {
	athlete_id: string;
	registered: true;
	showed: false;
};

export type SummerAttendanceRecord =
	| BusySummerAttendanceRecord
	| ShowedSummerAttendanceRecord
	| NoShowSummerAttendanceRecord;
