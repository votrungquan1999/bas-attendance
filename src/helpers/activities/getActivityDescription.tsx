import type { CompletedActivity } from "src/server/types";

export default function getActivityDescription(
	activity: CompletedActivity,
): string {
	switch (activity.activity) {
		case "30-minutes-session":
			if (activity.thirtyMinActivity === "probability-practice") {
				const levelMap = {
					"1": "Beginner",
					"2": "Intermediate",
					"3": "Advanced",
					"4": "Elite",
				};
				const practiceTypeMap = {
					layup: "Layup Practice",
					"straight-shot": "Straight Shot",
					"attack-board": "Backboard Finish",
				};
				return `${practiceTypeMap[activity.practiceType]} (Level ${activity.practiceLevel} - ${levelMap[activity.practiceLevel]}) - ${activity.practiceDescription}`;
			}
			if (
				activity.thirtyMinActivity === "personal-technique" ||
				activity.thirtyMinActivity === "buddy-training"
			) {
				const activityTypeMap = {
					"personal-technique": "Individual Training",
					"buddy-training": "Partner Practice",
				};
				return `${activityTypeMap[activity.thirtyMinActivity]}: ${activity.thirtyMinExplanation}`;
			}
			return `30 Min: ${activity.thirtyMinActivity}`;
		case "endurance-run":
			return `Endurance Run: ${activity.laps} laps in ${activity.minutes} minutes`;
		case "normal-long-session": {
			const sessionTypeMap = {
				"train-newbies": "Train for newbies",
				"train-with-coach": "Coach-led Training",
				others: "Team Activity",
			};
			if (activity.sessionType === "others") {
				return `Team Activity: ${activity.sessionExplanation}`;
			}
			return sessionTypeMap[activity.sessionType];
		}
	}
}
