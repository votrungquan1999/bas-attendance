"use client";

import { useEffect, useState } from "react";
import { useTransition } from "react";
import { useWeeklyGoals } from "./WeeklyGoalsProvider";
import { Loader2 } from "lucide-react";
import { Check } from "lucide-react";
import { action_saveWeeklyGoal } from "src/server/actions/action_saveWeeklyGoal";
import type { WeekId } from "src/server/collections";

export default function SaveWeeklyGoalButton({ weekId }: { weekId: WeekId }) {
	const { state } = useWeeklyGoals();

	const [pending, startTransition] = useTransition();
	const [lastPending, setLastPending] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	if (lastPending !== pending) {
		setIsSuccess(!pending);
		setLastPending(pending);
	}

	useEffect(() => {
		if (isSuccess) {
			setTimeout(() => {
				setIsSuccess(false);
			}, 5000);
		}
	}, [isSuccess]);

	async function handleSubmit() {
		startTransition(async () => {
			await action_saveWeeklyGoal(state, weekId);
		});
	}

	return (
		<button
			type="button"
			className="bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2 px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
			onClick={handleSubmit}
			disabled={pending}
		>
			{(() => {
				if (isSuccess) return "Saved!";
				if (pending) return "Saving...";
				return "Save Goals";
			})()}
			{pending && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
			{isSuccess && <Check className="w-4 h-4 ml-2" />}
		</button>
	);
}
