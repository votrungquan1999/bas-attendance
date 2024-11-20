import type { CompletedActivity } from "src/app/attendance/activity/types";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "src/shadcn/components/ui/popover";
// import { useState } from "react";
// import { Button } from "src/shadcn/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { connection } from "next/server";

// Mock data for demonstration
const mockAttendanceData: {
	athleteName: string;
	activities: CompletedActivity[];
}[] = [
	{
		athleteName: "John Doe",
		activities: [
			{
				attendanceId: "1",
				submittedAt: Date.now() - 86400000 * 1,
				activity: "30-minutes-session",
				thirtyMinActivity: "probability-practice",
				practiceType: "attack-board",
				practiceLevel: "3",
				practiceDescription: "Made 25 consecutive backboard finishes",
			},
			{
				attendanceId: "2",
				submittedAt: Date.now() - 86400000 * 2,
				activity: "endurance-run",
				laps: "20",
				minutes: "30",
			},
			{
				attendanceId: "3",
				submittedAt: Date.now() - 86400000 * 2,
				activity: "30-minutes-session",
				thirtyMinActivity: "buddy-training",
				thirtyMinExplanation: "Pick and roll practice with Mike",
			},
			{
				attendanceId: "4",
				submittedAt: Date.now() - 86400000 * 3,
				activity: "normal-long-session",
				sessionType: "train-with-coach",
			},
			{
				attendanceId: "5",
				submittedAt: Date.now() - 86400000 * 3,
				activity: "30-minutes-session",
				thirtyMinActivity: "probability-practice",
				practiceType: "straight-shot",
				practiceLevel: "2",
				practiceDescription: "Free throw practice, 45/50 made",
			},
			{
				attendanceId: "6",
				submittedAt: Date.now() - 86400000 * 4,
				activity: "30-minutes-session",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "Crossover and between-legs dribbling",
			},
			{
				attendanceId: "7",
				submittedAt: Date.now() - 86400000 * 4,
				activity: "normal-long-session",
				sessionType: "others",
				sessionExplanation: "3v3 tournament practice",
			},
			{
				attendanceId: "8",
				submittedAt: Date.now() - 86400000 * 5,
				activity: "30-minutes-session",
				thirtyMinActivity: "probability-practice",
				practiceType: "layup",
				practiceLevel: "4",
				practiceDescription: "Reverse layup practice, 18/20 success",
			},
			{
				attendanceId: "9",
				submittedAt: Date.now() - 86400000 * 5,
				activity: "endurance-run",
				laps: "25",
				minutes: "35",
			},
			{
				attendanceId: "10",
				submittedAt: Date.now() - 86400000 * 6,
				activity: "normal-long-session",
				sessionType: "train-newbies",
			},
		],
	},
	{
		athleteName: "Sarah Williams",
		activities: [
			{
				attendanceId: "11",
				submittedAt: Date.now() - 86400000 * 1,
				activity: "30-minutes-session",
				thirtyMinActivity: "probability-practice",
				practiceType: "layup",
				practiceLevel: "4",
				practiceDescription: "Euro-step layup drills, 19/20 success rate",
			},
			{
				attendanceId: "12",
				submittedAt: Date.now() - 86400000 * 1,
				activity: "normal-long-session",
				sessionType: "train-with-coach",
			},
			{
				attendanceId: "13",
				submittedAt: Date.now() - 86400000 * 2,
				activity: "30-minutes-session",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "Advanced ball handling sequences",
			},
			{
				attendanceId: "14",
				submittedAt: Date.now() - 86400000 * 3,
				activity: "normal-long-session",
				sessionType: "others",
				sessionExplanation: "Full court 5v5 scrimmage",
			},
			{
				attendanceId: "15",
				submittedAt: Date.now() - 86400000 * 3,
				activity: "30-minutes-session",
				thirtyMinActivity: "probability-practice",
				practiceType: "straight-shot",
				practiceLevel: "4",
				practiceDescription: "Three-point shooting practice, 40/50 made",
			},
			{
				attendanceId: "16",
				submittedAt: Date.now() - 86400000 * 4,
				activity: "endurance-run",
				laps: "30",
				minutes: "40",
			},
			{
				attendanceId: "17",
				submittedAt: Date.now() - 86400000 * 4,
				activity: "30-minutes-session",
				thirtyMinActivity: "buddy-training",
				thirtyMinExplanation: "Defense rotation drills with team",
			},
			{
				attendanceId: "18",
				submittedAt: Date.now() - 86400000 * 5,
				activity: "30-minutes-session",
				thirtyMinActivity: "probability-practice",
				practiceType: "attack-board",
				practiceLevel: "3",
				practiceDescription: "Offensive rebound and putback practice",
			},
			{
				attendanceId: "19",
				submittedAt: Date.now() - 86400000 * 5,
				activity: "normal-long-session",
				sessionType: "train-newbies",
			},
			{
				attendanceId: "20",
				submittedAt: Date.now() - 86400000 * 6,
				activity: "30-minutes-session",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "Post move sequences and footwork",
			},
		],
	},
	{
		athleteName: "Mike Johnson",
		activities: [
			{
				attendanceId: "21",
				submittedAt: Date.now() - 86400000 * 1,
				activity: "30-minutes-session",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "Defensive slides and positioning",
			},
			{
				attendanceId: "22",
				submittedAt: Date.now() - 86400000 * 1,
				activity: "normal-long-session",
				sessionType: "others",
				sessionExplanation: "Team defensive drills and scrimmage",
			},
			{
				attendanceId: "23",
				submittedAt: Date.now() - 86400000 * 2,
				activity: "30-minutes-session",
				thirtyMinActivity: "probability-practice",
				practiceType: "straight-shot",
				practiceLevel: "3",
				practiceDescription: "Mid-range jump shots, 35/40 made",
			},
			{
				attendanceId: "24",
				submittedAt: Date.now() - 86400000 * 2,
				activity: "endurance-run",
				laps: "25",
				minutes: "35",
			},
			{
				attendanceId: "25",
				submittedAt: Date.now() - 86400000 * 3,
				activity: "30-minutes-session",
				thirtyMinActivity: "buddy-training",
				thirtyMinExplanation: "Screen and roll defense practice",
			},
			{
				attendanceId: "26",
				submittedAt: Date.now() - 86400000 * 4,
				activity: "normal-long-session",
				sessionType: "train-with-coach",
			},
			{
				attendanceId: "27",
				submittedAt: Date.now() - 86400000 * 4,
				activity: "30-minutes-session",
				thirtyMinActivity: "probability-practice",
				practiceType: "attack-board",
				practiceLevel: "2",
				practiceDescription: "Offensive rebound positioning drills",
			},
			{
				attendanceId: "28",
				submittedAt: Date.now() - 86400000 * 5,
				activity: "30-minutes-session",
				thirtyMinActivity: "personal-technique",
				thirtyMinExplanation: "Ball screen navigation drills",
			},
			{
				attendanceId: "29",
				submittedAt: Date.now() - 86400000 * 5,
				activity: "normal-long-session",
				sessionType: "others",
				sessionExplanation: "Practice game with visiting team",
			},
			{
				attendanceId: "30",
				submittedAt: Date.now() - 86400000 * 6,
				activity: "30-minutes-session",
				thirtyMinActivity: "probability-practice",
				practiceType: "layup",
				practiceLevel: "3",
				practiceDescription: "Floater and runner practice, 15/20 made",
			},
		],
	},
];

