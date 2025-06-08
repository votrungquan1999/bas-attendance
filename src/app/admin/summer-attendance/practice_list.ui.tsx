"use client";

import type { ReactNode } from "react";

// MEMORY: Always use even numbers (2, 4, 6, 8) for spacing, never odd numbers (3, 5, 7)
// This ensures consistent spacing in our design system

export function SummerAttendanceLayout({ children }: { children: ReactNode }) {
	return <div className="container mx-auto p-4">{children}</div>;
}

export function PageHeader({ children }: { children: ReactNode }) {
	return (
		<div className="flex justify-between items-center mb-4">{children}</div>
	);
}

export function PageTitleSection({ children }: { children: ReactNode }) {
	return <div>{children}</div>;
}

export function SectionCard({ children }: { children: ReactNode }) {
	return (
		<div className="bg-white rounded-lg border border-gray-200 shadow-sm">
			{children}
		</div>
	);
}

export function SectionHeader({ children }: { children: ReactNode }) {
	return <div className="border-b border-gray-200 px-4 py-2">{children}</div>;
}

export function SectionContent({ children }: { children: ReactNode }) {
	return <div className="px-4 py-2">{children}</div>;
}

export function EmptyState({ children }: { children: ReactNode }) {
	return <div className="text-center py-8">{children}</div>;
}

export function EmptyStateIcon({ children }: { children: ReactNode }) {
	return (
		<div className="flex justify-center items-center mx-auto mb-4 text-gray-400">
			{children}
		</div>
	);
}

export function EmptyStateText({ children }: { children: ReactNode }) {
	return <div className="text-gray-500">{children}</div>;
}

export function PracticeList({ children }: { children: ReactNode }) {
	return <div className="space-y-4">{children}</div>;
}

export function PracticeListItem({ children }: { children: ReactNode }) {
	return (
		<div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors shadow-sm hover:shadow-md">
			{children}
		</div>
	);
}

export function PracticeHeader({ children }: { children: ReactNode }) {
	return <div className="flex justify-between items-center">{children}</div>;
}

export function PracticeInfo({ children }: { children: ReactNode }) {
	return <div className="flex-1 min-w-0">{children}</div>;
}

export function PracticeActions({ children }: { children: ReactNode }) {
	return (
		<div className="flex items-center gap-2 flex-shrink-0">{children}</div>
	);
}

export function PracticeStats({ children }: { children: ReactNode }) {
	return (
		<div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
			{children}
		</div>
	);
}

export function CreateForm({ children }: { children: ReactNode }) {
	return <div className="space-y-4">{children}</div>;
}

export function FormField({ children }: { children: ReactNode }) {
	return <div className="space-y-2">{children}</div>;
}

export function FormActions({ children }: { children: ReactNode }) {
	return <div className="flex gap-2 pt-2">{children}</div>;
}

// Practice List Item Components
export function PracticeDate({ children }: { children: ReactNode }) {
	return (
		<div className="text-lg font-semibold text-gray-900 truncate">
			{children}
		</div>
	);
}

export function PracticeUpdatedDate({ children }: { children: ReactNode }) {
	return <div className="text-sm text-gray-500 truncate">{children}</div>;
}

export function PracticeAttendanceCount({ children }: { children: ReactNode }) {
	return (
		<div className="flex items-center text-sm text-gray-600 whitespace-nowrap">
			{children}
		</div>
	);
}

export function PracticeStatusBadge({ children }: { children: ReactNode }) {
	return (
		<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
			{children}
		</span>
	);
}

export function PracticeViewButton({ children }: { children: ReactNode }) {
	return (
		<button
			type="button"
			className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors whitespace-nowrap"
		>
			{children}
		</button>
	);
}
