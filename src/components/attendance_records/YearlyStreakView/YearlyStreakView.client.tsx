"use client";

import { DateTime } from "luxon";
import type { ReactNode } from "react";
import { useStreakViewYearWeeks, useStreakViewType } from "./StreakViewContext";
import {
	useSetBiMonthlyIndex,
	useMobileWeekViewState,
} from "./MobileWeekViewContext";
import { StreakType } from "./types";

export function BiMonthlyWeekRoot({
	children,
	period,
}: {
	children: ReactNode;
	period: number;
}) {
	const { biMonthlyIndex } = useMobileWeekViewState();

	if (biMonthlyIndex !== period) {
		return null;
	}

	return children;
}

export function BiMonthlyLabel() {
	const { biMonthlyIndex } = useMobileWeekViewState();
	const weeks = useStreakViewYearWeeks();

	// Split weeks into bi-monthly periods
	const biMonthlyPeriods = Array.from({ length: 6 }, (_, i) => {
		const startMonth = i * 2 + 1;
		return weeks.filter((week) => {
			const month = week.month;
			return month === startMonth || month === startMonth + 1;
		});
	});

	const currentPeriodWeeks = biMonthlyPeriods[biMonthlyIndex];

	const periodStart = currentPeriodWeeks[0]
		? DateTime.fromMillis(currentPeriodWeeks[0].startTimestamp)
		: null;
	const periodEnd = currentPeriodWeeks[currentPeriodWeeks.length - 1]
		? DateTime.fromMillis(
				currentPeriodWeeks[currentPeriodWeeks.length - 1].endTimestamp,
			)
		: null;

	const periodLabel =
		periodStart && periodEnd
			? `${periodStart.toFormat("MMM")} - ${periodEnd.toFormat("MMM")}`
			: "";

	return <span>{periodLabel}</span>;
}

export function BiMonthlyNavButton({
	children,
	direction,
}: {
	children: ReactNode;
	direction: "left" | "right";
}) {
	const { biMonthlyIndex } = useMobileWeekViewState();
	const setBiMonthlyIndex = useSetBiMonthlyIndex();

	const canNavigate =
		direction === "left" ? biMonthlyIndex > 0 : biMonthlyIndex < 5;

	function onClick() {
		if (direction === "left") {
			setBiMonthlyIndex(Math.max(0, biMonthlyIndex - 1));
		} else {
			setBiMonthlyIndex(Math.min(5, biMonthlyIndex + 1));
		}
	}

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={!canNavigate}
			className="p-1 text-gray-500 disabled:opacity-50"
		>
			{children}
		</button>
	);
}

export function AttendanceWeekRowRoot({
	children,
}: {
	children: ReactNode;
}) {
	const streakType = useStreakViewType();

	if (streakType !== StreakType.ATTENDANCE) {
		return null;
	}

	return children;
}

export function RunningWeekRowRoot({
	children,
}: {
	children: ReactNode;
}) {
	const streakType = useStreakViewType();

	if (streakType !== StreakType.RUNNING) {
		return null;
	}

	return children;
}