function formatDate(timestamp: number): string {
	return new Date(timestamp).toLocaleDateString();
}

function getActivityDescription(activity: CompletedActivity): string {
	switch (activity.activity) {
		case "30-minutes-session":
			if (activity.thirtyMinActivity === "probability-practice") {
				const levelMap = {
					"1": "Beginner",
					"2": "Intermediate",
					"3": "Advanced",
					"4": "Elite",
				};
				const practiceTypeMap = {
					layup: "Layup Practice",
					"straight-shot": "Jump Shot",
					"attack-board": "Backboard Finish",
				};
				return `${practiceTypeMap[activity.practiceType]} (Level ${activity.practiceLevel} - ${levelMap[activity.practiceLevel]}) - ${activity.practiceDescription}`;
			}
			if (
				activity.thirtyMinActivity === "personal-technique" ||
				activity.thirtyMinActivity === "buddy-training"
			) {
				const activityTypeMap = {
					"personal-technique": "Individual Training",
					"buddy-training": "Partner Practice",
				};
				return `${activityTypeMap[activity.thirtyMinActivity]}: ${activity.thirtyMinExplanation}`;
			}
			return `30 Min: ${activity.thirtyMinActivity}`;
		case "endurance-run":
			return `Endurance Run: ${activity.laps} laps in ${activity.minutes} minutes`;
		case "normal-long-session": {
			const sessionTypeMap = {
				"train-newbies": "Train for newbies",
				"train-with-coach": "Coach-led Training",
				others: "Team Activity",
			};
			if (activity.sessionType === "others") {
				return `Team Activity: ${activity.sessionExplanation}`;
			}
			return sessionTypeMap[activity.sessionType];
		}
	}
}

