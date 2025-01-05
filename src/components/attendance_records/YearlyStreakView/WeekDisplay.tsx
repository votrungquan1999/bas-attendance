import { DateTime } from "luxon";
import type { WeekInfo } from "./types";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "src/shadcn/components/ui/popover";
import { CalendarDays, Loader2 } from "lucide-react";
import {
	WeekSquare,
	WeekPopoverHeader,
	WeekPopoverBody,
	WeekPopoverNumber,
	WeekPopoverCompletedBadge,
	WeekPopoverDateRange,
	WeekPopoverActivities,
	WeekPopoverActivitiesTitle,
} from "./YearlyStreakView.styled";
import query_getAthleteWeekCompletionStatus from "src/server/queries/query_getAthleteWeekCompletionStatus";
import { getWeekId } from "src/helpers/getWeekId";

export function LoadingSpinner() {
	return (
		<div className="w-5 h-5 rounded-sm relative border bg-gray-50 border-gray-200">
			<div className="absolute inset-0 flex items-center justify-center">
				<Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
			</div>
		</div>
	);
}

interface AttendanceRemainingGoals {
	personalTechnique: number;
	probabilityPractice: number;
	buddyTraining: number;
}

interface RunningRemainingGoals {
	enduranceRun: number;
}

interface WeekDisplayProps {
	week: WeekInfo;
	athleteId: string;
	type: "attendance" | "running";
}

function RemainingActivities({ children }: { children: React.ReactNode }) {
	return (
		<div className="space-y-2 text-sm text-gray-600">
			<div className="border-l-2 pl-2 border-orange-400">{children}</div>
		</div>
	);
}

function RemainingActivitiesSection({
	title,
	children,
}: {
	title?: string;
	children: React.ReactNode;
}) {
	return (
		<>
			{title && <div>{title}</div>}
			<div className={title ? "ml-4" : undefined}>{children}</div>
		</>
	);
}

function AttendanceRemainingActivities({
	goals,
}: { goals: AttendanceRemainingGoals }) {
	return (
		<RemainingActivities>
			<RemainingActivitiesSection title="30-Minutes Sessions:">
				<div>Personal Technique: {goals.personalTechnique} needed</div>
				<div>Probability Practice: {goals.probabilityPractice} needed</div>
				<div>Buddy Training: {goals.buddyTraining} needed</div>
			</RemainingActivitiesSection>
		</RemainingActivities>
	);
}

function RunningRemainingActivities({
	goals,
}: { goals: RunningRemainingGoals }) {
	return (
		<RemainingActivities>
			<div>Endurance Run: {goals.enduranceRun} needed</div>
		</RemainingActivities>
	);
}

interface WeekActivitiesProps {
	type: "attendance" | "running";
	hasNoGoal: boolean;
	isCompleted: boolean;
	remainingGoals: AttendanceRemainingGoals | RunningRemainingGoals;
}

function WeekActivities({
	type,
	hasNoGoal,
	isCompleted,
	remainingGoals,
}: WeekActivitiesProps) {
	if (hasNoGoal) {
		return <div className="text-gray-400">No goals set for this week</div>;
	}

	if (isCompleted) {
		return <div className="text-gray-600">All weekly goals completed</div>;
	}

	if (type === "attendance") {
		return (
			<AttendanceRemainingActivities
				goals={remainingGoals as AttendanceRemainingGoals}
			/>
		);
	}

	return (
		<RunningRemainingActivities
			goals={remainingGoals as RunningRemainingGoals}
		/>
	);
}

export async function WeekDisplay({ week, athleteId, type }: WeekDisplayProps) {
	const weekId = getWeekId(DateTime.fromMillis(week.startTimestamp));
	const status = await query_getAthleteWeekCompletionStatus(weekId, athleteId);

	const isCompleted =
		type === "attendance"
			? status.attendanceStatus.completed
			: status.runningStatus.completed;
	const hasNoGoal =
		type === "attendance"
			? status.attendanceStatus.hasNoGoal
			: status.runningStatus.hasNoGoal;
	const remainingGoals =
		type === "attendance"
			? status.attendanceStatus.remainingGoals
			: status.runningStatus.remainingGoals;

	const startDate = DateTime.fromMillis(week.startTimestamp);
	const endDate = DateTime.fromMillis(week.endTimestamp);

	return (
		<Popover>
			<PopoverTrigger>
				<WeekSquare isCompleted={isCompleted} hasNoGoal={hasNoGoal} />
			</PopoverTrigger>
			<PopoverContent className="w-80 p-0">
				<WeekPopoverHeader>
					<WeekPopoverNumber>
						<CalendarDays className="h-4 w-4 text-gray-500" />
						<span>Week {week.weekNumber}</span>
						{isCompleted && (
							<WeekPopoverCompletedBadge>Completed</WeekPopoverCompletedBadge>
						)}
					</WeekPopoverNumber>
					<WeekPopoverDateRange>
						{startDate.toFormat("MMMM d")} - {endDate.toFormat("MMMM d, yyyy")}
					</WeekPopoverDateRange>
				</WeekPopoverHeader>
				<WeekPopoverBody>
					<WeekPopoverActivities>
						<WeekPopoverActivitiesTitle>Activities</WeekPopoverActivitiesTitle>
						<WeekActivities
							type={type}
							hasNoGoal={hasNoGoal}
							isCompleted={isCompleted}
							remainingGoals={remainingGoals}
						/>
					</WeekPopoverActivities>
				</WeekPopoverBody>
			</PopoverContent>
		</Popover>
	);
}
