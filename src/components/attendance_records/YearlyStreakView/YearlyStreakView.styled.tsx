import { cn } from "src/shadcn/lib/utils";
import type { ReactNode } from "react";

export function YearlyStreakViewRoot({
	children,
	className,
}: { children: ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				"bg-white rounded-xl shadow-sm p-6 border border-gray-100",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function YearlyStreakViewHeader({ children }: { children: ReactNode }) {
	return (
		<div className="flex items-start sm:items-center justify-between gap-4 mb-4">
			{children}
		</div>
	);
}

export function YearlyStreakViewTitle({ children }: { children: ReactNode }) {
	return (
		<h2 className="text-lg font-semibold text-gray-900 flex flex-row gap-2 items-center flex-wrap sm:flex-nowrap">
			{children}
		</h2>
	);
}

export function YearlyStreakViewTotalWeeks({
	children,
}: { children: ReactNode }) {
	return <span className="text-sm text-gray-500">{children}</span>;
}

export function YearlyStreakViewQuarterNav({
	children,
}: { children: ReactNode }) {
	return (
		<div className="flex items-center justify-between mb-4">{children}</div>
	);
}

export function YearlyStreakViewDesktopView({
	children,
}: { children: ReactNode }) {
	return <div className="hidden sm:block space-y-6">{children}</div>;
}

export function YearlyStreakViewMobileView({
	children,
}: { children: ReactNode }) {
	return <div className="block sm:hidden">{children}</div>;
}

export function YearlyStreakViewLegend({ children }: { children: ReactNode }) {
	return (
		<div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
			{children}
		</div>
	);
}

export function YearlyStreakViewLegendItem({
	children,
}: { children: ReactNode }) {
	return <div className="flex items-center gap-2">{children}</div>;
}

export function WeekSquare({
	isCompleted,
	hasNoGoal,
}: {
	isCompleted: boolean;
	hasNoGoal?: boolean;
}) {
	return (
		<div
			className={cn(
				"w-5 h-5 rounded-sm transition-colors relative border",
				hasNoGoal
					? "bg-gray-200 border-gray-300 hover:bg-gray-300"
					: isCompleted
						? "bg-blue-500 border-transparent hover:bg-blue-600"
						: "bg-white hover:bg-gray-50 border-gray-200",
			)}
		/>
	);
}

export function WeekPopoverHeader({ children }: { children: ReactNode }) {
	return <div className="border-b border-gray-100 p-3">{children}</div>;
}

export function WeekPopoverBody({ children }: { children: ReactNode }) {
	return <div className="p-3">{children}</div>;
}

export function WeekPopoverNumber({ children }: { children: ReactNode }) {
	return (
		<div className="flex items-center gap-2 text-sm font-medium">
			{children}
		</div>
	);
}

export function WeekPopoverCompletedBadge({
	children,
}: { children: ReactNode }) {
	return (
		<span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
			{children}
		</span>
	);
}

export function WeekPopoverDateRange({ children }: { children: ReactNode }) {
	return <div className="mt-1 text-xs text-gray-500">{children}</div>;
}

export function WeekPopoverActivities({ children }: { children: ReactNode }) {
	return <div className="text-sm">{children}</div>;
}

export function WeekPopoverActivitiesTitle({
	children,
}: { children: ReactNode }) {
	return <div className="font-medium mb-1">{children}</div>;
}

export function QuarterLabel({ children }: { children: ReactNode }) {
	return <span className="text-sm font-medium">{children}</span>;
}

export function MonthLabel({ children }: { children: ReactNode }) {
	return <div className="text-sm font-medium text-gray-600">{children}</div>;
}

export function MonthWeeksContainer({ children }: { children: ReactNode }) {
	return (
		<div
			className={cn(
				"flex flow-row gap-4 p-2 rounded-md bg-slate-50 justify-between",
			)}
		>
			{children}
		</div>
	);
}

export function MonthContainer({ children }: { children: ReactNode }) {
	return <div className="flex flex-col gap-2 justify-between">{children}</div>;
}
