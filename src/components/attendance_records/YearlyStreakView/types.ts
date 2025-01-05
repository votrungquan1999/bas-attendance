export interface WeekInfo {
	weekNumber: number;
	weekYear: number;
	startTimestamp: number; // Unix timestamp
	endTimestamp: number; // Unix timestamp
	month: number;
}

export interface YearlyStreakViewProps {
	year: number;
}

export enum StreakType {
	RUNNING = "running",
	ATTENDANCE = "attendance",
}
