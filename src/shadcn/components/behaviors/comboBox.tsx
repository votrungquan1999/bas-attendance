"use client";

import {
	Check,
	CheckIcon,
	ChevronsUpDown,
	LoaderCircleIcon,
} from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "src/shadcn/lib/utils";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "src/shadcn/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "src/shadcn/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "src/shadcn/components/ui/tooltip";
import { createReducerContext } from "src/components/reducerContext";
import { createContext, useContext, useEffect, useTransition } from "react";

type RegisteredItem = {
	value: string;
	display: React.ReactNode;
};

type ActionType =
	| {
			action: "open_combobox";
	  }
	| {
			action: "close_combobox";
	  }
	| {
			action: "select_item";
			itemValue: string;
	  }
	| {
			action: "register_item";
			item: RegisteredItem;
	  }
	| {
			action: "finished_action_select_item";
	  }
	| {
			action: "success_display_too_long";
	  };

type StateType = {
	open: boolean;
	multiple: boolean;
	selectedItemValues: string[];
	registeredItems: RegisteredItem[];
	isPending: boolean;
	isSuccess: boolean;
};

const initialState: StateType = {
	open: false,
	multiple: false,
	selectedItemValues: [],
	registeredItems: [],
	isPending: false,
	isSuccess: false,
};

const { ReducerContextProvider, useDispatch, useState } = createReducerContext<
	StateType,
	ActionType
>((state: StateType, action: ActionType) => {
	switch (action.action) {
		case "open_combobox":
			return { ...state, open: true };
		case "close_combobox":
			return { ...state, open: false };
		case "select_item": {
			const isAlreadySelected = state.selectedItemValues.includes(
				action.itemValue,
			);

			if (state.multiple) {
				if (isAlreadySelected) {
					// Remove item in multiple mode
					return {
						...state,
						isPending: true,
						selectedItemValues: state.selectedItemValues.filter(
							(value) => value !== action.itemValue,
						),
					};
				}
				// Add item in multiple mode - keep combobox open
				return {
					...state,
					isPending: true,
					selectedItemValues: [...state.selectedItemValues, action.itemValue],
				};
			}
			// Single selection - close combobox
			return {
				...state,
				open: false,
				isPending: true,
				selectedItemValues: [action.itemValue],
			};
		}
		case "register_item": {
			// replace if already exists
			const exists = state.registeredItems.some(
				(item) => item.value === action.item.value,
			);
			if (exists) {
				return {
					...state,
					registeredItems: state.registeredItems.map((item) =>
						item.value === action.item.value ? action.item : item,
					),
				};
			}

			return {
				...state,
				registeredItems: [...state.registeredItems, action.item],
			};
		}
		case "finished_action_select_item":
			return {
				...state,
				isPending: false,
				isSuccess: true,
			};
		case "success_display_too_long":
			return {
				...state,
				isSuccess: false,
			};
	}
}, initialState);

const ActionSelectItemContext = createContext<
	((values: string[]) => Promise<void>) | null
>(null);

function useActionSelectItem() {
	const context = useContext(ActionSelectItemContext);

	if (context === null) {
		throw new Error("useActionSelectItem must be used within a ComboboxRoot");
	}

	return context;
}

export function useRegisterItem(value: string, display: React.ReactNode) {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch({
			action: "register_item",
			item: { value, display },
		});
	}, [dispatch, value, display]);
}

function HiddenInput({ name, multiple }: { name: string; multiple: boolean }) {
	const state = useState();

	return (
		<select
			name={name}
			multiple={multiple}
			value={
				multiple ? state.selectedItemValues : state.selectedItemValues[0] || ""
			}
			onChange={() => {}} // Controlled by the combobox
			style={{ display: "none" }}
			tabIndex={-1}
			aria-hidden="true"
		>
			{state.selectedItemValues.map((value) => (
				<option key={value} value={value}>
					{value}
				</option>
			))}
		</select>
	);
}

export function ComboboxRoot({
	children,
	defaultSelectedItemValues = [],
	handleSelectItem,
	multiple = false,
	name,
}: {
	children: React.ReactNode;
	defaultSelectedItemValues?: string[];
	handleSelectItem: (values: string[]) => Promise<void>;
	multiple?: boolean;
	name?: string;
}) {
	return (
		<ActionSelectItemContext.Provider value={handleSelectItem}>
			<ReducerContextProvider
				value={{
					open: false,
					multiple,
					selectedItemValues: defaultSelectedItemValues,
					registeredItems: [],
					isPending: false,
					isSuccess: false,
				}}
			>
				{name && <HiddenInput name={name} multiple={multiple} />}
				{children}
			</ReducerContextProvider>
		</ActionSelectItemContext.Provider>
	);
}

