import { DateTime } from "luxon";
import type { WeekInfo } from "./types";
import {
	MonthContainer,
	MonthLabel,
	MonthWeeksContainer,
} from "./YearlyStreakView.styled";

interface MonthDisplayProps {
	children: React.ReactNode;
	weeks: WeekInfo[];
}

export function MonthDisplay({ children, weeks }: MonthDisplayProps) {
	if (weeks.length === 0) return null;

	const monthLabel = DateTime.fromObject({
		month: weeks[0].month,
	}).toFormat("MMM");

	return (
		<MonthContainer>
			<MonthLabel>{monthLabel}</MonthLabel>
			<MonthWeeksContainer>{children}</MonthWeeksContainer>
		</MonthContainer>
	);
}
