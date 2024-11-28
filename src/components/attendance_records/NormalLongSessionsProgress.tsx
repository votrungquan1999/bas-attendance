import type { CompletedActivity } from "src/app/attendance/activity/types";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "src/shadcn/components/ui/popover";
import GoalIndicator from "./GoalIndicator";
import ActivitySection from "./ActivitySection";

interface GroupedNormalSessions {
	trainNewbies: CompletedActivity[];
	trainWithCoach: CompletedActivity[];
	others: CompletedActivity[];
}

interface NormalSessionGoals {
	trainWithCoach: number;
	trainNewbies: number;
}

interface NormalSessionProgressProps {
	groupedActivities: GroupedNormalSessions;
	goals: NormalSessionGoals;
}

function Progress({ groupedActivities, goals }: NormalSessionProgressProps) {
	const totalCompleted =
		(groupedActivities.trainWithCoach.length >= goals.trainWithCoach ? 1 : 0) +
		(groupedActivities.trainNewbies.length >= goals.trainNewbies ? 1 : 0);

	const totalGoals = 2; // Train with coach and train newbies

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-1 text-sm hover:bg-gray-50 p-1 rounded"
				>
					<GoalIndicator current={totalCompleted} goal={totalGoals} />
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<span>Train with Coach</span>
						<GoalIndicator
							current={groupedActivities.trainWithCoach.length}
							goal={goals.trainWithCoach}
						/>
					</div>
					<div className="flex justify-between items-center">
						<span>Train Newbies</span>
						<GoalIndicator
							current={groupedActivities.trainNewbies.length}
							goal={goals.trainNewbies}
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export default function NormalLongSessionsProgress({
	groupedActivities,
	goals,
}: NormalSessionProgressProps) {
	const standardSessions = [
		...groupedActivities.trainNewbies,
		...groupedActivities.trainWithCoach,
	].sort((a, b) => b.submittedAt - a.submittedAt);

	return (
		<div className="border rounded-lg p-3">
			<div className="flex justify-between items-center mb-2 pb-2 border-b">
				<h3 className="text-lg font-medium text-purple-600">
					Normal Long Sessions
				</h3>
				<Progress groupedActivities={groupedActivities} goals={goals} />
			</div>
			<div className="space-y-3 max-h-[300px] overflow-y-auto">
				<ActivitySection
					activities={standardSessions}
					theme="normal-long-session"
				/>
				{groupedActivities.others.length > 0 && (
					<ActivitySection
						title="Other Activities"
						activities={groupedActivities.others}
						theme="normal-long-session"
					/>
				)}
			</div>
		</div>
	);
}
