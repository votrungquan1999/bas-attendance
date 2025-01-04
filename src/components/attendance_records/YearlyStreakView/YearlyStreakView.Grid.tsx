import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "src/shadcn/components/ui/popover";
import { CalendarDays } from "lucide-react";
import { DateTime } from "luxon";
import { cn } from "src/shadcn/lib/utils";
import {
	WeekSquare,
	WeekPopoverHeader,
	WeekPopoverBody,
	WeekPopoverNumber,
	WeekPopoverCompletedBadge,
	WeekPopoverDateRange,
	WeekPopoverActivities,
	WeekPopoverActivitiesTitle,
	WeekPopoverActivitiesStatus,
} from "./YearlyStreakView.styled";
import type { WeekInfo } from "./types";
import { getWeekKey } from "src/helpers/weekUtils";

// Temporary constant goals for testing
const WEEKLY_GOALS = {
	thirtyMin: {
		personalTechnique: 2,
		probabilityPractice: 1,
		buddyTraining: 1,
	},
	enduranceRun: 2,
	normalSession: {
		trainWithCoach: 1,
		trainNewbies: 1,
	},
};

export function AttendanceWeekGrid({
	weeks,
	completedWeeks,
	weeksWithoutGoals = [],
}: {
	weeks: WeekInfo[];
	completedWeeks: string[];
	weeksWithoutGoals?: string[];
}) {
	return (
		<div className="grid grid-cols-3 grid-rows-4 gap-4">
			{Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
				const monthWeeks = weeks.filter((week) => week.month === month);

				return (
					<div key={month} className="flex flex-col gap-2">
						<div className="text-sm font-medium text-gray-600">
							{DateTime.fromObject({ month }).toFormat("MMM")}
						</div>

						<div
							className={cn(
								"flex flex-row flex-wrap gap-2 p-2 rounded-md bg-slate-50 justify-between",
							)}
						>
							{monthWeeks.map((week) => {
								const weekKey = getWeekKey(week.startTimestamp);
								const isCompleted = completedWeeks.includes(weekKey);
								const hasNoGoal = weeksWithoutGoals.includes(weekKey);

								const startDate = DateTime.fromMillis(week.startTimestamp);
								const endDate = DateTime.fromMillis(week.endTimestamp);

								return (
									<Popover key={weekKey}>
										<PopoverTrigger>
											<WeekSquare
												isCompleted={isCompleted}
												hasNoGoal={hasNoGoal}
											/>
										</PopoverTrigger>
										<PopoverContent className="w-80 p-0">
											<WeekPopoverHeader>
												<WeekPopoverNumber>
													<CalendarDays className="h-4 w-4 text-gray-500" />
													<span>Week {week.weekNumber}</span>
													{isCompleted && (
														<WeekPopoverCompletedBadge>
															Completed
														</WeekPopoverCompletedBadge>
													)}
												</WeekPopoverNumber>
												<WeekPopoverDateRange>
													{startDate.toFormat("MMMM d")} -{" "}
													{endDate.toFormat("MMMM d, yyyy")}
												</WeekPopoverDateRange>
											</WeekPopoverHeader>
											<WeekPopoverBody>
												<WeekPopoverActivities>
													<WeekPopoverActivitiesTitle>
														Activities
													</WeekPopoverActivitiesTitle>
													{hasNoGoal ? (
														<WeekPopoverActivitiesStatus
															hasNoGoal={true}
															isCompleted={false}
														/>
													) : isCompleted ? (
														<WeekPopoverActivitiesStatus isCompleted={true} />
													) : (
														<div className="space-y-2 text-sm text-gray-600">
															<div className="border-l-2 pl-2 border-orange-400">
																<div>30-Minutes Sessions:</div>
																<div className="ml-4">
																	<div>
																		Personal Technique:{" "}
																		{WEEKLY_GOALS.thirtyMin.personalTechnique}{" "}
																		needed
																	</div>
																	<div>
																		Probability Practice:{" "}
																		{WEEKLY_GOALS.thirtyMin.probabilityPractice}{" "}
																		needed
																	</div>
																	<div>
																		Buddy Training:{" "}
																		{WEEKLY_GOALS.thirtyMin.buddyTraining}{" "}
																		needed
																	</div>
																</div>
															</div>
														</div>
													)}
												</WeekPopoverActivities>
											</WeekPopoverBody>
										</PopoverContent>
									</Popover>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}

export function RunningWeekGrid({
	weeks,
	completedWeeks,
	weeksWithoutGoals = [],
}: {
	weeks: WeekInfo[];
	completedWeeks: string[];
	weeksWithoutGoals?: string[];
}) {
	return (
		<div className="grid grid-cols-3 grid-rows-4 gap-4">
			{Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
				const monthWeeks = weeks.filter((week) => week.month === month);

				return (
					<div key={month} className="flex flex-col gap-2">
						<div className="text-sm font-medium text-gray-600">
							{monthWeeks.length > 0
								? (() => {
										const ts = DateTime.fromObject({
											year: monthWeeks[0].weekYear,
											month: monthWeeks[0].month,
										});
										return ts.toFormat("MMM");
									})()
								: DateTime.fromObject({ month }).toFormat("MMM")}
						</div>

						<div
							className={cn(
								"flex flex-row flex-wrap gap-2 p-2 rounded-md min-h-[60px] bg-slate-50 justify-between",
							)}
						>
							{monthWeeks.map((week) => {
								const weekKey = getWeekKey(week.startTimestamp);
								const isCompleted = completedWeeks.includes(weekKey);
								const hasNoGoal = weeksWithoutGoals.includes(weekKey);

								const startDate = DateTime.fromMillis(week.startTimestamp);
								const endDate = DateTime.fromMillis(week.endTimestamp);

								return (
									<Popover key={weekKey}>
										<PopoverTrigger>
											<WeekSquare
												isCompleted={isCompleted}
												hasNoGoal={hasNoGoal}
											/>
										</PopoverTrigger>
										<PopoverContent className="w-80 p-0">
											<WeekPopoverHeader>
												<WeekPopoverNumber>
													<CalendarDays className="h-4 w-4 text-gray-500" />
													<span>Week {week.weekNumber}</span>
													{isCompleted && (
														<WeekPopoverCompletedBadge>
															Completed
														</WeekPopoverCompletedBadge>
													)}
												</WeekPopoverNumber>
												<WeekPopoverDateRange>
													{startDate.toFormat("MMMM d")} -{" "}
													{endDate.toFormat("MMMM d, yyyy")}
												</WeekPopoverDateRange>
											</WeekPopoverHeader>
											<WeekPopoverBody>
												<WeekPopoverActivities>
													<WeekPopoverActivitiesTitle>
														Activities
													</WeekPopoverActivitiesTitle>
													{hasNoGoal ? (
														<WeekPopoverActivitiesStatus
															hasNoGoal={true}
															isCompleted={false}
														/>
													) : isCompleted ? (
														<WeekPopoverActivitiesStatus isCompleted={true} />
													) : (
														<div className="space-y-2 text-sm text-gray-600">
															<div className="border-l-2 pl-2 border-orange-400">
																<div>
																	Endurance Run: {WEEKLY_GOALS.enduranceRun}{" "}
																	needed
																</div>
															</div>
														</div>
													)}
												</WeekPopoverActivities>
											</WeekPopoverBody>
										</PopoverContent>
									</Popover>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}
