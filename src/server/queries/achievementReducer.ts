import type {
	CompletedActivity,
	CompletedEnduranceRun,
	WeeklyGoals,
} from "../types";
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

export interface WeeklyGoalsMap {
	[weekKey: string]: WeeklyGoals;
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

function hasThirtyMinGoals(goals: WeeklyGoals): boolean {
	return (
		goals.thirtyMin.personalTechnique > 0 ||
		goals.thirtyMin.probabilityPractice > 0 ||
		goals.thirtyMin.buddyTraining > 0
	);
}

function hasRunningGoals(goals: WeeklyGoals): boolean {
	return goals.enduranceRun > 0;
}

function isWeekCompleted(
	activities: WeeklyProgress,
	goals: WeeklyGoals,
): boolean {
	// If there are no thirty-minute goals, consider it not completed
	if (!hasThirtyMinGoals(goals)) {
		return false;
	}

	return (
		activities.personalTechnique >= goals.thirtyMin.personalTechnique &&
		activities.probabilityPractice >= goals.thirtyMin.probabilityPractice &&
		activities.buddyTraining >= goals.thirtyMin.buddyTraining
	);
}

function isRunningWeekCompleted(
	activities: WeeklyProgress,
	goals: WeeklyGoals,
): boolean {
	// If there are no running goals, consider it not completed
	if (!hasRunningGoals(goals)) {
		return false;
	}

	return activities.enduranceRun >= goals.enduranceRun;
}

function updateStreaks(
	state: AchievementState,
	weekKey: string,
	isAttendanceCompleted: boolean,
	isRunningCompleted: boolean,
	currentWeekGoals: WeeklyGoals,
	previousWeekGoals?: WeeklyGoals,
): AchievementState["streaks"] {
	// Calculate attendance streak
	let currentAttendanceStreak = state.streaks.currentAttendanceStreak;
	const hasAttendanceGoals = hasThirtyMinGoals(currentWeekGoals);
	const hadAttendanceGoals = previousWeekGoals
		? hasThirtyMinGoals(previousWeekGoals)
		: true;

	if (isAttendanceCompleted && hasAttendanceGoals) {
		currentAttendanceStreak = state.streaks.currentAttendanceStreak + 1;
	} else if (hadAttendanceGoals && !isAttendanceCompleted) {
		currentAttendanceStreak = 0;
	}

	// Calculate running streak
	let currentRunningStreak = state.streaks.currentRunningStreak;
	const hasCurrentRunningGoals = hasRunningGoals(currentWeekGoals);
	const hadPreviousRunningGoals = previousWeekGoals
		? hasRunningGoals(previousWeekGoals)
		: true;

	if (isRunningCompleted && hasCurrentRunningGoals) {
		currentRunningStreak = state.streaks.currentRunningStreak + 1;
	} else if (hadPreviousRunningGoals && !isRunningCompleted) {
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
		lastAttendanceStreakWeek:
			isAttendanceCompleted && hasAttendanceGoals
				? weekKey
				: state.streaks.lastAttendanceStreakWeek,
		lastRunningStreakWeek:
			isRunningCompleted && hasCurrentRunningGoals
				? weekKey
				: state.streaks.lastRunningStreakWeek,
	};
}

export function achievementReducer(
	state: AchievementState,
	activity: CompletedActivity,
	goalsMap: WeeklyGoalsMap,
): AchievementState {
	const weekKey = getWeekKey(activity.activityTimestamp);
	const currentWeekGoals = goalsMap[weekKey];

	if (!currentWeekGoals) {
		throw new Error(`No goals found for week ${weekKey}`);
	}

	// Handle week transition
	if (weekKey !== state.currentWeek && state.currentWeek) {
		const previousWeekGoals = goalsMap[state.currentWeek];
		if (!previousWeekGoals) {
			throw new Error(`No goals found for previous week ${state.currentWeek}`);
		}

		const wasLastWeekAttendanceCompleted = isWeekCompleted(
			state.weeklyActivities,
			previousWeekGoals,
		);
		const wasLastWeekRunningCompleted = isRunningWeekCompleted(
			state.weeklyActivities,
			previousWeekGoals,
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
					currentWeekGoals,
					previousWeekGoals,
				),
			},
			activity,
			goalsMap,
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
			currentWeek: weekKey,
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
		const isRunningCompleted = isRunningWeekCompleted(
			weeklyActivities,
			currentWeekGoals,
		);
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
			currentWeek: weekKey,
			weeklyActivities,
		};

		// Check if this activity completes the attendance goal
		const isAttendanceCompleted = isWeekCompleted(
			weeklyActivities,
			currentWeekGoals,
		);
		if (isAttendanceCompleted) {
			newState.streaks = updateStreaks(
				state,
				weekKey,
				true,
				false,
				currentWeekGoals,
			);
		}

		return newState;
	}

	return {
		...state,
		currentWeek: weekKey,
	};
}
