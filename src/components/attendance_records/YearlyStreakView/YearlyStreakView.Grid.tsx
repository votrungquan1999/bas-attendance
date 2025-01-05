import type { WeekInfo } from "./types";
import { MonthDisplay } from "./MonthDisplay";
import { WeekDisplay, LoadingSpinner } from "./WeekDisplay";
import { Suspense } from "react";
import query_getTakerFromCookies from "src/server/queries/query_getTakerFromCookies";

export async function AttendanceWeekGrid({
	weeks,
}: {
	weeks: WeekInfo[];
}) {
	const athlete = await query_getTakerFromCookies();

	if (!athlete) {
		return null;
	}

	return (
		<div className="grid grid-cols-3 grid-rows-4 gap-4">
			{Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
				const monthWeeks = weeks.filter((week) => week.month === month);
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

export async function RunningWeekGrid({
	weeks,
}: {
	weeks: WeekInfo[];
}) {
	const athlete = await query_getTakerFromCookies();

	if (!athlete) {
		return null;
	}

	return (
		<div className="grid grid-cols-3 grid-rows-4 gap-4">
			{Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
				const monthWeeks = weeks.filter((week) => week.month === month);
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
