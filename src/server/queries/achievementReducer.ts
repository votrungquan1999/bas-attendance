import type { CompletedActivity, WeeklyGoals } from "../types";
import { DateTime } from "luxon";
import { cloneDeep } from "lodash";

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
	lastActivityId: string | null;
}

export class NoGoalsFoundError extends Error {
	weekKey: string;

	constructor(weekKey: string) {
		super(`No goals found for week ${weekKey}`);
		this.weekKey = weekKey;
	}
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
	return activities.enduranceRun >= goals.enduranceRun;
}

function handleFirstActivity(
	state: AchievementState,
	newWeekKey: string,
	activity: CompletedActivity,
	goalsMap: WeeklyGoalsMap,
): AchievementState {
	// First set up the initial state for the new week
	const newState = cloneDeep(state);
	newState.currentWeek = newWeekKey;
	newState.weeklyActivities = {
		enduranceRun: 0,
		personalTechnique: 0,
		probabilityPractice: 0,
		buddyTraining: 0,
	};

	// Then process the activity in the new week
	return achievementReducer(newState, activity, goalsMap);
}

function handleWeekTransition(
	state: AchievementState,
	newWeekKey: string,
	activity: CompletedActivity,
	goalsMap: WeeklyGoalsMap,
): AchievementState {
	const newState = cloneDeep(state);
	const prevWeekGoals = goalsMap[state.currentWeek];

	// if the previous week has thirty-minute goals and does not meet them, reset the attendance streak
	if (
		hasThirtyMinGoals(prevWeekGoals) &&
		!isWeekCompleted(state.weeklyActivities, prevWeekGoals)
	) {
		newState.streaks.currentAttendanceStreak = 0;
		newState.streaks.lastAttendanceStreakWeek = null;
	}

	// if the previous week has running goals and does not meet them, reset the running streak
	if (
		hasRunningGoals(prevWeekGoals) &&
		!isRunningWeekCompleted(state.weeklyActivities, prevWeekGoals)
	) {
		newState.streaks.currentRunningStreak = 0;
		newState.streaks.lastRunningStreakWeek = null;
	}

	// Reset weekly activities for new week
	const stateAfterTransition = cloneDeep(newState);
	stateAfterTransition.currentWeek = newWeekKey;
	stateAfterTransition.weeklyActivities = {
		enduranceRun: 0,
		personalTechnique: 0,
		probabilityPractice: 0,
		buddyTraining: 0,
	};

	// Then process the activity in the new week
	return achievementReducer(stateAfterTransition, activity, goalsMap);
}

export function achievementReducer(
	state: AchievementState,
	activity: CompletedActivity,
	goalsMap: WeeklyGoalsMap,
): AchievementState {
	const weekKey = getWeekKey(activity.activityTimestamp);
	const goals = goalsMap[weekKey];

	if (!goals) {
		throw new NoGoalsFoundError(weekKey);
	}

	if (state.currentWeek === "") {
		return handleFirstActivity(state, weekKey, activity, goalsMap);
	}

	// Handle week transition first
	if (weekKey !== state.currentWeek) {
		return handleWeekTransition(state, weekKey, activity, goalsMap);
	}

	// Initialize new state for current week activity
	const newState = cloneDeep(state);
	newState.lastActivityId = activity.id;

	// Handle endurance run activity
	if (activity.activity === "endurance-run") {
		const runActivity = activity;
		const laps = Number.parseInt(runActivity.laps);
		const minutes = Number.parseInt(runActivity.minutes);
		const minutesPerLap = minutes / laps;

		// Update weekly activities
		newState.weeklyActivities.enduranceRun++;

		// Update best run if current run is better (lower minutes per lap)
		if (
			state.bestRun.minutesPerLap === 0 ||
			minutesPerLap < state.bestRun.minutesPerLap
		) {
			newState.bestRun = {
				minutesPerLap,
				laps,
				minutes,
				timestamp: activity.activityTimestamp,
			};
		}

		// if the week has no running goals, don't update the streak
		if (!hasRunningGoals(goals)) {
			return newState;
		}

		// Check if this activity completes the running goals
		if (isRunningWeekCompleted(newState.weeklyActivities, goals)) {
			// Only update streak if we haven't already counted this week
			if (newState.streaks.lastRunningStreakWeek !== weekKey) {
				newState.streaks.currentRunningStreak++;
				newState.streaks.bestRunningStreak = Math.max(
					newState.streaks.currentRunningStreak,
					newState.streaks.bestRunningStreak,
				);
				newState.streaks.lastRunningStreakWeek = weekKey;
			}
		}
	}
	// Handle 30-minute session activity
	else if (activity.activity === "30-minutes-session") {
		switch (activity.thirtyMinActivity) {
			case "personal-technique":
				newState.weeklyActivities.personalTechnique++;
				break;
			case "buddy-training":
				newState.weeklyActivities.buddyTraining++;
				break;
			case "probability-practice":
				newState.weeklyActivities.probabilityPractice++;
				break;
		}

		// if the week has no thirty-minute goals, don't update the streak
		if (!hasThirtyMinGoals(goals)) {
			return newState;
		}

		// Check if this activity completes the week's goals
		if (isWeekCompleted(newState.weeklyActivities, goals)) {
			// Only update streak if we haven't already counted this week
			if (newState.streaks.lastAttendanceStreakWeek !== weekKey) {
				newState.streaks.currentAttendanceStreak++;
				newState.streaks.bestAttendanceStreak = Math.max(
					newState.streaks.currentAttendanceStreak,
					newState.streaks.bestAttendanceStreak,
				);
				newState.streaks.lastAttendanceStreakWeek = weekKey;
			}
		}
	}

	return newState;
}