function groupActivities(activities: CompletedActivity[]) {
	const sortByDate = (a: CompletedActivity, b: CompletedActivity) =>
		b.submittedAt - a.submittedAt;

	// Helper function to group 30 min sessions by activity type
	const groupThirtyMinSessions = (activities: CompletedActivity[]) => {
		const thirtyMinActivities = activities.filter(
			(activity) => activity.activity === "30-minutes-session",
		);

		return {
			probabilityPractice: thirtyMinActivities
				.filter(
					(activity) =>
						"thirtyMinActivity" in activity &&
						activity.thirtyMinActivity === "probability-practice",
				)
				.sort(sortByDate),
			personalTechnique: thirtyMinActivities
				.filter(
					(activity) =>
						"thirtyMinActivity" in activity &&
						activity.thirtyMinActivity === "personal-technique",
				)
				.sort(sortByDate),
			buddyTraining: thirtyMinActivities
				.filter(
					(activity) =>
						"thirtyMinActivity" in activity &&
						activity.thirtyMinActivity === "buddy-training",
				)
				.sort(sortByDate),
		};
	};

	// Helper function to group normal sessions by type
	const groupNormalSessions = (activities: CompletedActivity[]) => {
		const normalSessions = activities.filter(
			(activity) => activity.activity === "normal-long-session",
		);

		return {
			trainNewbies: normalSessions
				.filter(
					(activity) =>
						"sessionType" in activity &&
						activity.sessionType === "train-newbies",
				)
				.sort(sortByDate),
			trainWithCoach: normalSessions
				.filter(
					(activity) =>
						"sessionType" in activity &&
						activity.sessionType === "train-with-coach",
				)
				.sort(sortByDate),
			others: normalSessions
				.filter(
					(activity) =>
						"sessionType" in activity && activity.sessionType === "others",
				)
				.sort(sortByDate),
		};
	};

	return {
		thirtyMinSessions: groupThirtyMinSessions(activities),
		enduranceRuns: activities
			.filter((activity) => activity.activity === "endurance-run")
			.sort(sortByDate),
		normalSessions: groupNormalSessions(activities),
	};
}

interface WeeklyGoals {
	thirtyMin: {
		personalTechnique: number;
		probabilityPractice: number;
		buddyTraining: number;
	};
	enduranceRun: number;
	normalSession: {
		trainWithCoach: number;
		trainNewbies: number;
	};
}

