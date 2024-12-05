import { Trophy, Timer, Repeat, Award } from "lucide-react";
import query_getAchievements from "src/server/queries/query_getAchievements";

async function AchievementStats() {
	const achievements = await query_getAchievements();

	return (
		<div className="max-w-4xl mx-auto p-4 sm:py-8 sm:px-6">
			<div className="flex flex-row items-center gap-3 mb-6">
				<div className="p-2 bg-yellow-50 rounded-lg w-fit">
					<Award className="h-6 w-6 text-yellow-500" />
				</div>
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Hall of Fame</h1>
					<p className="text-sm text-gray-500 mt-1">
						Where dedication meets excellence
					</p>
				</div>
			</div>

			{/* Top Records */}
			<div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 mb-8">
				<div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
					<div className="flex items-center gap-3 mb-3">
						<div className="p-2 bg-blue-50 rounded-lg">
							<Trophy className="h-5 w-5 text-blue-500" />
						</div>
						<h2 className="font-semibold text-gray-900">
							Longest Activity Streak
						</h2>
					</div>
					<div className="pl-2">
						<p className="text-3xl font-bold text-blue-600 mb-1">
							{achievements.longestStreak.weeks} weeks
						</p>
						<p className="text-sm text-gray-500">
							by {achievements.longestStreak.athleteName}
						</p>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
					<div className="flex items-center gap-3 mb-3">
						<div className="p-2 bg-green-50 rounded-lg">
							<Repeat className="h-5 w-5 text-green-500" />
						</div>
						<h2 className="font-semibold text-gray-900">Best Running Streak</h2>
					</div>
					<div className="pl-2">
						<p className="text-3xl font-bold text-green-600 mb-1">
							{achievements.runningStreak.weeks} weeks
						</p>
						<p className="text-sm text-gray-500">
							by {achievements.runningStreak.athleteName}
						</p>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
					<div className="flex items-center gap-3 mb-3">
						<div className="p-2 bg-purple-50 rounded-lg">
							<Timer className="h-5 w-5 text-purple-500" />
						</div>
						<h2 className="font-semibold text-gray-900">Best Running Pace</h2>
					</div>
					<div className="pl-2">
						{achievements.bestPerformance.laps >= 6 ? (
							<>
								<p className="text-3xl font-bold text-purple-600 mb-1">
									{achievements.bestPerformance.minutesPerLap.toFixed(1)}{" "}
									min/lap
								</p>
								<p className="text-sm text-gray-500">
									{achievements.bestPerformance.laps} laps in{" "}
									{achievements.bestPerformance.minutes} mins by{" "}
									{achievements.bestPerformance.athleteName}
								</p>
							</>
						) : (
							<p className="text-sm text-gray-500">
								No qualifying records yet (minimum 6 laps)
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Top Performers Lists */}
			<div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
				{/* Activity Streaks */}
				{achievements.topAttendance.length > 0 && (
					<div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
						<div className="mb-4">
							<h2 className="font-semibold text-gray-900">
								Top Activity Streaks
							</h2>
							<p className="text-sm text-gray-500 mt-1">
								Athletes who consistently completed all weekly activities
							</p>
						</div>
						<div className="space-y-3">
							{achievements.topAttendance.map((athlete, index) => (
								<div
									key={athlete.id}
									className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
								>
									<div className="flex items-center gap-3">
										<span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
											{index + 1}
										</span>
										<span className="text-gray-900 font-medium">
											{athlete.name}
										</span>
									</div>
									<span className="font-medium text-blue-600">
										{athlete.weeks} weeks
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Running Streaks */}
				{achievements.topRunning.length > 0 && (
					<div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
						<div className="mb-4">
							<h2 className="font-semibold text-gray-900">
								Top Running Streaks
							</h2>
							<p className="text-sm text-gray-500 mt-1">
								Athletes who maintained consistent running performance
							</p>
						</div>
						<div className="space-y-3">
							{achievements.topRunning.map((athlete, index) => (
								<div
									key={athlete.id}
									className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
								>
									<div className="flex items-center gap-3">
										<span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-600 text-sm font-medium">
											{index + 1}
										</span>
										<span className="text-gray-900 font-medium">
											{athlete.name}
										</span>
									</div>
									<span className="font-medium text-green-600">
										{athlete.weeks} weeks
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default function AchievementPage() {
	return <AchievementStats />;
}
