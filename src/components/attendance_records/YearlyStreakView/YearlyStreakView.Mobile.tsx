import type { WeekInfo } from "./types";
import { groupBy } from "lodash/fp";
import query_getTakerFromCookies from "src/server/queries/query_getTakerFromCookies";
import { MonthDisplay } from "./MonthDisplay";
import { WeekDisplay, LoadingSpinner } from "./WeekDisplay";
import { Suspense } from "react";

function groupByMonth(weeks: WeekInfo[]) {
	return groupBy((week: WeekInfo) => week.month)(weeks);
}

export async function AttendanceWeekMobileRow({
	weeks,
}: {
	weeks: WeekInfo[];
}) {
	const athlete = await query_getTakerFromCookies();

	if (!athlete) {
		return null;
	}

	const groupedByMonth = groupByMonth(weeks);

	return (
		<div className="flex flex-row gap-4 justify-between flex-wrap">
			{Object.entries(groupedByMonth).map(([month, monthWeeks]) => {
				if (monthWeeks.length === 0) return null;

				return (
					<MonthDisplay key={month} weeks={monthWeeks}>
						{monthWeeks.map((week) => (
							<Suspense key={week.weekNumber} fallback={<LoadingSpinner />}>
								<WeekDisplay
									week={week}
									athleteId={athlete.id}
									type="attendance"
								/>
							</Suspense>
						))}
					</MonthDisplay>
				);
			})}
		</div>
	);
}

export async function RunningWeekMobileRow({
	weeks,
}: {
	weeks: WeekInfo[];
}) {
	const athlete = await query_getTakerFromCookies();

	if (!athlete) {
		return null;
	}

	const groupedByMonth = groupByMonth(weeks);

	return (
		<div className="flex flex-row gap-4 justify-between flex-wrap">
			{Object.entries(groupedByMonth).map(([month, monthWeeks]) => {
				if (monthWeeks.length === 0) return null;

				return (
					<MonthDisplay key={month} weeks={monthWeeks}>
						{monthWeeks.map((week) => (
							<Suspense key={week.weekNumber} fallback={<LoadingSpinner />}>
								<WeekDisplay
									week={week}
									athleteId={athlete.id}
									type="running"
								/>
							</Suspense>
						))}
					</MonthDisplay>
				);
			})}
		</div>
	);
}
