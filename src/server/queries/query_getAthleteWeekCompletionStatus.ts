import type { WeekId } from "../collections";
import { dataLoaders } from "../dataloaders";

export interface WeekCompletionStatus {
	weekKey: string;
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
}

export default async function query_getAthleteWeekCompletionStatus(
	weekKey: WeekId,
	athleteId: string,
): Promise<WeekCompletionStatus> {
	const status = await dataLoaders.weekCompletionStatus.load({
		weekId: weekKey,
		athleteId,
	});

	return {
		weekKey,
		attendanceStatus: status.attendanceStatus,
		runningStatus: status.runningStatus,
	};
}
