"use client";

import { useState } from "react";
import { DateTime } from "luxon";
import { cn } from "src/shadcn/lib/utils";
import Link from "next/link";

interface WeekSelectorProps {
	now: number;
}

export default function WeekSelector({ now }: WeekSelectorProps) {
	// Generate years from 2024 to current year + 1
	const startYear = 2024;
	const currentDate = DateTime.fromMillis(now);
	const endYear = currentDate.year + 1;
	const years = Array.from(
		{ length: endYear - startYear + 1 },
		(_, i) => startYear + i,
	);
	const months = Array.from({ length: 12 }, (_, i) => i + 1); // Luxon months are 1-based

	const [selectedYear, setSelectedYear] = useState<number | null>(null);
	const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
	const [weeks, setWeeks] = useState<DateTime[]>([]);
	const [selectedWeek, setSelectedWeek] = useState<DateTime | null>(null);

	const calculateWeeks = (year: number, month: number) => {
		// Get the first and last day of the month
		const startOfMonth = DateTime.local(year, month, 1);
		const endOfMonth = startOfMonth.endOf("month");

		// Get the first week that contains any day of this month
		// Start from the last Monday of the previous month
		let currentWeekStart = startOfMonth.startOf("week");

		const weeksInMonth: DateTime[] = [];

		// Keep adding weeks until we've passed the end of the month
		while (currentWeekStart.startOf("week") <= endOfMonth) {
			weeksInMonth.push(currentWeekStart);
			currentWeekStart = currentWeekStart.plus({ weeks: 1 });
		}

		return weeksInMonth;
	};

	const handleYearSelect = (year: number) => {
		setSelectedYear(year);
		setSelectedWeek(null);
		if (selectedMonth) {
			setWeeks(calculateWeeks(year, selectedMonth));
		}
	};

	const handleMonthSelect = (month: number) => {
		setSelectedMonth(month);
		setSelectedWeek(null);
		if (selectedYear) {
			setWeeks(calculateWeeks(selectedYear, month));
		}
	};

	const formatWeekRange = (weekStart: DateTime) => {
		const weekEnd = weekStart.plus({ days: 6 });

		// If week spans different months, include month names
		if (weekStart.month !== weekEnd.month) {
			return `${weekStart.toFormat("MMM d")} - ${weekEnd.toFormat("MMM d")}`;
		}

		// Same month, just show dates
		return `${weekStart.toFormat("MMM d")} - ${weekEnd.toFormat("d")}`;
	};

	const getWeekHighlight = (week: DateTime) => {
		if (!selectedYear || selectedMonth === null) return false;

		const weekEnd = week.plus({ days: 6 });
		const currentMonth = DateTime.local(selectedYear, selectedMonth, 1);

		const isWeekFromLastMonth = week.month < currentMonth.month;
		const isWeekFromNextMonth = weekEnd.month > currentMonth.month;

		// Check if this week is partially or fully in the selected month
		const isWeekFullyInMonth = !isWeekFromLastMonth && !isWeekFromNextMonth;

		return isWeekFullyInMonth
			? "border-blue-500/50"
			: "border-blue-500/20 bg-amber-100/50";
	};

	const calculateWeekOffset = (week: DateTime) => {
		const currentWeek = currentDate.startOf("week");
		const diffInWeeks = week.diff(currentWeek, "weeks").weeks;
		return Math.floor(diffInWeeks);
	};

	return (
		<div className="p-6 space-y-8">
			<div>
				<h3 className="text-lg font-medium mb-4">Select Year</h3>
				<div className="grid grid-cols-3 md:grid-cols-5 gap-4">
					{years.map((year) => (
						<button
							type="button"
							key={year}
							onClick={() => handleYearSelect(year)}
							className={cn(
								"p-4 text-center rounded-lg border transition-all duration-200",
								"hover:border-blue-500 hover:bg-blue-500/10",
								selectedYear === year
									? "border-blue-500 bg-blue-500/20 font-medium"
									: "border-border",
							)}
						>
							{year}
						</button>
					))}
				</div>
			</div>

			{selectedYear && (
				<div>
					<h3 className="text-lg font-medium mb-4">Select Month</h3>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{months.map((month) => (
							<button
								type="button"
								key={month}
								onClick={() => handleMonthSelect(month)}
								className={cn(
									"p-4 text-center rounded-lg border transition-all duration-200",
									"hover:border-blue-500 hover:bg-blue-500/10",
									selectedMonth === month
										? "border-blue-500 bg-blue-500/20 font-medium"
										: "border-border",
								)}
							>
								{DateTime.local(2024, month).toFormat("MMMM")}
							</button>
						))}
					</div>
				</div>
			)}

			{selectedMonth !== null && weeks.length > 0 && (
				<div>
					<h3 className="text-lg font-medium mb-4">Select Week</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{weeks.map((week) => (
							<button
								type="button"
								key={week.toISO()}
								onClick={() => setSelectedWeek(week)}
								className={cn(
									"p-4 text-center rounded-lg border transition-all duration-200",
									"hover:border-blue-500 hover:bg-blue-500/10",
									selectedWeek?.toISO() === week.toISO()
										? "border-blue-500 bg-blue-500/20 font-medium"
										: getWeekHighlight(week),
								)}
							>
								{formatWeekRange(week)}
							</button>
						))}
					</div>
				</div>
			)}

			{selectedWeek && (
				<div className="mt-6">
					<Link
						href={`/admin/settings/weekly-goals/by-week?weekOffset=${calculateWeekOffset(selectedWeek)}`}
						className={cn(
							"block w-full px-4 py-2 text-center rounded-lg transition-all duration-200",
							"bg-blue-500 text-white hover:bg-blue-600",
							"font-medium shadow-sm",
						)}
					>
						View Goals for {formatWeekRange(selectedWeek)}
					</Link>
				</div>
			)}
		</div>
	);
}
