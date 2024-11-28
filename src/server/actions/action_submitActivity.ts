"use server";

import type { ActivityState } from "../../app/attendance/activity/ActivityContext";
import { isActivityComplete } from "../../app/attendance/activity/activityValidation";
import type {
	BaseCompletedActivity,
	CompletedActivity,
} from "../../app/attendance/activity/types";
import { nanoid } from "nanoid";
import getDB from "src/server/db";

function createCompletedActivity(
	state: CompletedActivity,
	attendanceId: string,
): CompletedActivity {
	const baseActivity: BaseCompletedActivity = {
		id: nanoid(),
		attendanceId,
		submittedAt: Date.now(),
		activityTimestamp: state.activityTimestamp,
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

	const { db, close } = await getDB();

	const completedActivity = createCompletedActivity(state, attendanceId);

	await db.collection("activities").insertOne(completedActivity);

	await close();
}
