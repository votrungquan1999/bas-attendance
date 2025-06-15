"use client";

import type { ReactNode } from "react";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "src/shadcn/components/ui/tabs";

// Practice Detail Layout Components
export function PracticeDetailLayout({ children }: { children: ReactNode }) {
	return <div className="container mx-auto p-4">{children}</div>;
}

export function PracticeDetailHeader({ children }: { children: ReactNode }) {
	return <div className="flex items-center gap-4 mb-4">{children}</div>;
}

export function BackLink({ children }: { children: ReactNode }) {
	return (
		<div className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
			{children}
		</div>
	);
}

export function PracticeTitle({ children }: { children: ReactNode }) {
	return <div className="mb-4">{children}</div>;
}

export function PracticeTitleText({ children }: { children: ReactNode }) {
	return <h1 className="text-2xl font-bold">{children}</h1>;
}

export function PracticeSubtitle({ children }: { children: ReactNode }) {
	return <p className="text-gray-600 text-sm">{children}</p>;
}

export function AttendanceManagementCard({
	children,
}: { children: ReactNode }) {
	return (
		<div className="bg-white rounded-lg border border-gray-200 shadow-sm">
			{children}
		</div>
	);
}

// Tab Components using shadcn with custom styling
export function AttendanceTabs({
	defaultValue = "registration",
	children,
}: {
	defaultValue?: string;
	children: ReactNode;
}) {
	return (
		<Tabs defaultValue={defaultValue} className="w-full">
			{children}
		</Tabs>
	);
}

export function AttendanceTabsList({ children }: { children: ReactNode }) {
	return (
		<TabsList className="grid w-full grid-cols-3 bg-gray-50 border-b border-gray-200 rounded-t-lg h-auto p-0">
			{children}
		</TabsList>
	);
}

export function AttendanceTabsTrigger({
	value,
	children,
}: {
	value: string;
	children: ReactNode;
}) {
	return (
		<TabsTrigger
			value={value}
			className="flex-1 px-4 py-3 text-sm font-medium transition-colors data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 rounded-none first:rounded-tl-lg last:rounded-tr-lg"
		>
			{children}
		</TabsTrigger>
	);
}

export function AttendanceTabsContent({
	value,
	children,
}: {
	value: string;
	children: ReactNode;
}) {
	return (
		<TabsContent value={value} className="p-6 mt-0">
			{children}
		</TabsContent>
	);
}

// Tab Content Components
export function TabContentHeader({ children }: { children: ReactNode }) {
	return <div className="mb-4">{children}</div>;
}

export function TabContentTitle({ children }: { children: ReactNode }) {
	return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>;
}

export function TabContentDescription({ children }: { children: ReactNode }) {
	return <p className="text-sm text-gray-600 mt-1">{children}</p>;
}

export function TabContentBody({ children }: { children: ReactNode }) {
	return <div className="space-y-4">{children}</div>;
}

// Registration Tab Components
export function AthleteSelectionSection({ children }: { children: ReactNode }) {
	return <div className="space-y-4">{children}</div>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
	return <h4 className="font-medium text-gray-900 mb-2">{children}</h4>;
}

export function RegisteredAthletesList({ children }: { children: ReactNode }) {
	return (
		<div className="space-y-2 min-h-[60px] bg-green-50 rounded-lg p-3 border-2 border-dashed border-green-200">
			{children}
		</div>
	);
}

export function BusyAthletesList({ children }: { children: ReactNode }) {
	return (
		<div className="space-y-3 min-h-[100px] bg-orange-50 rounded-lg p-3 border-2 border-dashed border-orange-200">
			{children}
		</div>
	);
}

export function RegisteredAthleteItem({ children }: { children: ReactNode }) {
	return (
		<div className="flex items-center justify-between bg-white rounded-md p-2 border border-green-300">
			{children}
		</div>
	);
}

export function BusyAthleteItem({ children }: { children: ReactNode }) {
	return (
		<div className="bg-white rounded-md p-3 border border-orange-300">
			{children}
		</div>
	);
}

export function AthleteLabel({ children }: { children: ReactNode }) {
	return <span className="font-medium text-gray-900">{children}</span>;
}

export function ReasonInput({
	placeholder,
	value,
	onChange,
}: {
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<input
			type="text"
			placeholder={placeholder}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
		/>
	);
}

// Footer Components
export function TabFooter({ children }: { children: ReactNode }) {
	return (
		<div className="border-t border-gray-200 pt-4 mt-6 flex justify-end">
			{children}
		</div>
	);
}

export function SaveButton({ children }: { children: ReactNode }) {
	return (
		<button
			type="button"
			className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
		>
			{children}
		</button>
	);
}

// Placeholder Components (keep for other tabs)
export function PlaceholderContent({ children }: { children: ReactNode }) {
	return (
		<div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
			{children}
		</div>
	);
}

export function PlaceholderTitle({ children }: { children: ReactNode }) {
	return <h4 className="font-medium text-gray-700 mb-2">{children}</h4>;
}

export function PlaceholderText({ children }: { children: ReactNode }) {
	return <p className="text-sm">{children}</p>;
}

export function PlaceholderList({ children }: { children: ReactNode }) {
	return (
		<ul className="text-left space-y-1 mt-3 max-w-md mx-auto">{children}</ul>
	);
}

export function PlaceholderListItem({ children }: { children: ReactNode }) {
	return <li className="text-sm">{children}</li>;
}
