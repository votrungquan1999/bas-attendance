"use client";

import { useStreakViewYear, useSetStreakViewYear } from "./StreakViewContext";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "src/shadcn/components/ui/select";

export function YearSelect() {
	const currentYear = useStreakViewYear();
	const setYear = useSetStreakViewYear();

	// Generate a list of years from 2024 to current year + 1
	const currentDate = new Date();
	const years = Array.from(
		{ length: currentDate.getFullYear() - 2024 + 2 },
		(_, i) => 2024 + i,
	);

	return (
		<Select
			value={currentYear.toString()}
			onValueChange={(value) => setYear(Number(value))}
		>
			<SelectTrigger className="w-[4.5rem] p-1 h-auto">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{years.map((year) => (
					<SelectItem key={year} value={year.toString()}>
						{year}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
