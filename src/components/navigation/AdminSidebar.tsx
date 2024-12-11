import { BarChart3, Settings, ArrowLeft } from "lucide-react";
import { AdminNavLink } from "./AdminNavLink";

export default function AdminSidebar() {
	return (
		<div className="flex h-full flex-col bg-slate-900">
			<div className="@container/sidebar flex h-full flex-col">
				<div className="flex flex-col flex-1 gap-2 p-2">
					<div className="flex h-16 items-center border-b border-slate-700 px-2">
						<h1 className="w-full whitespace-nowrap text-lg font-semibold text-white opacity-0 transition-opacity duration-300 @[12rem]/sidebar:opacity-100">
							Admin Panel
						</h1>
					</div>

					<nav className="flex flex-1 flex-col gap-2 pt-2">
						<AdminNavLink
							href="/attendance"
							icon={<ArrowLeft className="h-4 w-4" />}
						>
							Back to Attendance
						</AdminNavLink>

						<div className="mt-6">
							<div className="mb-3 flex h-6 items-center px-2 text-xs font-medium uppercase text-slate-400">
								<span className="whitespace-nowrap opacity-0 transition-opacity duration-300 @[12rem]/sidebar:opacity-100">
									Admin Menu
								</span>
							</div>
							<div className="space-y-2">
								<AdminNavLink
									href="/admin/attendance/by-week"
									icon={<BarChart3 className="h-4 w-4" />}
								>
									Attendance Summary
								</AdminNavLink>
								<AdminNavLink
									href="/admin/settings"
									icon={<Settings className="h-4 w-4" />}
								>
									Settings
								</AdminNavLink>
							</div>
						</div>
					</nav>
				</div>
			</div>
		</div>
	);
}
