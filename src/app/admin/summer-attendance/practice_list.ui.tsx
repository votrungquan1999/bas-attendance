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
		<div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
			{children}
		</div>
	);
}

export function PracticeHeader({ children }: { children: ReactNode }) {
	return (
		<div className="flex justify-between items-start mb-2">{children}</div>
	);
}

export function PracticeInfo({ children }: { children: ReactNode }) {
	return <div>{children}</div>;
}

export function PracticeActions({ children }: { children: ReactNode }) {
	return <div className="flex gap-2">{children}</div>;
}

export function PracticeStats({ children }: { children: ReactNode }) {
	return (
		<div className="flex gap-4 text-sm text-gray-500 mt-2">{children}</div>
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
