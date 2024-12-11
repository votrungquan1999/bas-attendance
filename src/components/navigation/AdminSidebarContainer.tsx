"use client";

import { useState, createContext, useContext } from "react";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "src/shadcn/lib/utils";

interface SidebarProviderProps {
	children: React.ReactNode;
}

interface AdminSidebarRootProps {
	children: React.ReactNode;
}

export const SidebarContext = createContext<boolean | null>(null);

export function SidebarProvider({ children }: SidebarProviderProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);

	return (
		<SidebarContext.Provider value={isCollapsed}>
			<SidebarDispatchContext.Provider value={setIsCollapsed}>
				{children}
			</SidebarDispatchContext.Provider>
		</SidebarContext.Provider>
	);
}

export const SidebarDispatchContext = createContext<
	((value: boolean) => void) | null
>(null);

export function AdminSidebarRoot({ children }: AdminSidebarRootProps) {
	const isCollapsed = useSidebarCollapsed();
	const setIsCollapsed = useSidebarDispatch();

	return (
		<div className="fixed inset-y-0 left-0 z-30">
			<div
				className={cn(
					"h-full overflow-hidden transition-[width] duration-300 ease-in-out",
					isCollapsed ? "w-14" : "w-64",
				)}
			>
				{children}
			</div>
			<button
				type="button"
				onClick={() => setIsCollapsed(!isCollapsed)}
				className="absolute -right-6 top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow-lg transition-colors hover:bg-slate-800 hover:text-slate-200"
				aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
			>
				{isCollapsed ? (
					<PanelLeft className="h-6 w-6" />
				) : (
					<PanelLeftClose className="h-6 w-6" />
				)}
			</button>
		</div>
	);
}

export const useSidebarCollapsed = () => {
	const isCollapsed = useContext(SidebarContext);

	if (isCollapsed === null) {
		throw new Error(
			"useSidebarCollapsed must be used within a SidebarContext.Provider",
		);
	}

	return isCollapsed;
};

export const useSidebarDispatch = () => {
	const dispatch = useContext(SidebarDispatchContext);

	if (dispatch === null) {
		throw new Error(
			"useSidebarDispatch must be used within a SidebarDispatchContext.Provider",
		);
	}

	return dispatch;
};
