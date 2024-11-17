import AddNewActivitySection from "./AddNewActivitySection";
import { getRegisterTake } from "./getRegisterTake";
import { redirect } from "next/navigation";
import { getTakers } from "../taker/getTakers";
import { cookies } from "next/headers";

async function action_resetTaker() {
	"use server";

	const cookieStore = await cookies();

	cookieStore.delete("taker");

	redirect("/attendance");
}

export default async function ActivityPage() {
	const takerId = await getRegisterTake();

	if (!takerId) {
		redirect("/attendance");
	}

	const takers = await getTakers();

	const athlete = takers.find((taker) => taker.id === takerId);

	if (!athlete) {
		return action_resetTaker();
	}

	return (
		<main className="min-h-screen bg-gray-50 flex-1">
			<header className="bg-white shadow-sm">
				<div className="max-w-2xl mx-auto px-6 py-8">
					<h1 className="text-2xl font-bold text-slate-600 mb-2 font-inter">
						Hello{" "}
						<span className="font-satisfy text-4xl text-blue-600">
							{athlete.value}
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
							Not {athlete.value}? Click here to switch user
						</button>
					</form>
				</div>
			</header>

			<AddNewActivitySection attendanceId={takerId} />
		</main>
	);
}
