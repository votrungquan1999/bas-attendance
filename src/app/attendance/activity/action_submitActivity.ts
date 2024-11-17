"use server";

import type { ActivityState } from "./ActivityContext";
import { isActivityComplete } from "./activityValidation";
import { MongoClient } from "mongodb";
import type { BaseCompletedActivity, CompletedActivity } from "./types";

const mongoUrl = process.env.MONGO_URL ?? "mongodb://localhost:27017";

function createCompletedActivity(
	state: CompletedActivity,
	attendanceId: string,
): CompletedActivity {
	const baseActivity: BaseCompletedActivity = {
		attendanceId,
		submittedAt: Date.now(),
	};

	switch (state.activity) {
		case "30-minutes-session":
			if (state.thirtyMinActivity === "probability-practice") {
				return {
					...baseActivity,
					activity: "30-minutes-session",
					thirtyMinActivity: "probability-practice",
					practiceType: state.practiceType,
					practiceLevel: state.practiceLevel,
					practiceDescription: state.practiceDescription,
				};
			}
			return {
				...baseActivity,
				activity: "30-minutes-session",
				thirtyMinActivity: state.thirtyMinActivity,
				thirtyMinExplanation: state.thirtyMinExplanation,
			};

		case "endurance-run":
			return {
				...baseActivity,
				activity: "endurance-run",
				laps: state.laps,
				minutes: state.minutes,
			};

		case "normal-long-session":
			if (state.sessionType === "others") {
				return {
					...baseActivity,
					activity: "normal-long-session",
					sessionType: "others",
					sessionExplanation: state.sessionExplanation,
				};
			}
			return {
				...baseActivity,
				activity: "normal-long-session",
				sessionType: state.sessionType,
			};

		default:
			throw new Error("Invalid activity state");
	}
}

export default async function action_submitActivity(
	state: ActivityState,
	attendanceId: string,
) {
	"use server";
	if (!isActivityComplete(state)) return;

	const client = await MongoClient.connect(mongoUrl);
	const db = client.db("attendances");

	const completedActivity = createCompletedActivity(state, attendanceId);

	try {
		await db.collection("activities").insertOne(completedActivity);
	} finally {
		await client.close();
	}
}
