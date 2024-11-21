import type { CompletedActivity } from "src/app/attendance/activity/types";
import GoalIndicator from "./GoalIndicator";
import ActivitySection from "./ActivitySection";

interface EnduranceRunsProgressProps {
	activities: CompletedActivity[];
	goal: number;
}

export default function EnduranceRunsProgress({
	activities,
	goal,
}: EnduranceRunsProgressProps) {
	return (
		<div className="border rounded-lg p-3">
			<div className="flex justify-between items-center mb-2 pb-2 border-b">
				<h3 className="text-lg font-medium text-green-600">Endurance Runs</h3>
				<GoalIndicator current={activities.length} goal={goal} />
			</div>
			<div className="space-y-2 max-h-[300px] overflow-y-auto">
				<ActivitySection activities={activities} theme="endurance-run" />
			</div>
		</div>
	);
}
