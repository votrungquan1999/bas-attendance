import { Suspense } from "react";
import Link from "next/link";
import { Trophy, PlusCircle, History } from "lucide-react";
import CodeAuthWrapper from "src/components/CodeAuthWrapper";
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
		primary: true,
	},
	{
		label: "Achievements",
		href: "/attendance/achievement",
		icon: Trophy,
	},
];

function DesktopNav() {
	return (
		<div className="hidden sm:block fixed left-0 top-0 h-full">
			<div className="flex flex-col h-full py-8 px-4 bg-white border-r">
				<TooltipProvider delayDuration={0}>
					<div className="flex-1 flex flex-col items-center gap-8">
						{navItems.map((item) => (
							<Tooltip key={item.href}>
								<TooltipTrigger asChild>
									<Link href={item.href} className="group flex items-center">
										<div className="p-3 rounded-xl transition-colors group-hover:bg-gray-100">
											<item.icon
												className={`h-5 w-5 transition-colors ${
													item.primary
														? "text-blue-500"
														: "text-gray-600 group-hover:text-gray-900"
												}`}
											/>
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

function MobileNav() {
	return (
		<nav className="sm:hidden fixed bottom-9 left-0 right-0 border-t bg-white z-10">
			<div className="flex justify-around items-center">
				{navItems.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className="flex flex-col items-center p-3"
					>
						<item.icon
							className={`h-6 w-6 transition-colors ${
								item.primary ? "text-blue-500" : "text-gray-600"
							}`}
						/>
					</Link>
				))}
			</div>
		</nav>
	);
}

export default function RegisteredTakerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="bg-gray-50 min-h-screen flex">
			<DesktopNav />
			<MobileNav />

			<main className="flex-1 sm:pl-[72px]">
				<Suspense fallback={<div>Loading...</div>}>
					<CodeAuthWrapper>{children}</CodeAuthWrapper>
				</Suspense>
			</main>

			{/* Navigation Placeholder for Mobile */}
			<div className="sm:hidden h-[52px]" aria-hidden="true" />
		</div>
	);
}