export function ComboboxPopover({ children }: { children: React.ReactNode }) {
	const state = useState();

	const dispatch = useDispatch();

	const handleOpenChange = (open: boolean) => {
		if (open) {
			dispatch({ action: "open_combobox" });
		} else {
			dispatch({ action: "close_combobox" });
		}
	};

	return (
		<Popover open={state.open} onOpenChange={handleOpenChange}>
			{children}
		</Popover>
	);
}

export function ComboboxTrigger({
	children,
	asChild = false,
	className,
	...props
}: {
	children: React.ReactNode;
	asChild?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
	const { open } = useState();

	const Comp = asChild ? Slot : "button";

	return (
		<PopoverTrigger asChild>
			<Comp
				type="button"
				// biome-ignore lint/a11y/useSemanticElements: use combobox here, select can not search items
				role="combobox"
				aria-controls="combobox-content"
				aria-expanded={open}
				className={cn(
					"w-[200px] justify-between flex flex-row items-center border border-slate-200 rounded-md px-2 py-1 text-slate-800",
					className,
				)}
				{...props}
			>
				{children}
			</Comp>
		</PopoverTrigger>
	);
}

export function ComboboxValue({
	placeholder,
}: {
	placeholder: React.ReactNode;
}) {
	const { isPending, isSuccess, selectedItemValues, registeredItems } =
		useState();
	const dispatch = useDispatch();

	useEffect(() => {
		if (isSuccess) {
			const timeoutId = setTimeout(() => {
				dispatch({ action: "success_display_too_long" });
			}, 5000);

			return () => {
				clearTimeout(timeoutId);
			};
		}
	}, [isSuccess, dispatch]);

	const selectedItems = registeredItems.filter((item) =>
		selectedItemValues.includes(item.value),
	);

	const hasSelection = selectedItems.length > 0;
	const additionalCount = selectedItems.length - 1;

	return (
		<>
			<p
				className={cn(
					"flex flex-row gap-2 items-center",
					isPending && "animate-pulse",
				)}
			>
				{hasSelection ? (
					<span className="flex flex-row gap-1 items-center">
						{selectedItems[0].display}
						{additionalCount > 0 && (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<span className="text-slate-500 bg-slate-100 px-1 rounded text-xs">
											+{additionalCount}
										</span>
									</TooltipTrigger>
									<TooltipContent>
										<div className="flex flex-col gap-1">
											{selectedItems.slice(1).map((item) => (
												<div key={item.value}>{item.display}</div>
											))}
										</div>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</span>
				) : (
					placeholder
				)}

				{isPending && (
					<LoaderCircleIcon className="h-4 w-4 animate-spin text-slate-500" />
				)}

				{isSuccess && <CheckIcon className="h-4 w-4 text-emerald-500" />}
			</p>

			<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</>
	);
}

export function ComboboxContent({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const { open } = useState();

	if (!open) {
		return (
			<div className="hidden">
				<Command>{children}</Command>
			</div>
		);
	}

	return (
		<PopoverContent className={cn("p-0 bg-white", className)}>
			<Command>{children}</Command>
		</PopoverContent>
	);
}

export function ComboboxInput({
	placeholder,
}: {
	placeholder: string;
}) {
	return <CommandInput placeholder={placeholder} />;
}

export function ComboboxEmpty({
	children,
}: {
	children: React.ReactNode;
}) {
	return <CommandEmpty>{children}</CommandEmpty>;
}

export function ComboboxList({ children }: { children: React.ReactNode }) {
	return <CommandList>{children}</CommandList>;
}

export function ComboboxGroup({ children }: { children: React.ReactNode }) {
	return <CommandGroup>{children}</CommandGroup>;
}

export function ComboboxItem({
	children,
	value,
	className,
}: {
	children: React.ReactNode;
	value: string;
	className?: string;
}) {
	const state = useState();
	const { selectedItemValues, multiple } = state;

	// Register this item
	useRegisterItem(value, children);

	const dispatch = useDispatch();
	const handleSelectItem = useActionSelectItem();
	const [, startTransition] = useTransition();

	const isSelected = selectedItemValues.includes(value);

	const handleSelect = () => {
		dispatch({
			action: "select_item",
			itemValue: value,
		});

		startTransition(async () => {
			dispatch({ action: "finished_action_select_item" });

			// Calculate the new selected values based on the current state
			let updatedValues: string[];
			if (multiple) {
				if (isSelected) {
					updatedValues = selectedItemValues.filter((v) => v !== value);
				} else {
					updatedValues = [...selectedItemValues, value];
				}
			} else {
				updatedValues = [value];
			}

			await handleSelectItem(updatedValues);
		});
	};

	return (
		<CommandItem onSelect={handleSelect} value={value} className={className}>
			<Check className={cn("mr-2 h-4 w-4", !isSelected && "invisible")} />
			<div data-value={`combobox-item-${value}`}>{children}</div>
		</CommandItem>
	);
}
