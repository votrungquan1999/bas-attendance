import type { CompletedActivity } from "src/app/attendance/activity/types";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "src/shadcn/components/ui/popover";
import GoalIndicator from "./GoalIndicator";
import formatDate from "../../../../helpers/formatDate";
import getActivityDescription from "../../../../helpers/activities/getActivityDescription";

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
					<div className="font-medium">
						{totalCompleted}/{totalGoals}
					</div>
					<div
						className={
							totalCompleted === totalGoals
								? "text-green-500"
								: "text-yellow-500"
						}
					>
						({totalCompleted === totalGoals ? "Complete" : "In Progress"})
					</div>
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
	return (
		<div className="border rounded-lg p-3">
			<div className="flex justify-between items-center mb-2 pb-2 border-b">
				<h3 className="text-lg font-medium text-purple-600">
					Normal Long Sessions
				</h3>
				<Progress groupedActivities={groupedActivities} goals={goals} />
			</div>
			<div className="space-y-3 max-h-[300px] overflow-y-auto">
				{/* Standard Sessions */}
				{[
					...groupedActivities.trainNewbies,
					...groupedActivities.trainWithCoach,
				]
					.sort((a, b) => b.submittedAt - a.submittedAt)
					.map((activity) => (
						<div key={activity.attendanceId} className="bg-gray-50 p-2 rounded">
							<div className="text-sm font-medium text-purple-600 mb-1">
								{formatDate(activity.submittedAt)}
							</div>
							<div className="text-sm">{getActivityDescription(activity)}</div>
						</div>
					))}

				{/* Others */}
				{groupedActivities.others.length > 0 && (
					<div className="space-y-2">
						<h4 className="text-sm font-medium text-purple-500">
							Other Activities
						</h4>
						{groupedActivities.others.map((activity) => (
							<div
								key={activity.attendanceId}
								className="bg-gray-50 p-2 rounded"
							>
								<div className="text-sm font-medium text-purple-600 mb-1">
									{formatDate(activity.submittedAt)}
								</div>
								<div className="text-sm">
									{getActivityDescription(activity)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
