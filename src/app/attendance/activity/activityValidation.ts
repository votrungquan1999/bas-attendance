import type { ActivityState } from "./ActivityContext";
import type { CompletedActivity } from "./types";

export const isActivityComplete = (
	state: ActivityState,
): state is CompletedActivity => {
	switch (state.activity) {
		case "30-minutes-session":
			if (!state.thirtyMinActivity) return false;
			if (state.thirtyMinActivity === "probability-practice") {
				return !!(
					state.practiceType &&
					state.practiceLevel &&
					state.practiceDescription
				);
			}
			return !!state.thirtyMinExplanation;

		case "endurance-run":
			return !!state.laps && !!state.minutes;

		case "normal-long-session":
			if (!state.sessionType) return false;
			if (state.sessionType === "others") {
				return !!state.sessionExplanation;
			}
			return true;

		default:
			return false;
	}
};
