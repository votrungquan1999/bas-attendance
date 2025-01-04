"use client";

import type { ReactNode } from "react";
import { StreakType, type WeekInfo } from "./types";
import { createReducerContext } from "src/components/reducerContext";
import { DateTime } from "luxon";

interface StreakViewContextType {
	streakType: StreakType;
	year: number;
}

type Action =
	| { type: "setYear"; payload: number }
	| { type: "setStreakType"; payload: StreakType };

function reducer(
	state: StreakViewContextType,
	action: Action,
): StreakViewContextType {
	switch (action.type) {
		case "setYear":
			return { ...state, year: action.payload };
		case "setStreakType":
			return { ...state, streakType: action.payload };
		default:
			return state;
	}
}

const { ReducerContextProvider, useDispatch, useState } =
	createReducerContext(reducer);

export function StreakViewProvider({ children }: { children: ReactNode }) {
	return (
		<ReducerContextProvider
			value={{
				streakType: StreakType.ATTENDANCE,
				year: 2024,
			}}
		>
			{children}
		</ReducerContextProvider>
	);
}

export function useStreakViewType() {
	const context = useState();

	if (context === undefined) {
		throw new Error("useStreakView must be used within a StreakViewProvider");
	}

	return context.streakType;
}

export function useSetStreakType() {
	const dispatch = useDispatch();

	return (type: StreakType) =>
		dispatch({ type: "setStreakType", payload: type });
}

export function useSetStreakViewYear() {
	const dispatch = useDispatch();

	return (year: number) => dispatch({ type: "setYear", payload: year });
}

export function useStreakViewYear() {
	const context = useState();

	return context.year;
}

export function useStreakViewYearWeeks() {
	const { year } = useState();

	// Get the first day of the year
	const startOfYear = DateTime.local(year, 1, 1);
	const endOfYear = startOfYear.endOf("year");

	// Get all weeks in the year
	const weeks: WeekInfo[] = [];
	let currentWeek = startOfYear.startOf("week");

	// Keep adding weeks until we've passed the end of the year
	while (currentWeek <= endOfYear) {
		// Only include the week if it has days in our target year
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
				month: currentWeek.month,
			});
		}
		currentWeek = currentWeek.plus({ weeks: 1 });
	}

	return weeks;
}
