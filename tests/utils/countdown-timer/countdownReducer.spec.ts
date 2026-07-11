import { describe, expect, test } from "bun:test";
import {
	type CountdownState,
	CountdownStatus,
} from "../../../src/app/utils/countdown-timer/countdown-timer.type";
import { countdownReducer } from "../../../src/app/utils/countdown-timer/countdownReducer";

describe("countdownReducer", () => {
	test("should set configuredMs and remainingMs together when setting minutes while idle", () => {
		const state: CountdownState = {
			status: CountdownStatus.Idle,
			configuredMs: 0,
			remainingMs: 0,
		};

		const newState = countdownReducer(state, {
			type: "SET_MINUTES",
			payload: 5,
		});

		expect(newState).toEqual({
			status: CountdownStatus.Idle,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 5 * 60 * 1000,
		});
	});

	test("should set configuredMs and remainingMs together when setting seconds while idle", () => {
		const state: CountdownState = {
			status: CountdownStatus.Idle,
			configuredMs: 0,
			remainingMs: 0,
		};

		const newState = countdownReducer(state, {
			type: "SET_SECONDS",
			payload: 30,
		});

		expect(newState).toEqual({
			status: CountdownStatus.Idle,
			configuredMs: 30 * 1000,
			remainingMs: 30 * 1000,
		});
	});

	test("should clamp minutes to 99 and seconds to 59 when payload exceeds the caps", () => {
		const state: CountdownState = {
			status: CountdownStatus.Idle,
			configuredMs: 0,
			remainingMs: 0,
		};

		const stateAfterMinutes = countdownReducer(state, {
			type: "SET_MINUTES",
			payload: 150,
		});
		const stateAfterSeconds = countdownReducer(stateAfterMinutes, {
			type: "SET_SECONDS",
			payload: 90,
		});

		expect(stateAfterSeconds).toEqual({
			status: CountdownStatus.Idle,
			configuredMs: 99 * 60 * 1000 + 59 * 1000,
			remainingMs: 99 * 60 * 1000 + 59 * 1000,
		});
	});

	test("should treat a NaN minutes payload (cleared input) as 0", () => {
		const state: CountdownState = {
			status: CountdownStatus.Idle,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 5 * 60 * 1000,
		};

		const newState = countdownReducer(state, {
			type: "SET_MINUTES",
			payload: Number.NaN,
		});

		expect(newState).toEqual({
			status: CountdownStatus.Idle,
			configuredMs: 0,
			remainingMs: 0,
		});
	});

	test("should ignore SET_MINUTES when status is not idle", () => {
		const state: CountdownState = {
			status: CountdownStatus.Running,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 3 * 60 * 1000,
		};

		const newState = countdownReducer(state, {
			type: "SET_MINUTES",
			payload: 10,
		});

		expect(newState).toEqual({
			status: CountdownStatus.Running,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 3 * 60 * 1000,
		});
	});

	test("should start the countdown at the configured time when starting from idle", () => {
		const state: CountdownState = {
			status: CountdownStatus.Idle,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 5 * 60 * 1000,
		};

		const newState = countdownReducer(state, { type: "START" });

		expect(newState).toEqual({
			status: CountdownStatus.Running,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 5 * 60 * 1000,
		});
	});

	test("should stay idle when starting with configuredMs at 0", () => {
		const state: CountdownState = {
			status: CountdownStatus.Idle,
			configuredMs: 0,
			remainingMs: 0,
		};

		const newState = countdownReducer(state, { type: "START" });

		expect(newState).toEqual({
			status: CountdownStatus.Idle,
			configuredMs: 0,
			remainingMs: 0,
		});
	});

	test("should reduce remainingMs by the elapsed ms on a tick", () => {
		const state: CountdownState = {
			status: CountdownStatus.Running,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 5 * 60 * 1000,
		};

		const newState = countdownReducer(state, { type: "TICK", payload: 1000 });

		expect(newState).toEqual({
			status: CountdownStatus.Running,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 5 * 60 * 1000 - 1000,
		});
	});

	test("should clamp remainingMs to 0 and finish when elapsed ms overshoots remaining time", () => {
		const state: CountdownState = {
			status: CountdownStatus.Running,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 1000,
		};

		const newState = countdownReducer(state, { type: "TICK", payload: 5000 });

		expect(newState).toEqual({
			status: CountdownStatus.Finished,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 0,
		});
	});

	test("should freeze remainingMs and move to stopped when stopping while running", () => {
		const state: CountdownState = {
			status: CountdownStatus.Running,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 2 * 60 * 1000,
		};

		const newState = countdownReducer(state, { type: "STOP" });

		expect(newState).toEqual({
			status: CountdownStatus.Stopped,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 2 * 60 * 1000,
		});
	});

	test("should move to stopped (silencing the alarm) when stopping while finished", () => {
		const state: CountdownState = {
			status: CountdownStatus.Finished,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 0,
		};

		const newState = countdownReducer(state, { type: "STOP" });

		expect(newState).toEqual({
			status: CountdownStatus.Stopped,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 0,
		});
	});

	test("should be a no-op when stopping while idle", () => {
		const state: CountdownState = {
			status: CountdownStatus.Idle,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 5 * 60 * 1000,
		};

		const newState = countdownReducer(state, { type: "STOP" });

		expect(newState).toEqual({
			status: CountdownStatus.Idle,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 5 * 60 * 1000,
		});
	});

	test("should be idempotent when stopping while already stopped", () => {
		const state: CountdownState = {
			status: CountdownStatus.Stopped,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 2 * 60 * 1000,
		};

		const newState = countdownReducer(state, { type: "STOP" });

		expect(newState).toEqual({
			status: CountdownStatus.Stopped,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 2 * 60 * 1000,
		});
	});

	test("should move to finished when a tick reaches exactly zero while running", () => {
		const state: CountdownState = {
			status: CountdownStatus.Running,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 1000,
		};

		const newState = countdownReducer(state, { type: "TICK", payload: 1000 });

		expect(newState).toEqual({
			status: CountdownStatus.Finished,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 0,
		});
	});

	test("should not transition to finished when a tick reaches zero while stopped", () => {
		const state: CountdownState = {
			status: CountdownStatus.Stopped,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 1000,
		};

		const newState = countdownReducer(state, { type: "TICK", payload: 1000 });

		// TICK outside Running must be a full no-op: remainingMs stays frozen.
		expect(newState).toEqual({
			status: CountdownStatus.Stopped,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 1000,
		});
	});

	test("should be a no-op when a tick fires while idle", () => {
		const state: CountdownState = {
			status: CountdownStatus.Idle,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 5 * 60 * 1000,
		};

		const newState = countdownReducer(state, { type: "TICK", payload: 1000 });

		expect(newState).toEqual({
			status: CountdownStatus.Idle,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 5 * 60 * 1000,
		});
	});

	test("should not increase remainingMs when a tick's elapsed payload is negative (clock skew)", () => {
		const state: CountdownState = {
			status: CountdownStatus.Running,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 60 * 1000,
		};

		const newState = countdownReducer(state, {
			type: "TICK",
			payload: -5000,
		});

		expect(newState).toEqual({
			status: CountdownStatus.Running,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 60 * 1000,
		});
	});

	test("should return to idle with remainingMs restored to configuredMs when resetting while running", () => {
		const state: CountdownState = {
			status: CountdownStatus.Running,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 2 * 60 * 1000,
		};

		const newState = countdownReducer(state, { type: "RESET" });

		expect(newState).toEqual({
			status: CountdownStatus.Idle,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 5 * 60 * 1000,
		});
	});

	test("should return to idle with remainingMs restored to configuredMs when resetting while finished", () => {
		const state: CountdownState = {
			status: CountdownStatus.Finished,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 0,
		};

		const newState = countdownReducer(state, { type: "RESET" });

		expect(newState).toEqual({
			status: CountdownStatus.Idle,
			configuredMs: 5 * 60 * 1000,
			remainingMs: 5 * 60 * 1000,
		});
	});
});
