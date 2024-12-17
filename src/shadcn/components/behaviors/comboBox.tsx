"use client";

import {
	Check,
	CheckIcon,
	ChevronsUpDown,
	LoaderCircleIcon,
} from "lucide-react";

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
import { createReducerContext } from "src/components/reducerContext";
import { createContext, useContext, useEffect, useTransition } from "react";

type ActionType =
	| {
			action: "open_combobox";
	  }
	| {
			action: "close_combobox";
	  }
	| {
			action: "select_item";
			itemKey: string;
			itemDisplay: React.ReactNode;
	  }
	| {
			action: "finished_action_select_item";
	  }
	| {
			action: "success_display_too_long";
	  };

type StateType = {
	open: boolean;
	selectedItemKey: string;
	selectedItemDisplay: React.ReactNode;
	isPending: boolean;
	isSuccess: boolean;
};

const initialState: StateType = {
	open: false,
	selectedItemKey: "",
	selectedItemDisplay: null,
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
		case "select_item":
			return {
				...state,
				open: false,
				isPending: true,
				selectedItemKey: action.itemKey,
				selectedItemDisplay: action.itemDisplay,
			};
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
	((key: string) => Promise<void>) | null
>(null);

function useActionSelectItem() {
	const context = useContext(ActionSelectItemContext);

	if (context === null) {
		throw new Error("useActionSelectItem must be used within a ComboboxRoot");
	}

	return context;
}

export function ComboboxRoot({
	children,
	defaultSelectedItemKey,
	handleSelectItem,
}: {
	children: React.ReactNode;
	defaultSelectedItemKey: string;
	handleSelectItem: (key: string) => Promise<void>;
}) {
	return (
		<ActionSelectItemContext.Provider value={handleSelectItem}>
			<ReducerContextProvider
				value={{
					open: false,
					selectedItemKey: defaultSelectedItemKey,
					selectedItemDisplay: null,
					isPending: false,
					isSuccess: false,
				}}
			>
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
	placeholder,
	className,
}: {
	placeholder: React.ReactNode;
	className?: string;
}) {
	const { isPending, isSuccess, open, selectedItemDisplay } = useState();
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

	return (
		<PopoverTrigger asChild>
			<button
				type="button"
				// biome-ignore lint/a11y/useSemanticElements: use combobox here, select can not search items
				role="combobox"
				aria-controls="combobox-content"
				aria-expanded={open}
				className={cn(
					"w-[200px] justify-between flex flex-row items-center border border-slate-200 rounded-md px-2 py-1 text-slate-800",
					className,
				)}
			>
				<p
					className={cn(
						"flex flex-row gap-2 items-center",
						isPending && "animate-pulse",
					)}
				>
					{selectedItemDisplay ? selectedItemDisplay : placeholder}

					{isPending && (
						<LoaderCircleIcon className="h-4 w-4 animate-spin text-slate-500" />
					)}

					{isSuccess && <CheckIcon className="h-4 w-4 text-emerald-500" />}
				</p>

				<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</button>
		</PopoverTrigger>
	);
}

export function ComboboxContent({
	children,
	inputPlaceholder,
	emptyNode,
	className,
}: {
	children: React.ReactNode;
	inputPlaceholder: string;
	emptyNode: React.ReactNode;
	className?: string;
}) {
	return (
		<PopoverContent className={cn("p-0 bg-white", className)}>
			<Command>
				<CommandInput placeholder={inputPlaceholder} />
				<CommandEmpty>{emptyNode}</CommandEmpty>

				<CommandList>{children}</CommandList>
			</Command>
		</PopoverContent>
	);
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
	const { selectedItemKey } = useState();

	const dispatch = useDispatch();

	const handleSelectItem = useActionSelectItem();

	const [, startTransition] = useTransition();

	const handleSelect = () => {
		dispatch({
			action: "select_item",
			itemKey: value,
			itemDisplay: children,
		});

		startTransition(async () => {
			dispatch({ action: "finished_action_select_item" });

			await handleSelectItem(value);
		});
	};

	return (
		<CommandItem onSelect={handleSelect} value={value} className={className}>
			<Check
				className={cn("mr-2 h-4 w-4", value !== selectedItemKey && "invisible")}
			/>
			{children}
		</CommandItem>
	);
}
