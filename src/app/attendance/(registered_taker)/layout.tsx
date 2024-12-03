import Link from "next/link";
import { Trophy, PlusCircle, History } from "lucide-react";

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

function NavLink({
	href,
	label,
	icon: Icon,
	isActive,
	primary,
}: {
	href: string;
	label: string;
	icon: React.ElementType;
	isActive: boolean;
	primary?: boolean;
}) {
	return (
		<Link
			href={href}
			className={`flex flex-col items-center p-3 sm:flex-row sm:gap-2 sm:px-4 sm:py-2 
        rounded-md transition-colors ${
					primary
						? "text-blue-600 hover:text-blue-700"
						: isActive
							? "text-blue-600"
							: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
				}`}
		>
			<Icon
				className={`h-6 w-6 sm:h-4 sm:w-4 ${primary ? "sm:h-5 sm:w-5" : ""}`}
			/>
			<span className="hidden sm:inline text-sm font-medium">{label}</span>
		</Link>
	);
}

function Navigation({ pathname }: { pathname: string }) {
	return (
		<>
			{/* Desktop Navigation - Top Tabs */}
			<nav className="hidden sm:block border-b bg-white">
				<div className="max-w-4xl mx-auto px-4">
					<div className="flex justify-center space-x-1 py-2">
						{navItems.map((item) => (
							<NavLink
								key={item.href}
								{...item}
								isActive={pathname.startsWith(item.href)}
							/>
						))}
					</div>
				</div>
			</nav>

			{/* Mobile Navigation - Bottom Bar */}
			<nav className="sm:hidden fixed bottom-9 left-0 right-0 border-t bg-white z-10">
				<div className="flex justify-around items-center">
					{navItems.map((item) => (
						<NavLink
							key={item.href}
							{...item}
							isActive={pathname.startsWith(item.href)}
						/>
					))}
				</div>
			</nav>
		</>
	);
}

export default function AttendanceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = "/attendance/activity";

	return (
		<div className="bg-gray-50 flex-1 flex flex-col relative">
			<Navigation pathname={pathname} />

			<main className="flex-1">{children}</main>

			{/* Navigation Placeholder for Mobile */}
			<div className="sm:hidden h-[52px]" />
		</div>
	);
}
