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
import { groupBy } from "lodash/fp";
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

function groupByMonth(weeks: WeekInfo[]) {
	return groupBy((week: WeekInfo) => week.month)(weeks);
}

export function AttendanceWeekMobileRow({
	weeks,
	completedWeeks,
	weeksWithoutGoals = [],
}: {
	weeks: WeekInfo[];
	completedWeeks: string[];
	weeksWithoutGoals?: string[];
}) {
	const groupedByMonth = groupByMonth(weeks);

	return (
		<div className="flex flex-row gap-4 justify-between flex-wrap">
			{Object.entries(groupedByMonth).map(([month, weeks]) => {
				const isOddMonth = Number.parseInt(month) % 2 === 1;

				return (
					<div key={month} className="flex flex-col gap-2 justify-between">
						<div className="text-sm font-medium text-gray-600">
							{DateTime.fromObject({
								month: weeks[0].month,
							}).toFormat("MMM")}
						</div>

						<div
							className={cn(
								"flex flow-row gap-4 p-2 rounded-md",
								isOddMonth ? "bg-slate-100" : "bg-slate-50",
							)}
						>
							{weeks.map((week) => {
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

export function RunningWeekMobileRow({
	weeks,
	completedWeeks,
	weeksWithoutGoals = [],
}: {
	weeks: WeekInfo[];
	completedWeeks: string[];
	weeksWithoutGoals?: string[];
}) {
	const groupedByMonth = groupByMonth(weeks);

	return (
		<div className="flex flex-row gap-4 justify-between flex-wrap">
			{Object.entries(groupedByMonth).map(([month, weeks]) => {
				const isOddMonth = Number.parseInt(month) % 2 === 1;

				return (
					<div key={month} className="flex flex-col gap-2 justify-between">
						<div className="text-sm font-medium text-gray-600">
							{(() => {
								const startDate = DateTime.fromMillis(weeks[0].startTimestamp, {
									zone: "Asia/Saigon",
								});
								const endDate = startDate.plus({ days: 6 });
								const targetYear = weeks[0].weekYear;

								// If week starts in previous year, show January
								// If week ends in next year, show December
								// Otherwise show actual month
								if (startDate.year < targetYear) {
									return "Jan";
								}
								if (endDate.year > targetYear) {
									return "Dec";
								}
								return startDate.toFormat("MMM");
							})()}
						</div>

						<div
							className={cn(
								"flex flow-row gap-4 p-2 rounded-md",
								isOddMonth ? "bg-slate-100" : "bg-slate-50",
							)}
						>
							{weeks.map((week) => {
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
