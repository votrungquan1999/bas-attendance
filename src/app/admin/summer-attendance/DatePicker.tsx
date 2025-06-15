"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "src/shadcn/lib/utils";
import { Button } from "src/shadcn/components/ui/button";
import { Calendar } from "src/shadcn/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "src/shadcn/components/ui/popover";

/**
 * DatePicker Component Anatomy
 *
 * Basic usage:
 * <DatePicker.Root name="fieldName">
 *   <DatePicker.Trigger>
 *     <DatePicker.Value placeholder="Pick a date" />
 *   </DatePicker.Trigger>
 * </DatePicker.Root>
 *
 * With asChild for custom trigger:
 * <DatePicker.Root name="fieldName">
 *   <DatePicker.Trigger asChild>
 *     <Button variant="ghost">
 *       <DatePicker.Value placeholder="Select date" />
 *     </Button>
 *   </DatePicker.Trigger>
 * </DatePicker.Root>
 */

interface RootProps extends React.InputHTMLAttributes<HTMLInputElement> {
	children: React.ReactNode;
	defaultValue?: string;
}

const DatePickerContext = React.createContext<{
	date: Date | undefined;
	setOpen: (open: boolean) => void;
	id?: string;
} | null>(null);

function useDatePickerContext() {
	const context = React.useContext(DatePickerContext);
	if (!context) {
		throw new Error("DatePicker components must be used within Root");
	}
	return context;
}

export function Root({
	// children is the trigger
	children,
	name,
	defaultValue,
	id,
	...inputProps
}: RootProps) {
	const [date, setDate] = React.useState<Date | undefined>(
		defaultValue ? new Date(defaultValue) : undefined,
	);
	const [open, setOpen] = React.useState(false);

	return (
		<DatePickerContext.Provider value={{ date, setOpen, id }}>
			{/* Hidden input for form submission */}
			<input
				{...inputProps}
				type="hidden"
				name={name}
				value={date ? date.toISOString().split("T")[0] : ""}
			/>

			<Popover open={open} onOpenChange={setOpen}>
				{children}
				<PopoverContent className="w-auto p-0">
					<Calendar
						mode="single"
						selected={date}
						onSelect={(selectedDate) => {
							setDate(selectedDate);
							setOpen(false);
						}}
						captionLayout="dropdown"
					/>
				</PopoverContent>
			</Popover>
		</DatePickerContext.Provider>
	);
}

interface TriggerProps {
	asChild?: boolean;
	children: React.ReactNode;
}

export function Trigger({
	asChild = false,
	// the content of the trigger
	children,
}: TriggerProps) {
	const { setOpen, id } = useDatePickerContext();

	const commonProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {
		type: "button",
		onClick: () => setOpen(true),
		id: id,
	};

	if (asChild && children) {
		return (
			<PopoverTrigger asChild>
				<Slot {...commonProps}>{children}</Slot>
			</PopoverTrigger>
		);
	}

	return (
		<PopoverTrigger asChild>
			<Button
				{...commonProps}
				variant="outline"
				className="w-full justify-start text-left font-normal text-gray-800"
			>
				{children}
			</Button>
		</PopoverTrigger>
	);
}

export function Value({
	placeholder = "Pick a date",
	children,
}: {
	placeholder?: string;
	children?: React.ReactNode;
}) {
	const { date } = useDatePickerContext();

	if (children) {
		return children;
	}

	return (
		<span
			className={cn("text-gray-800 flex items-center", {
				"text-gray-500": !date,
			})}
		>
			<CalendarIcon className="mr-2 h-4 w-4" />
			{date ? format(date, "PPP") : placeholder}
		</span>
	);
}
