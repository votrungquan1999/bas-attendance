export interface WeekInfo {
	weekNumber: number;
	weekYear: number;
	startTimestamp: number; // Unix timestamp
	endTimestamp: number; // Unix timestamp
	month: number;
}

export interface YearlyStreakViewProps {
	year: number;
	// Array of week identifiers in the format "YYYY-WW"
	completedWeeks: string[];
	// Array of week identifiers in the format "YYYY-WW" that have no goals set
	weeksWithoutGoals?: string[];
}

export enum StreakType {
	RUNNING = "running",
	ATTENDANCE = "attendance",
}
