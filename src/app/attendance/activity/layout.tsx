import { ActivityProvider } from "./ActivityContext";
import type { Metadata } from "next";
import query_getTakerFromCookies from "../../../server/queries/query_getTakerFromCookies";
import action_resetTaker from "../../../server/actions/action_resetTaker";

export const metadata: Metadata = {
	title: "Basketball Attendance - Add New Activity",
};

export default async function ActivityLayout({
	children,
}: { children: React.ReactNode }) {
	const athlete = await query_getTakerFromCookies();

	return (
		<main className="flex-1 bg-gray-50 relative">
			<header className="bg-white shadow-sm">
				<div className="max-w-2xl mx-auto px-6 py-8">
					<h1 className="text-2xl font-bold text-slate-600 mb-2 font-inter">
						Hello{" "}
						<span className="font-satisfy text-4xl text-blue-600">
							{athlete.name}
						</span>
						! 👋
					</h1>
					<h2 className="text-xl text-gray-600 font-inter">
						What have you trained today?
					</h2>
					<form action={action_resetTaker} className="mt-4">
						<button
							type="submit"
							className="text-sm text-gray-500 hover:text-gray-700 underline"
						>
							Not {athlete.name}? Click here to switch user
						</button>
					</form>
				</div>
			</header>

			<ActivityProvider>{children}</ActivityProvider>
		</main>
	);
}
