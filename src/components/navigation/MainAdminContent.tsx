"use client";

import { cn } from "src/shadcn/lib/utils";
import { useSidebarCollapsed } from "./AdminSidebarContainer";

interface MainContentProps {
	children: React.ReactNode;
}

export function MainAdminContent({ children }: MainContentProps) {
	const isCollapsed = useSidebarCollapsed();

	return (
		<main
			className={cn(
				"flex-1 transition-[margin] duration-300 ease-in-out",
				isCollapsed ? "ml-14" : "ml-64",
			)}
		>
			{children}
		</main>
	);
}
