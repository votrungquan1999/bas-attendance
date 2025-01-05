"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "src/shadcn/components/ui/select";
import { StreakType } from "./types";
import { useStreakViewType, useSetStreakType } from "./StreakViewContext";

export function StreakTypeSelect() {
	const streakType = useStreakViewType();
	const setStreakType = useSetStreakType();

	return (
		<Select
			value={streakType}
			onValueChange={(value) => setStreakType(value as StreakType)}
		>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Select streak type" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={StreakType.ATTENDANCE}>Attendance Streak</SelectItem>
				<SelectItem value={StreakType.RUNNING}>Running Streak</SelectItem>
			</SelectContent>
		</Select>
	);
}
