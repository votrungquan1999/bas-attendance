"use client";

import type { ReactNode } from "react";
import { Button } from "src/shadcn/components/ui/button";
import { cn } from "src/shadcn/lib/utils";
import {
	useCountdownControls,
	useCountdownView,
} from "./countdown-timer.state";

/**
 * Parses a raw number-input string into a value the reducer can clamp;
 * empty/invalid input becomes NaN so the reducer's NaN-guard treats it as 0.
 * @param rawValue - the input element's current string value
 * @returns parsed integer, or NaN for empty/invalid input
 */
function parseInputValue(rawValue: string): number {
	return Number.parseInt(rawValue, 10);
}

/**
 * Centers the countdown tool's content, matching the flex pattern already
 * used by the app's root and /utils landing pages.
 * @param children - the countdown's title + interactive elements
 */
export function CountdownLayout({ children }: { children: ReactNode }) {
	return (
		<main className="flex flex-col items-center justify-center flex-1 gap-6 px-4 py-10">
			{children}
		</main>
	);
}

/**
 * Shows the remaining time as mm:ss, recoloring when the countdown finishes.
 */
export function CountdownDisplay() {
	const { minutes, seconds, isFinished } = useCountdownView();
	const paddedMinutes = String(minutes).padStart(2, "0");
	const paddedSeconds = String(seconds).padStart(2, "0");

	return (
		<p
			className={cn(
				"text-6xl font-bold tabular-nums",
				isFinished ? "text-destructive" : "text-foreground",
			)}
		>
			{paddedMinutes}:{paddedSeconds}
		</p>
	);
}

/**
 * Raw minutes/seconds number inputs, editable only while idle.
 */
export function CountdownInputs() {
	const { minutes, seconds, isIdle } = useCountdownView();
	const { setMinutes, setSeconds } = useCountdownControls();

	return (
		<div className="flex items-center gap-2">
			<input
				type="number"
				aria-label="Minutes"
				value={minutes}
				disabled={!isIdle}
				onChange={(event) => setMinutes(parseInputValue(event.target.value))}
				className={cn(
					"w-20 p-2 border rounded text-center",
					!isIdle && "opacity-50",
				)}
			/>
			<span className="text-xl font-bold">:</span>
			<input
				type="number"
				aria-label="Seconds"
				value={seconds}
				disabled={!isIdle}
				onChange={(event) => setSeconds(parseInputValue(event.target.value))}
				className={cn(
					"w-20 p-2 border rounded text-center",
					!isIdle && "opacity-50",
				)}
			/>
		</div>
	);
}

/**
 * The large center Start/Stop button. Disabled only while idle with no
 * configured time (R1); Start begins the countdown, Stop freezes/silences it.
 */
export function CountdownStartStopButton() {
	const { isIdle, canStart } = useCountdownView();
	const { start, stop } = useCountdownControls();
	const disabled = isIdle && !canStart;

	return (
		<Button
			size="lg"
			disabled={disabled}
			onClick={isIdle ? start : stop}
			className="size-24 rounded-full text-lg"
		>
			{isIdle ? "Start" : "Stop"}
		</Button>
	);
}

/**
 * Small button that always returns the timer to idle with the configured
 * time restored, regardless of current status.
 */
export function CountdownResetButton() {
	const { reset } = useCountdownControls();

	return (
		<Button variant="outline" size="sm" onClick={reset}>
			Reset
		</Button>
	);
}

/**
 * Prominent non-audio "finished" cue (R3) - visible even if audio never
 * played (blocked/failed), since it's driven by status, not sound.
 */
export function CountdownFinishedBanner() {
	const { isFinished } = useCountdownView();

	if (!isFinished) {
		return null;
	}

	return (
		<p className="text-2xl font-bold text-destructive animate-pulse">
			TIME&apos;S UP
		</p>
	);
}
