import Link from "next/link";
import { countdownTimerHref } from "./href";

export default function UtilsPage() {
	return (
		<main className="flex flex-col items-center flex-1 gap-6 px-4 py-10">
			<h1 className="text-2xl sm:text-4xl font-bold text-center">
				Basketball Utils
			</h1>
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl">
				<Link
					href={countdownTimerHref()}
					className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card text-card-foreground p-6 text-center hover:bg-accent hover:text-accent-foreground transition-colors"
				>
					Countdown Timer
				</Link>
			</div>
		</main>
	);
}
