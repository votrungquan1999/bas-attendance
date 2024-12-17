"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "src/shadcn/lib/utils";
import type { ReactNode } from "react";

interface AdminNavLinkProps {
	href: string;
	icon: ReactNode;
	children: React.ReactNode;
}

export function AdminNavLink({ href, icon, children }: AdminNavLinkProps) {
	const pathname = usePathname();
	const isActive = pathname.startsWith(href);

	return (
		<Link
			href={href}
			className={cn(
				"flex h-10 min-w-0 items-center gap-4 rounded-md px-3 text-sm transition-colors text-slate-200 hover:bg-slate-800 hover:text-white",
				isActive && "bg-slate-600 text-white",
			)}
		>
			<div className="flex h-6 w-4 items-center justify-center">{icon}</div>
			<span className="whitespace-nowrap opacity-0 transition-opacity duration-300 @[12rem]/sidebar:opacity-100">
				{children}
			</span>
		</Link>
	);
}
