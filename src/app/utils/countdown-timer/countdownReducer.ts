import { CountdownStatus } from "./countdown-timer.type";
import type { CountdownAction, CountdownState } from "./countdown-timer.type";

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_SECOND = 1000;

/**
 * Clamps a raw numeric input to the 0-99 minutes range. Empty/NaN input
 * (e.g. a cleared number field) is treated as 0 before clamping.
 * @param rawMinutes - unclamped minutes value from user input
 * @returns minutes clamped to 0-99
 */
function clampMinutes(rawMinutes: number): number {
	const minutes = Number.isNaN(rawMinutes) ? 0 : rawMinutes;
	return Math.min(99, Math.max(0, Math.trunc(minutes)));
}

/**
 * Clamps a raw numeric input to the 0-59 seconds range. Empty/NaN input
 * (e.g. a cleared number field) is treated as 0 before clamping.
 * @param rawSeconds - unclamped seconds value from user input
 * @returns seconds clamped to 0-59
 */
function clampSeconds(rawSeconds: number): number {
	const seconds = Number.isNaN(rawSeconds) ? 0 : rawSeconds;
	return Math.min(59, Math.max(0, Math.trunc(seconds)));
}

/**
 * Pure reducer for the countdown timer. Computes the next state from a
 * dispatched action; no side effects (no Date.now, no timers).
 * @param state - current countdown state
 * @param action - dispatched action
 * @returns the next countdown state
 */
export function countdownReducer(
	state: CountdownState,
	action: CountdownAction,
): CountdownState {
	switch (action.type) {
		case "SET_MINUTES":
		case "SET_SECONDS": {
			// config can only be edited before the countdown starts
			if (state.status !== CountdownStatus.Idle) {
				return state;
			}
			return updateConfiguredTime(state, action);
		}
		case "START": {
			// defense-in-depth: UI already disables Start at 0, guard the reducer too.
			// No status check here by design - restart-from-Stopped without Reset is a
			// consciously-accepted gap (see DECISIONS.md), not something this fix touches.
			if (state.configuredMs <= 0) {
				return state;
			}
			return {
				...state,
				status: CountdownStatus.Running,
				remainingMs: state.configuredMs,
			};
		}
		case "TICK": {
			// frozen (idle/stopped/finished) remaining never changes - only Running ticks
			if (state.status !== CountdownStatus.Running) {
				return state;
			}
			// clamp elapsed to >=0: a negative/clock-skew payload must never increase remainingMs
			const elapsedMs = Math.max(0, action.payload);
			const remainingMs = Math.max(0, state.remainingMs - elapsedMs);
			if (remainingMs === 0) {
				return {
					...state,
					remainingMs,
					status: CountdownStatus.Finished,
				};
			}
			return {
				...state,
				remainingMs,
			};
		}
		case "STOP": {
			// idle/stopped are no-ops: STOP is terminal, never re-enters idle/running
			if (
				state.status === CountdownStatus.Idle ||
				state.status === CountdownStatus.Stopped
			) {
				return state;
			}
			return {
				...state,
				status: CountdownStatus.Stopped,
			};
		}
		case "RESET": {
			return {
				...state,
				status: CountdownStatus.Idle,
				remainingMs: state.configuredMs,
			};
		}
		default:
			return state;
	}
}

/**
 * Applies a SET_MINUTES/SET_SECONDS edit to the configured time, updating
 * remainingMs in lockstep so the display reflects the edit before Start.
 * @param state - current countdown state (already confirmed idle)
 * @param action - SET_MINUTES or SET_SECONDS action
 * @returns state with configuredMs and remainingMs updated together
 */
function updateConfiguredTime(
	state: CountdownState,
	action: Extract<CountdownAction, { type: "SET_MINUTES" | "SET_SECONDS" }>,
): CountdownState {
	switch (action.type) {
		case "SET_MINUTES": {
			const currentSeconds =
				Math.floor(state.configuredMs / MS_PER_SECOND) % 60;
			const newConfiguredMs =
				clampMinutes(action.payload) * MS_PER_MINUTE +
				currentSeconds * MS_PER_SECOND;
			return {
				...state,
				configuredMs: newConfiguredMs,
				remainingMs: newConfiguredMs,
			};
		}
		case "SET_SECONDS": {
			const currentMinutes = Math.floor(state.configuredMs / MS_PER_MINUTE);
			const newConfiguredMs =
				currentMinutes * MS_PER_MINUTE +
				clampSeconds(action.payload) * MS_PER_SECOND;
			return {
				...state,
				configuredMs: newConfiguredMs,
				remainingMs: newConfiguredMs,
			};
		}
		default:
			return state;
	}
}
