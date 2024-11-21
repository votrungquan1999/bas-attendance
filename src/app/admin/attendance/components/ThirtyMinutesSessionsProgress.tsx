import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "src/shadcn/components/ui/popover";
import GoalIndicator from "./GoalIndicator";
import type { CompletedActivity } from "src/app/attendance/activity/types";
import formatDate from "../../../../helpers/formatDate";
import getActivityDescription from "src/helpers/activities/getActivityDescription";

interface GroupedThirtyMinSessions {
	probabilityPractice: CompletedActivity[];
	personalTechnique: CompletedActivity[];
	buddyTraining: CompletedActivity[];
}

interface ThirtyMinGoals {
	personalTechnique: number;
	probabilityPractice: number;
	buddyTraining: number;
}

interface ThirtyMinProgressProps {
	groupedActivities: GroupedThirtyMinSessions;
	goals: ThirtyMinGoals;
}

function Progress({ groupedActivities, goals }: ThirtyMinProgressProps) {
	const totalCompleted =
		(groupedActivities.probabilityPractice.length >= goals.probabilityPractice
			? 1
			: 0) +
		(groupedActivities.personalTechnique.length >= goals.personalTechnique
			? 1
			: 0) +
		(groupedActivities.buddyTraining.length >= goals.buddyTraining ? 1 : 0);

	const totalGoals = 3; // Total number of different activities

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
						<span>Probability Practice</span>
						<GoalIndicator
							current={groupedActivities.probabilityPractice.length}
							goal={goals.probabilityPractice}
						/>
					</div>
					<div className="flex justify-between items-center">
						<span>Personal Technique</span>
						<GoalIndicator
							current={groupedActivities.personalTechnique.length}
							goal={goals.personalTechnique}
						/>
					</div>
					<div className="flex justify-between items-center">
						<span>Buddy Training</span>
						<GoalIndicator
							current={groupedActivities.buddyTraining.length}
							goal={goals.buddyTraining}
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export default function ThirtyMinutesSessionsProgress({
	groupedActivities,
	goals,
}: ThirtyMinProgressProps) {
	return (
		<div className="border rounded-lg p-3">
			<div className="flex justify-between items-center mb-2 pb-2 border-b">
				<h3 className="text-lg font-medium text-blue-600">
					30 Minutes Sessions
				</h3>
				<Progress groupedActivities={groupedActivities} goals={goals} />
			</div>
			<div className="space-y-3 max-h-[300px] overflow-y-auto">
				{/* Probability Practice */}
				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<h4 className="text-sm font-medium text-blue-500">
							Probability Practice
						</h4>
					</div>
					{groupedActivities.probabilityPractice.map((activity) => (
						<div key={activity.attendanceId} className="bg-gray-50 p-2 rounded">
							<div className="text-sm font-medium text-blue-600 mb-1">
								{formatDate(activity.submittedAt)}
							</div>
							<div className="text-sm">{getActivityDescription(activity)}</div>
						</div>
					))}
				</div>

				{/* Personal Technique */}
				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<h4 className="text-sm font-medium text-blue-500">
							Personal Technique
						</h4>
					</div>
					{groupedActivities.personalTechnique.map((activity) => (
						<div key={activity.attendanceId} className="bg-gray-50 p-2 rounded">
							<div className="text-sm font-medium text-blue-600 mb-1">
								{formatDate(activity.submittedAt)}
							</div>
							<div className="text-sm">{getActivityDescription(activity)}</div>
						</div>
					))}
				</div>

				{/* Buddy Training */}
				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<h4 className="text-sm font-medium text-blue-500">
							Buddy Training
						</h4>
					</div>
					{groupedActivities.buddyTraining.map((activity) => (
						<div key={activity.attendanceId} className="bg-gray-50 p-2 rounded">
							<div className="text-sm font-medium text-blue-600 mb-1">
								{formatDate(activity.submittedAt)}
							</div>
							<div className="text-sm">{getActivityDescription(activity)}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
