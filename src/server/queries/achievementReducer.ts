import type { CompletedActivity, CompletedEnduranceRun } from "../types";
import { WEEKLY_GOALS } from "../constants";
import { DateTime } from "luxon";

export interface WeeklyProgress {
	enduranceRun: number;
	personalTechnique: number;
	probabilityPractice: number;
	buddyTraining: number;
}

export interface WeekCompletion {
	weekKey: string;
	isAttendanceCompleted: boolean;
	isRunningCompleted: boolean;
}

export interface AchievementState {
	currentWeek: string;
	weeklyActivities: WeeklyProgress;
	streaks: {
		currentAttendanceStreak: number;
		bestAttendanceStreak: number;
		currentRunningStreak: number;
		bestRunningStreak: number;
		lastAttendanceStreakWeek: string | null;
		lastRunningStreakWeek: string | null;
	};
	bestRun: {
		minutesPerLap: number;
		laps: number;
		minutes: number;
		timestamp: number;
	};
}

function getWeekKey(timestamp: number): string {
	const dt = DateTime.fromMillis(timestamp, { zone: "Asia/Saigon" });
	return `${dt.year}-${dt.weekNumber}`;
}

function isWeekCompleted(activities: WeeklyProgress): boolean {
	return (
		activities.personalTechnique >= WEEKLY_GOALS.thirtyMin.personalTechnique &&
		activities.probabilityPractice >=
			WEEKLY_GOALS.thirtyMin.probabilityPractice &&
		activities.buddyTraining >= WEEKLY_GOALS.thirtyMin.buddyTraining
	);
}

function isRunningWeekCompleted(activities: WeeklyProgress): boolean {
	return activities.enduranceRun >= WEEKLY_GOALS.enduranceRun;
}

function updateStreaks(
	state: AchievementState,
	weekKey: string,
	isAttendanceCompleted: boolean,
	isRunningCompleted: boolean,
): AchievementState["streaks"] {
	// Calculate attendance streak
	let currentAttendanceStreak = state.streaks.currentAttendanceStreak;
	if (isAttendanceCompleted) {
		currentAttendanceStreak = state.streaks.currentAttendanceStreak + 1;
	} else {
		currentAttendanceStreak = 0;
	}

	// Calculate running streak
	let currentRunningStreak = state.streaks.currentRunningStreak;
	if (isRunningCompleted) {
		currentRunningStreak = state.streaks.currentRunningStreak + 1;
	} else {
		currentRunningStreak = 0;
	}

	return {
		currentAttendanceStreak,
		bestAttendanceStreak: Math.max(
			currentAttendanceStreak,
			state.streaks.bestAttendanceStreak,
		),
		currentRunningStreak,
		bestRunningStreak: Math.max(
			currentRunningStreak,
			state.streaks.bestRunningStreak,
		),
		lastAttendanceStreakWeek: isAttendanceCompleted
			? weekKey
			: state.streaks.lastAttendanceStreakWeek,
		lastRunningStreakWeek: isRunningCompleted
			? weekKey
			: state.streaks.lastRunningStreakWeek,
	};
}

export function achievementReducer(
	state: AchievementState,
	activity: CompletedActivity,
): AchievementState {
	const weekKey = getWeekKey(activity.activityTimestamp);

	// Handle week transition
	if (weekKey !== state.currentWeek) {
		const wasLastWeekAttendanceCompleted = isWeekCompleted(
			state.weeklyActivities,
		);
		const wasLastWeekRunningCompleted = isRunningWeekCompleted(
			state.weeklyActivities,
		);

		return achievementReducer(
			{
				...state,
				currentWeek: weekKey,
				weeklyActivities: {
					enduranceRun: 0,
					personalTechnique: 0,
					probabilityPractice: 0,
					buddyTraining: 0,
				},
				streaks: updateStreaks(
					state,
					weekKey,
					wasLastWeekAttendanceCompleted,
					wasLastWeekRunningCompleted,
				),
			},
			activity,
		);
	}

	// Update activity counts
	const weeklyActivities = { ...state.weeklyActivities };

	if (activity.activity === "endurance-run") {
		const runActivity = activity as CompletedEnduranceRun;
		weeklyActivities.enduranceRun++;

		// Parse string numbers to numbers
		const laps = Number(runActivity.laps);
		const minutes = Number(runActivity.minutes);

		const newState = {
			...state,
			weeklyActivities,
		};

		// Update best run if current run is better and numbers are valid
		if (Number.isFinite(laps) && Number.isFinite(minutes) && laps > 0) {
			const currentMinutesPerLap = minutes / laps;
			if (
				!state.bestRun.minutesPerLap ||
				currentMinutesPerLap < state.bestRun.minutesPerLap
			) {
				newState.bestRun = {
					minutesPerLap: currentMinutesPerLap,
					laps,
					minutes,
					timestamp: runActivity.activityTimestamp,
				};
			}
		}

		// Check if this activity completes the running goal
		const isRunningCompleted = isRunningWeekCompleted(weeklyActivities);
		if (isRunningCompleted) {
			newState.streaks = {
				...state.streaks,
				currentRunningStreak:
					state.streaks.lastRunningStreakWeek === weekKey
						? state.streaks.currentRunningStreak
						: state.streaks.currentRunningStreak + 1,
				bestRunningStreak: Math.max(
					state.streaks.currentRunningStreak + 1,
					state.streaks.bestRunningStreak,
				),
				lastRunningStreakWeek: weekKey,
				currentAttendanceStreak: state.streaks.currentAttendanceStreak,
				bestAttendanceStreak: state.streaks.bestAttendanceStreak,
				lastAttendanceStreakWeek: state.streaks.lastAttendanceStreakWeek,
			};
		}

		return newState;
	}

	if (
		activity.activity === "30-minutes-session" &&
		"thirtyMinActivity" in activity
	) {
		switch (activity.thirtyMinActivity) {
			case "personal-technique":
				weeklyActivities.personalTechnique++;
				break;
			case "probability-practice":
				weeklyActivities.probabilityPractice++;
				break;
			case "buddy-training":
				weeklyActivities.buddyTraining++;
				break;
		}

		const newState = {
			...state,
			weeklyActivities,
		};

		// Check if this activity completes the attendance goal
		const isAttendanceCompleted = isWeekCompleted(weeklyActivities);
		if (isAttendanceCompleted) {
			newState.streaks = {
				...state.streaks,
				currentAttendanceStreak:
					state.streaks.lastAttendanceStreakWeek === weekKey
						? state.streaks.currentAttendanceStreak
						: state.streaks.currentAttendanceStreak + 1,
				bestAttendanceStreak: Math.max(
					state.streaks.currentAttendanceStreak + 1,
					state.streaks.bestAttendanceStreak,
				),
				lastAttendanceStreakWeek: weekKey,
				currentRunningStreak: state.streaks.currentRunningStreak,
				bestRunningStreak: state.streaks.bestRunningStreak,
				lastRunningStreakWeek: state.streaks.lastRunningStreakWeek,
			};
		}

		return newState;
	}

	return state;
}
