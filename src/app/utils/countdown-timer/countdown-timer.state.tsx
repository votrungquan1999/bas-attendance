"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import type { MutableRefObject, ReactNode } from "react";
import { createReducerContext } from "src/components/reducerContext";
import { CountdownStatus } from "./countdown-timer.type";
import { countdownReducer } from "./countdownReducer";

interface CountdownView {
	status: CountdownStatus;
	minutes: number;
	seconds: number;
	milliseconds: number;
	isIdle: boolean;
	isRunning: boolean;
	isFinished: boolean;
	canStart: boolean;
}

interface CountdownControls {
	setMinutes: (value: number) => void;
	setSeconds: (value: number) => void;
	start: () => void;
	stop: () => void;
	reset: () => void;
}

type AudioContextRef = MutableRefObject<AudioContext | null>;

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_SECOND = 1000;
const BEEP_PERIOD_MS = 800;
const BEEP_DURATION_SECONDS = 0.3;
const BEEP_FREQUENCY_HZ = 880;
// Loud but not clipping/max gain (DECISIONS.md: conservative default).
const BEEP_GAIN = 0.6;
const ALARM_CUTOFF_MS = 60_000;

const { ReducerContextProvider, useDispatch, useState } =
	createReducerContext(countdownReducer);

// Carries the gesture-created AudioContext so the Start click handler
// (useCountdownControls) and the alarm effect (CountdownTimerEffects) share
// one instance, without going through the (audio-agnostic) reducer state.
const AudioContextRefContext = createContext<AudioContextRef | null>(null);

/**
 * Reads the shared AudioContext ref from context; throws outside the provider.
 * @returns the mutable ref holding the lazily-created AudioContext
 */
function useAudioContextRef(): AudioContextRef {
	const ref = useContext(AudioContextRefContext);
	if (!ref) {
		throw new Error(
			"useAudioContextRef must be used within CountdownTimerProvider",
		);
	}
	return ref;
}

/**
 * Plays a single beep by spawning a fresh oscillator->gain->destination
 * chain (oscillators are single-use, so a new one is created per beep).
 * @param audioCtx - the gesture-unlocked AudioContext to play through
 */
function playBeep(audioCtx: AudioContext): void {
	const oscillator = audioCtx.createOscillator();
	const gainNode = audioCtx.createGain();
	oscillator.frequency.value = BEEP_FREQUENCY_HZ;
	gainNode.gain.value = BEEP_GAIN;
	oscillator.connect(gainNode);
	gainNode.connect(audioCtx.destination);
	oscillator.start();
	oscillator.stop(audioCtx.currentTime + BEEP_DURATION_SECONDS);
}

/**
 * Side-effect-only component (renders nothing): drives the wall-clock tick
 * while running, and the looping alarm + 60s safety cutoff while finished.
 * Both effects clean up on status change, so leaving "running"/"finished"
 * (Stop/Reset) silences/stops immediately via React's own cleanup.
 */
function CountdownTimerEffects() {
	const state = useState();
	const dispatch = useDispatch();
	const audioCtxRef = useAudioContextRef();
	const lastTickRef = useRef<number>(0);

	useEffect(() => {
		if (state.status !== CountdownStatus.Running) {
			return;
		}
		lastTickRef.current = Date.now();
		// rAF (not setInterval) so the millisecond display animates at the
		// screen's refresh rate; Date.now deltas keep it wall-clock accurate.
		let frameId = requestAnimationFrame(function tick() {
			const now = Date.now();
			const elapsedMs = now - lastTickRef.current;
			lastTickRef.current = now;
			dispatch({ type: "TICK", payload: elapsedMs });
			frameId = requestAnimationFrame(tick);
		});
		return () => cancelAnimationFrame(frameId);
	}, [state.status, dispatch]);

	useEffect(() => {
		if (state.status !== CountdownStatus.Finished) {
			return;
		}
		const audioCtx = audioCtxRef.current;
		if (!audioCtx) {
			// Defensive: Finished is only reachable via Start, which creates it.
			return;
		}
		// Long backgrounding (R2 catch-up) can auto-suspend an already-running
		// context between the Start gesture and Finished - re-resume so the
		// alarm is actually audible, not just silently scheduled.
		if (audioCtx.state === "suspended") {
			void audioCtx.resume();
		}

		const beepIntervalId = setInterval(
			() => playBeep(audioCtx),
			BEEP_PERIOD_MS,
		);
		// Silences only (never dispatches) - status stays Finished after 60s.
		const cutoffId = setTimeout(() => {
			clearInterval(beepIntervalId);
		}, ALARM_CUTOFF_MS);

		return () => {
			clearInterval(beepIntervalId);
			clearTimeout(cutoffId);
		};
	}, [state.status, audioCtxRef]);

	return null;
}

/**
 * Lazily creates (and resumes) the AudioContext inside the Start click's own
 * call stack, so it counts as gesture-unlocked for later autonomous playback.
 * @param audioCtxRef - shared ref holding the lazily-created AudioContext
 */
function ensureAudioContextResumed(audioCtxRef: AudioContextRef): void {
	if (!audioCtxRef.current) {
		audioCtxRef.current = new AudioContext();
	}
	if (audioCtxRef.current.state === "suspended") {
		void audioCtxRef.current.resume();
	}
}

/**
 * Supplies the countdown timer's reducer context with a hardcoded initial
 * state (idle, unconfigured) - mirrors StreakViewProvider's static-value
 * pattern (no server-fetched data to thread through).
 * @param children - the countdown UI tree to render inside the provider
 */
export function CountdownTimerProvider({ children }: { children: ReactNode }) {
	const audioCtxRef = useRef<AudioContext | null>(null);

	return (
		<ReducerContextProvider
			value={{
				status: CountdownStatus.Idle,
				configuredMs: 0,
				remainingMs: 0,
			}}
		>
			<AudioContextRefContext.Provider value={audioCtxRef}>
				<CountdownTimerEffects />
				{children}
			</AudioContextRefContext.Provider>
		</ReducerContextProvider>
	);
}

/**
 * Derives the countdown's display-facing view from raw reducer state.
 * @returns status, mm:ss display fields, and derived flags for the UI
 */
export function useCountdownView(): CountdownView {
	const state = useState();
	const minutes = Math.floor(state.remainingMs / MS_PER_MINUTE);
	const seconds = Math.floor(
		(state.remainingMs % MS_PER_MINUTE) / MS_PER_SECOND,
	);
	const milliseconds = Math.floor(state.remainingMs % MS_PER_SECOND);

	return {
		status: state.status,
		minutes,
		seconds,
		milliseconds,
		isIdle: state.status === CountdownStatus.Idle,
		isRunning: state.status === CountdownStatus.Running,
		isFinished: state.status === CountdownStatus.Finished,
		canStart: state.configuredMs > 0,
	};
}

/**
 * Exposes the countdown's user-facing actions as domain functions - never
 * the raw dispatch from createReducerContext.
 * @returns setMinutes/setSeconds/start/stop/reset action functions
 */
export function useCountdownControls(): CountdownControls {
	const dispatch = useDispatch();
	const audioCtxRef = useAudioContextRef();

	return {
		setMinutes: (value: number) =>
			dispatch({ type: "SET_MINUTES", payload: value }),
		setSeconds: (value: number) =>
			dispatch({ type: "SET_SECONDS", payload: value }),
		start: () => {
			// Must run inside this click's call stack - the user gesture.
			ensureAudioContextResumed(audioCtxRef);
			dispatch({ type: "START" });
		},
		stop: () => dispatch({ type: "STOP" }),
		reset: () => dispatch({ type: "RESET" }),
	};
}
