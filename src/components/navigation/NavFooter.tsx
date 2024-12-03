"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, PlusCircle, History } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "src/shadcn/components/ui/tooltip";

const navItems = [
	{
		label: "History",
		href: "/attendance/history",
		icon: History,
	},
	{
		label: "Activity",
		href: "/attendance/activity",
		icon: PlusCircle,
	},
	{
		label: "Achievements",
		href: "/attendance/achievement",
		icon: Trophy,
	},
];

function DesktopNav({ pathname }: { pathname: string }) {
	return (
		<div className="hidden sm:block fixed left-0 top-0 h-full">
			<div className="flex flex-col h-full py-8 px-4 bg-white border-r">
				<TooltipProvider delayDuration={0}>
					<div className="flex-1 flex flex-col items-center gap-8">
						{navItems.map((item) => (
							<Tooltip key={item.href}>
								<TooltipTrigger asChild>
									<Link href={item.href} className="group flex items-center">
										<div
											className={`p-3 rounded-xl transition-all ${
												pathname.startsWith(item.href)
													? "bg-blue-50 text-blue-600 shadow-sm"
													: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
											}`}
										>
											<item.icon className="h-5 w-5 transition-transform group-hover:scale-105" />
										</div>
									</Link>
								</TooltipTrigger>
								<TooltipContent side="right" sideOffset={10}>
									{item.label}
								</TooltipContent>
							</Tooltip>
						))}
					</div>
				</TooltipProvider>
			</div>
		</div>
	);
}

function MobileNav({ pathname }: { pathname: string }) {
	return (
		<nav className="sm:hidden fixed bottom-9 left-0 right-0 border-t bg-white z-10">
			<div className="flex justify-around items-center">
				{navItems.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className="flex flex-col items-center p-2"
					>
						<div
							className={`p-3 rounded-xl transition-all ${
								pathname.startsWith(item.href)
									? "bg-blue-50 text-blue-600 shadow-sm"
									: "text-gray-600"
							}`}
						>
							<item.icon
								className={`h-6 w-6 transition-transform ${
									pathname.startsWith(item.href)
										? "scale-110"
										: "hover:scale-105"
								}`}
							/>
						</div>
					</Link>
				))}
			</div>
		</nav>
	);
}

export default function NavFooter() {
	const pathname = usePathname();

	return (
		<>
			<DesktopNav pathname={pathname} />
			<MobileNav pathname={pathname} />
		</>
	);
}