const WEEKLY_GOALS: WeeklyGoals = {
	thirtyMin: {
		personalTechnique: 2,
		probabilityPractice: 1,
		buddyTraining: 1,
	},
	enduranceRun: 2,
	normalSession: {
		trainWithCoach: 1,
		trainNewbies: 1,
	},
};

function GoalIndicator({ current, goal }: { current: number; goal: number }) {
	return (
		<div className="flex items-center gap-1 text-sm">
			<div className="font-medium">
				{current}/{goal}
			</div>
			<div className={current >= goal ? "text-green-500" : "text-yellow-500"}>
				({current >= goal ? "Complete" : "In Progress"})
			</div>
		</div>
	);
}

interface GroupProgressProps {
	groupedActivities: ReturnType<typeof groupActivities>["thirtyMinSessions"];
	goals: WeeklyGoals["thirtyMin"];
}

function ThirtyMinProgress({ groupedActivities, goals }: GroupProgressProps) {
	const totalCompleted =
		(groupedActivities.probabilityPractice.length >= goals.probabilityPractice
			? 1
			: 0) +
		(groupedActivities.personalTechnique.length >= goals.personalTechnique
			? 1
			: 0) +
		(groupedActivities.buddyTraining.length >= goals.buddyTraining ? 1 : 0);

	const totalGoals = 3; // Total number of different activities

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-1 text-sm hover:bg-gray-50 p-1 rounded"
				>
					<div className="font-medium">
						{totalCompleted}/{totalGoals}
					</div>
					<div
						className={
							totalCompleted === totalGoals
								? "text-green-500"
								: "text-yellow-500"
						}
					>
						({totalCompleted === totalGoals ? "Complete" : "In Progress"})
					</div>
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<span>Probability Practice</span>
						<GoalIndicator
							current={groupedActivities.probabilityPractice.length}
							goal={goals.probabilityPractice}
						/>
					</div>
					<div className="flex justify-between items-center">
						<span>Personal Technique</span>
						<GoalIndicator
							current={groupedActivities.personalTechnique.length}
							goal={goals.personalTechnique}
						/>
					</div>
					<div className="flex justify-between items-center">
						<span>Buddy Training</span>
						<GoalIndicator
							current={groupedActivities.buddyTraining.length}
							goal={goals.buddyTraining}
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

interface NormalSessionProgressProps {
	groupedActivities: ReturnType<typeof groupActivities>["normalSessions"];
	goals: WeeklyGoals["normalSession"];
}

function NormalSessionProgress({
	groupedActivities,
	goals,
}: NormalSessionProgressProps) {
	const totalCompleted =
		(groupedActivities.trainWithCoach.length >= goals.trainWithCoach ? 1 : 0) +
		(groupedActivities.trainNewbies.length >= goals.trainNewbies ? 1 : 0);

	const totalGoals = 2; // Train with coach and train newbies

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-1 text-sm hover:bg-gray-50 p-1 rounded"
				>
					<div className="font-medium">
						{totalCompleted}/{totalGoals}
					</div>
					<div
						className={
							totalCompleted === totalGoals
								? "text-green-500"
								: "text-yellow-500"
						}
					>
						({totalCompleted === totalGoals ? "Complete" : "In Progress"})
					</div>
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<span>Train with Coach</span>
						<GoalIndicator
							current={groupedActivities.trainWithCoach.length}
							goal={goals.trainWithCoach}
						/>
					</div>
					<div className="flex justify-between items-center">
						<span>Train Newbies</span>
						<GoalIndicator
							current={groupedActivities.trainNewbies.length}
							goal={goals.trainNewbies}
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

/**
 * Calculates the start and end dates of a week based on a week offset
 * @param weekOffset - Number of weeks to offset from current week (negative for past weeks)
 * @returns Object containing start date (Monday) and end date (Sunday) of the specified week
 *
 * Examples:
 * - weekOffset = 0: Current week
 * - weekOffset = -1: Last week
 * - weekOffset = -2: Two weeks ago
 *
 * Note: Week starts on Monday and ends on Sunday, using Asia/Saigon timezone
 */
async function getWeekRange(weekOffset = 0) {
	await connection();

	// Create date in Asia/Saigon timezone
	const today = new Date(
		new Date().toLocaleString("en-US", { timeZone: "Asia/Saigon" }),
	);

	// Calculate start of week (Monday)
	const startOfWeek = new Date(today);
	const currentDay = today.getDay();
	// Convert Sunday (0) to 7 for easier calculation
	const daysFromMonday = currentDay === 0 ? 7 : currentDay;
	// Subtract days to get to Monday, then add offset weeks
	startOfWeek.setDate(today.getDate() - (daysFromMonday - 1) + weekOffset * 7);
	startOfWeek.setHours(0, 0, 0, 0);

	// Calculate end of week (Sunday)
	const endOfWeek = new Date(startOfWeek);
	// Add 6 days to Monday to get to Sunday
	endOfWeek.setDate(startOfWeek.getDate() + 6);
	endOfWeek.setHours(23, 59, 59, 999);

	return {
		start: startOfWeek,
		end: endOfWeek,
	};
}

export default async function ThisWeekPage() {
	// const [weekOffset, setWeekOffset] = useState(0);
	const weekRange = await getWeekRange(0);

	// Filter activities for the selected week
	const filteredData = mockAttendanceData.map((athlete) => ({
		...athlete,
		activities: athlete.activities.filter((activity) => {
			const activityDate = new Date(activity.submittedAt);
			return activityDate >= weekRange.start && activityDate <= weekRange.end;
		}),
	}));

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Attendance</h1>
				<div className="flex items-center gap-2">
					<button
						type="button"
						className="flex items-center gap-1 text-sm hover:bg-gray-50 p-1 rounded"
						// onClick={() => setWeekOffset((prev) => prev - 1)}
					>
						<ChevronLeft className="h-4 w-4 mr-1" />
						Previous Week
					</button>
					<div className="text-sm font-medium">
						{weekRange.start.toLocaleDateString()} -{" "}
						{weekRange.end.toLocaleDateString()}
					</div>
					<button
						type="button"
						className="flex items-center gap-1 text-sm hover:bg-gray-50 p-1 rounded"
						// onClick={() => setWeekOffset((prev) => prev + 1)}
						// disabled={weekOffset >= 0}
					>
						Next Week
						<ChevronRight className="h-4 w-4 ml-1" />
					</button>
				</div>
			</div>
			<div className="space-y-6">
				{filteredData.map((athlete) => {
					const groupedActivities = groupActivities(athlete.activities);

					return (
						<div
							key={athlete.athleteName}
							className="border rounded-lg p-3 shadow-sm"
						>
							<h2 className="text-xl font-semibold mb-3">
								{athlete.athleteName}
							</h2>

							<div className="grid grid-cols-3 gap-3">
								{/* 30 Minutes Sessions */}
								<div className="border rounded-lg p-3">
									<div className="flex justify-between items-center mb-2 pb-2 border-b">
										<h3 className="text-lg font-medium text-blue-600">
											30 Minutes Sessions
										</h3>
										<ThirtyMinProgress
											groupedActivities={groupedActivities.thirtyMinSessions}
											goals={WEEKLY_GOALS.thirtyMin}
										/>
									</div>
									<div className="space-y-3 max-h-[300px] overflow-y-auto">
										{/* Probability Practice */}
										<div className="space-y-2">
											<div className="flex justify-between items-center">
												<h4 className="text-sm font-medium text-blue-500">
													Probability Practice
												</h4>
											</div>
											{groupedActivities.thirtyMinSessions.probabilityPractice.map(
												(activity) => (
													<div
														key={activity.attendanceId}
														className="bg-gray-50 p-2 rounded"
													>
														<div className="text-sm font-medium text-blue-600 mb-1">
															{formatDate(activity.submittedAt)}
														</div>
														<div className="text-sm">
															{getActivityDescription(activity)}
														</div>
													</div>
												),
											)}
										</div>

										{/* Personal Technique */}
										<div className="space-y-2">
											<div className="flex justify-between items-center">
												<h4 className="text-sm font-medium text-blue-500">
													Personal Technique
												</h4>
											</div>
											{groupedActivities.thirtyMinSessions.personalTechnique.map(
												(activity) => (
													<div
														key={activity.attendanceId}
														className="bg-gray-50 p-2 rounded"
													>
														<div className="text-sm font-medium text-blue-600 mb-1">
															{formatDate(activity.submittedAt)}
														</div>
														<div className="text-sm">
															{getActivityDescription(activity)}
														</div>
													</div>
												),
											)}
										</div>

										{/* Buddy Training */}
										<div className="space-y-2">
											<div className="flex justify-between items-center">
												<h4 className="text-sm font-medium text-blue-500">
													Buddy Training
												</h4>
											</div>
											{groupedActivities.thirtyMinSessions.buddyTraining.map(
												(activity) => (
													<div
														key={activity.attendanceId}
														className="bg-gray-50 p-2 rounded"
													>
														<div className="text-sm font-medium text-blue-600 mb-1">
															{formatDate(activity.submittedAt)}
														</div>
														<div className="text-sm">
															{getActivityDescription(activity)}
														</div>
													</div>
												),
											)}
										</div>
									</div>
								</div>

								{/* Endurance Runs */}
								<div className="border rounded-lg p-3">
									<div className="flex justify-between items-center mb-2 pb-2 border-b">
										<h3 className="text-lg font-medium text-green-600">
											Endurance Runs
										</h3>
										<GoalIndicator
											current={groupedActivities.enduranceRuns.length}
											goal={WEEKLY_GOALS.enduranceRun}
										/>
									</div>
									<div className="space-y-2 max-h-[300px] overflow-y-auto">
										{groupedActivities.enduranceRuns.map((activity) => (
											<div
												key={activity.attendanceId}
												className="bg-gray-50 p-2 rounded"
											>
												<div className="text-sm font-medium text-green-600 mb-1">
													{formatDate(activity.submittedAt)}
												</div>
												<div className="text-sm">
													{getActivityDescription(activity)}
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Normal Long Sessions */}
								<div className="border rounded-lg p-3">
									<div className="flex justify-between items-center mb-2 pb-2 border-b">
										<h3 className="text-lg font-medium text-purple-600">
											Normal Long Sessions
										</h3>
										<NormalSessionProgress
											groupedActivities={groupedActivities.normalSessions}
											goals={WEEKLY_GOALS.normalSession}
										/>
									</div>
									<div className="space-y-3 max-h-[300px] overflow-y-auto">
										{/* Standard Sessions */}
										{[
											...groupedActivities.normalSessions.trainNewbies,
											...groupedActivities.normalSessions.trainWithCoach,
										]
											.sort((a, b) => b.submittedAt - a.submittedAt)
											.map((activity) => (
												<div
													key={activity.attendanceId}
													className="bg-gray-50 p-2 rounded"
												>
													<div className="text-sm font-medium text-purple-600 mb-1">
														{formatDate(activity.submittedAt)}
													</div>
													<div className="text-sm">
														{getActivityDescription(activity)}
													</div>
												</div>
											))}

										{/* Others */}
										{groupedActivities.normalSessions.others.length > 0 && (
											<div className="space-y-2">
												<h4 className="text-sm font-medium text-purple-500">
													Other Activities
												</h4>
												{groupedActivities.normalSessions.others.map(
													(activity) => (
														<div
															key={activity.attendanceId}
															className="bg-gray-50 p-2 rounded"
														>
															<div className="text-sm font-medium text-purple-600 mb-1">
																{formatDate(activity.submittedAt)}
															</div>
															<div className="text-sm">
																{getActivityDescription(activity)}
															</div>
														</div>
													),
												)}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
