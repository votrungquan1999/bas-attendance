import { Suspense } from "react";

interface Achievement {
	longestStreak: {
		weeks: number;
		athleteName: string;
	};
	runningStreak: {
		weeks: number;
		athleteName: string;
	};
	bestPerformance: {
		minutesPerLap: number;
		laps: number;
		minutes: number;
		athleteName: string;
	};
	topAttendance: Array<{
		id: string;
		name: string;
		weeks: number;
	}>;
	topRunning: Array<{
		id: string;
		name: string;
		weeks: number;
	}>;
}

// Mocked data for development
async function getTopAchievements(): Promise<Achievement> {
	return {
		longestStreak: {
			weeks: 12,
			athleteName: "Sarah Johnson",
		},
		runningStreak: {
			weeks: 8,
			athleteName: "Michael Chen",
		},
		bestPerformance: {
			minutesPerLap: 2,
			laps: 15,
			minutes: 30,
			athleteName: "David Smith",
		},
		topAttendance: [
			{ id: "1", name: "Sarah Johnson", weeks: 12 },
			{ id: "2", name: "James Wilson", weeks: 10 },
			{ id: "3", name: "Emma Davis", weeks: 9 },
			{ id: "4", name: "Alex Thompson", weeks: 8 },
			{ id: "5", name: "Lisa Anderson", weeks: 7 },
		],
		topRunning: [
			{ id: "1", name: "Michael Chen", weeks: 8 },
			{ id: "2", name: "Jessica Lee", weeks: 7 },
			{ id: "3", name: "Robert Taylor", weeks: 6 },
			{ id: "4", name: "Anna Martinez", weeks: 5 },
			{ id: "5", name: "Kevin Brown", weeks: 4 },
		],
	};
}

async function AchievementStats() {
	const achievements = await getTopAchievements();

	return (
		<div className="max-w-4xl mx-auto p-4 sm:py-8 sm:px-4">
			<h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
				Athlete Achievements
			</h1>

			<div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 mb-8 sm:mb-12">
				{/* Streak Cards */}
				<div className="bg-white rounded-lg shadow p-4 sm:p-6">
					<h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
						Longest Activity Streak
					</h2>
					<p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
						Consecutive weeks completing all 30-minute session goals
					</p>
					<p className="text-2xl sm:text-3xl font-bold text-blue-600">
						{achievements.longestStreak.weeks} weeks
					</p>
					<p className="mt-1 sm:mt-2 text-sm text-gray-600">
						By {achievements.longestStreak.athleteName}
					</p>
				</div>

				<div className="bg-white rounded-lg shadow p-4 sm:p-6">
					<h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
						Best Running Streak
					</h2>
					<p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
						Consecutive weeks meeting the running distance goal
					</p>
					<p className="text-2xl sm:text-3xl font-bold text-green-600">
						{achievements.runningStreak.weeks} weeks
					</p>
					<p className="mt-1 sm:mt-2 text-sm text-gray-600">
						By {achievements.runningStreak.athleteName}
					</p>
				</div>

				<div className="bg-white rounded-lg shadow p-4 sm:p-6">
					<h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
						Top Running Performance
					</h2>
					<p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
						Best performance by minutes per lap
					</p>
					<p className="text-2xl sm:text-3xl font-bold text-purple-600">
						{achievements.bestPerformance.minutesPerLap.toFixed(1)} min/lap
					</p>
					<p className="mt-1 sm:mt-2 text-sm text-gray-600">
						{achievements.bestPerformance.laps} laps in{" "}
						{achievements.bestPerformance.minutes} mins by{" "}
						{achievements.bestPerformance.athleteName}
					</p>
				</div>
			</div>

			{/* Top Performers Section */}
			<section className="bg-white rounded-lg shadow p-4 sm:p-6">
				<h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
					Top Performers
				</h2>

				<div className="space-y-6 sm:space-y-8">
					{/* Attendance Streaks */}
					<div>
						<h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
							Top Activity Streaks
						</h3>
						<p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
							Longest streaks of completing 30-minute sessions
						</p>
						<div className="space-y-2">
							{achievements.topAttendance.map(
								(
									athlete: { id: string; name: string; weeks: number },
									index: number,
								) => (
									<div
										key={athlete.id}
										className="flex justify-between items-center py-2 px-1"
									>
										<span className="flex items-center gap-2">
											<span className="text-gray-500 text-sm">
												#{index + 1}
											</span>
											<span className="text-sm sm:text-base">
												{athlete.name}
											</span>
										</span>
										<span className="font-semibold text-sm sm:text-base">
											{athlete.weeks} weeks
										</span>
									</div>
								),
							)}
						</div>
					</div>

					{/* Running Streaks */}
					<div>
						<h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
							Top Running Streaks
						</h3>
						<p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
							Longest streaks of meeting running goals
						</p>
						<div className="space-y-2">
							{achievements.topRunning.map(
								(
									athlete: { id: string; name: string; weeks: number },
									index: number,
								) => (
									<div
										key={athlete.id}
										className="flex justify-between items-center py-2 px-1"
									>
										<span className="flex items-center gap-2">
											<span className="text-gray-500 text-sm">
												#{index + 1}
											</span>
											<span className="text-sm sm:text-base">
												{athlete.name}
											</span>
										</span>
										<span className="font-semibold text-sm sm:text-base">
											{athlete.weeks} weeks
										</span>
									</div>
								),
							)}
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

export default function AchievementPage() {
	return (
		<Suspense fallback={<div>Loading achievements...</div>}>
			<AchievementStats />
		</Suspense>
	);
}
