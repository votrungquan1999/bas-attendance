import { CountdownTimerProvider } from "./countdown-timer.state";
import {
	CountdownDisplay,
	CountdownFinishedBanner,
	CountdownInputs,
	CountdownLayout,
	CountdownResetButton,
	CountdownStartStopButton,
} from "./countdown-timer.ui";

/**
 * Server composition root for the countdown timer tool: wraps the domain
 * provider around the display/interactive pieces, keeping static text here.
 */
export default function CountdownTimer() {
	return (
		<CountdownTimerProvider>
			<CountdownLayout>
				<h1 className="text-2xl sm:text-4xl font-bold text-center">
					Countdown Timer
				</h1>
				<CountdownDisplay />
				<CountdownInputs />
				<CountdownStartStopButton />
				<CountdownResetButton />
				<CountdownFinishedBanner />
			</CountdownLayout>
		</CountdownTimerProvider>
	);
}
