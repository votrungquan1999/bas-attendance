"use client";

import { useState, useTransition } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "src/shadcn/components/ui/select";
import { action_handleSelectYear } from "src/server/actions/action_handleSelectYear";
import { Loader2 } from "lucide-react";
import { cn } from "src/shadcn/lib/utils";

export function YearSelect({ currentYear }: { currentYear: number }) {
	const [isPending, startTransition] = useTransition();
	const [selectedYear, setSelectedYear] = useState(currentYear);

	// Generate a list of years from 2024 to current year + 1
	const currentDate = new Date();
	const years = Array.from(
		{ length: currentDate.getFullYear() - 2024 + 2 },
		(_, i) => 2024 + i,
	);

	function handleChangeYear(year: number) {
		setSelectedYear(year);

		startTransition(() => {
			action_handleSelectYear(year);
		});
	}

	return (
		<Select
			value={selectedYear.toString()}
			onValueChange={(value) => handleChangeYear(Number(value))}
		>
			<SelectTrigger
				className={cn(
					"w-[5.5rem] p-1 h-auto",
					isPending && "animate-pulse opacity-50",
				)}
			>
				<SelectValue />

				{isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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
