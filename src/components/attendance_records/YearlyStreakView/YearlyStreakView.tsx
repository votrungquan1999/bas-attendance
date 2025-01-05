import { DateTime } from "luxon";
import {
	YearlyStreakViewRoot,
	YearlyStreakViewHeader,
	YearlyStreakViewTitle,
	YearlyStreakViewTotalWeeks,
	YearlyStreakViewDesktopView,
	YearlyStreakViewLegend,
	YearlyStreakViewLegendItem,
	WeekSquare,
	YearlyStreakViewMobileView,
	YearlyStreakViewQuarterNav as YearlyStreakViewBiMonthlyNav,
} from "./YearlyStreakView.styled";
import {
	AttendanceWeekRowRoot,
	BiMonthlyLabel,
	BiMonthlyNavButton,
	BiMonthlyWeekRoot,
	RunningWeekRowRoot,
} from "./YearlyStreakView.client";

import type { WeekInfo, YearlyStreakViewProps } from "./types";
import { StreakTypeSelect } from "./StreakTypeSelect";
import { StreakViewProvider } from "./StreakViewContext";
import { MobileWeekViewProvider } from "./MobileWeekViewContext";
import { ChevronRight } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { YearSelect } from "./YearSelect";
import { AttendanceWeekGrid, RunningWeekGrid } from "./YearlyStreakView.Grid";
import {
	AttendanceWeekMobileRow,
	RunningWeekMobileRow,
} from "./YearlyStreakView.Mobile";

export default function YearlyStreakView({ year }: YearlyStreakViewProps) {
	const startOfYear = DateTime.fromObject({ year }, { zone: "Asia/Saigon" });
	const endOfYear = startOfYear.endOf("year");

	const weeks: WeekInfo[] = [];
	let currentWeek = startOfYear.startOf("week");

	while (currentWeek <= endOfYear) {
		if (
			currentWeek.year === year ||
			currentWeek.plus({ days: 6 }).year === year
		) {
			const weekEnd = currentWeek.plus({ days: 6 });
			weeks.push({
				weekNumber: currentWeek.weekNumber,
				weekYear: currentWeek.weekYear,
				startTimestamp: currentWeek.toMillis(),
				endTimestamp: weekEnd.toMillis(),
				month:
					currentWeek.year < year
						? 1
						: weekEnd.year > year
							? 12
							: currentWeek.month,
			});
		}
		currentWeek = currentWeek.plus({ weeks: 1 });
	}

	const weeksByBiMonthly = Array.from({ length: 6 }, (_, i) => {
		const startMonth = i * 2 + 1;
		return {
			biMonthlyIndex: i,
			weeks: weeks.filter((week) => {
				const month = week.month;
				return month === startMonth || month === startMonth + 1;
			}),
		};
	});

	return (
		<StreakViewProvider>
			<YearlyStreakViewRoot>
				<YearlyStreakViewHeader>
					<div className="flex flex-col gap-1">
						<YearlyStreakViewTitle>
							<YearSelect currentYear={year} /> Training Streak
						</YearlyStreakViewTitle>
						<YearlyStreakViewTotalWeeks>
							{weeks.length} weeks total
						</YearlyStreakViewTotalWeeks>
					</div>
					<div className="flex-shrink-0">
						<StreakTypeSelect />
					</div>
				</YearlyStreakViewHeader>

				{/* Mobile view */}
				<YearlyStreakViewMobileView>
					<MobileWeekViewProvider>
						<YearlyStreakViewBiMonthlyNav>
							<BiMonthlyNavButton direction="left">
								<ChevronLeft className="h-5 w-5" />
							</BiMonthlyNavButton>
							<BiMonthlyLabel />
							<BiMonthlyNavButton direction="right">
								<ChevronRight className="h-5 w-5" />
							</BiMonthlyNavButton>
						</YearlyStreakViewBiMonthlyNav>

						{weeksByBiMonthly.map((biMonthly) => (
							<BiMonthlyWeekRoot
								key={biMonthly.biMonthlyIndex}
								period={biMonthly.biMonthlyIndex}
							>
								<AttendanceWeekRowRoot>
									<AttendanceWeekMobileRow weeks={biMonthly.weeks} />
								</AttendanceWeekRowRoot>

								<RunningWeekRowRoot>
									<RunningWeekMobileRow weeks={biMonthly.weeks} />
								</RunningWeekRowRoot>
							</BiMonthlyWeekRoot>
						))}
					</MobileWeekViewProvider>
				</YearlyStreakViewMobileView>

				{/* Desktop view */}
				<YearlyStreakViewDesktopView>
					<AttendanceWeekRowRoot>
						<AttendanceWeekGrid weeks={weeks} />
					</AttendanceWeekRowRoot>

					<RunningWeekRowRoot>
						<RunningWeekGrid weeks={weeks} />
					</RunningWeekRowRoot>
				</YearlyStreakViewDesktopView>

				<YearlyStreakViewLegend>
					<YearlyStreakViewLegendItem>
						<WeekSquare isCompleted={true} />
						<span>Completed</span>
					</YearlyStreakViewLegendItem>
					<YearlyStreakViewLegendItem>
						<WeekSquare isCompleted={false} />
						<span>Not completed</span>
					</YearlyStreakViewLegendItem>
					<YearlyStreakViewLegendItem>
						<WeekSquare isCompleted={false} hasNoGoal={true} />
						<span>No goals</span>
					</YearlyStreakViewLegendItem>
				</YearlyStreakViewLegend>
			</YearlyStreakViewRoot>
		</StreakViewProvider>
	);
}
