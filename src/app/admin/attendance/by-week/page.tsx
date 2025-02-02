// import type { CompletedActivity } from "src/app/attendance/activity/types";
import WeekRangeNav from "src/components/attendance_records/WeekRangeNav";
import getWeekRange from "src/helpers/weekRange";
import ThirtyMinutesSessionsProgress from "../../../../components/attendance_records/ThirtyMinutesSessionsProgress";
import EnduranceRunsProgress from "../../../../components/attendance_records/EnduranceRunsProgress";
import NormalLongSessionsProgress from "../../../../components/attendance_records/NormalLongSessionsProgress";
import groupActivities from "src/helpers/activities/groupActivities";
import { redirect } from "next/navigation";
import query_getAttendanceData from "./query_getAttendanceData";
import type { Taker } from "src/app/attendance/taker/getTakers";
import query_getEligibleAthletes from "./query_getEligibleAthletes";
import { WEEKLY_GOALS } from "src/server/constants";

// Mock data for demonstration, keep it here for now
// const mockAttendanceData: {
// 	athleteName: string;
// 	activities: CompletedActivity[];
// }[] = [
// 	{
// 		athleteName: "John Doe",
// 		activities: [
// 			{
// 				id: "1",
// 				attendanceId: "1",
// 				submittedAt: Date.now() - 86400000 * 1,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "probability-practice",
// 				practiceType: "attack-board",
// 				practiceLevel: "3",
// 				practiceDescription: "Made 25 consecutive backboard finishes",
// 			},
// 			{
// 				id: "2",
// 				attendanceId: "2",
// 				submittedAt: Date.now() - 86400000 * 2,
// 				activity: "endurance-run",
// 				laps: "20",
// 				minutes: "30",
// 			},
// 			{
// 				id: "3",
// 				attendanceId: "3",
// 				submittedAt: Date.now() - 86400000 * 2,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "buddy-training",
// 				thirtyMinExplanation: "Pick and roll practice with Mike",
// 			},
// 			{
// 				id: "4",
// 				attendanceId: "4",
// 				submittedAt: Date.now() - 86400000 * 3,
// 				activity: "normal-long-session",
// 				sessionType: "train-with-coach",
// 			},
// 			{
// 				id: "5",
// 				attendanceId: "5",
// 				submittedAt: Date.now() - 86400000 * 3,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "probability-practice",
// 				practiceType: "straight-shot",
// 				practiceLevel: "2",
// 				practiceDescription: "Free throw practice, 45/50 made",
// 			},
// 			{
// 				id: "6",
// 				attendanceId: "6",
// 				submittedAt: Date.now() - 86400000 * 4,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "personal-technique",
// 				thirtyMinExplanation: "Crossover and between-legs dribbling",
// 			},
// 			{
// 				id: "7",
// 				attendanceId: "7",
// 				submittedAt: Date.now() - 86400000 * 4,
// 				activity: "normal-long-session",
// 				sessionType: "others",
// 				sessionExplanation: "3v3 tournament practice",
// 			},
// 			{
// 				id: "8",
// 				attendanceId: "8",
// 				submittedAt: Date.now() - 86400000 * 5,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "probability-practice",
// 				practiceType: "layup",
// 				practiceLevel: "4",
// 				practiceDescription: "Reverse layup practice, 18/20 success",
// 			},
// 			{
// 				id: "9",
// 				attendanceId: "9",
// 				submittedAt: Date.now() - 86400000 * 5,
// 				activity: "endurance-run",
// 				laps: "25",
// 				minutes: "35",
// 			},
// 			{
// 				id: "10",
// 				attendanceId: "10",
// 				submittedAt: Date.now() - 86400000 * 6,
// 				activity: "normal-long-session",
// 				sessionType: "train-newbies",
// 			},
// 		],
// 	},
// 	{
// 		athleteName: "Sarah Williams",
// 		activities: [
// 			{
// 				id: "11",
// 				attendanceId: "11",
// 				submittedAt: Date.now() - 86400000 * 1,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "probability-practice",
// 				practiceType: "layup",
// 				practiceLevel: "4",
// 				practiceDescription: "Euro-step layup drills, 19/20 success rate",
// 			},
// 			{
// 				id: "12",
// 				attendanceId: "12",
// 				submittedAt: Date.now() - 86400000 * 1,
// 				activity: "normal-long-session",
// 				sessionType: "train-with-coach",
// 			},
// 			{
// 				id: "13",
// 				attendanceId: "13",
// 				submittedAt: Date.now() - 86400000 * 2,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "personal-technique",
// 				thirtyMinExplanation: "Advanced ball handling sequences",
// 			},
// 			{
// 				id: "14",
// 				attendanceId: "14",
// 				submittedAt: Date.now() - 86400000 * 3,
// 				activity: "normal-long-session",
// 				sessionType: "others",
// 				sessionExplanation: "Full court 5v5 scrimmage",
// 			},
// 			{
// 				id: "15",
// 				attendanceId: "15",
// 				submittedAt: Date.now() - 86400000 * 3,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "probability-practice",
// 				practiceType: "straight-shot",
// 				practiceLevel: "4",
// 				practiceDescription: "Three-point shooting practice, 40/50 made",
// 			},
// 			{
// 				id: "16",
// 				attendanceId: "16",
// 				submittedAt: Date.now() - 86400000 * 4,
// 				activity: "endurance-run",
// 				laps: "30",
// 				minutes: "40",
// 			},
// 			{
// 				id: "17",
// 				attendanceId: "17",
// 				submittedAt: Date.now() - 86400000 * 4,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "buddy-training",
// 				thirtyMinExplanation: "Defense rotation drills with team",
// 			},
// 			{
// 				id: "18",
// 				attendanceId: "18",
// 				submittedAt: Date.now() - 86400000 * 5,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "probability-practice",
// 				practiceType: "attack-board",
// 				practiceLevel: "3",
// 				practiceDescription: "Offensive rebound and putback practice",
// 			},
// 			{
// 				id: "19",
// 				attendanceId: "19",
// 				submittedAt: Date.now() - 86400000 * 5,
// 				activity: "normal-long-session",
// 				sessionType: "train-newbies",
// 			},
// 			{
// 				id: "20",
// 				attendanceId: "20",
// 				submittedAt: Date.now() - 86400000 * 6,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "personal-technique",
// 				thirtyMinExplanation: "Post move sequences and footwork",
// 			},
// 		],
// 	},
// 	{
// 		athleteName: "Mike Johnson",
// 		activities: [
// 			{
// 				id: "21",
// 				attendanceId: "21",
// 				submittedAt: Date.now() - 86400000 * 1,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "personal-technique",
// 				thirtyMinExplanation: "Defensive slides and positioning",
// 			},
// 			{
// 				id: "22",
// 				attendanceId: "22",
// 				submittedAt: Date.now() - 86400000 * 1,
// 				activity: "normal-long-session",
// 				sessionType: "others",
// 				sessionExplanation: "Team defensive drills and scrimmage",
// 			},
// 			{
// 				id: "23",
// 				attendanceId: "23",
// 				submittedAt: Date.now() - 86400000 * 2,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "probability-practice",
// 				practiceType: "straight-shot",
// 				practiceLevel: "3",
// 				practiceDescription: "Mid-range jump shots, 35/40 made",
// 			},
// 			{
// 				id: "24",
// 				attendanceId: "24",
// 				submittedAt: Date.now() - 86400000 * 2,
// 				activity: "endurance-run",
// 				laps: "25",
// 				minutes: "35",
// 			},
// 			{
// 				id: "25",
// 				attendanceId: "25",
// 				submittedAt: Date.now() - 86400000 * 3,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "buddy-training",
// 				thirtyMinExplanation: "Screen and roll defense practice",
// 			},
// 			{
// 				id: "26",
// 				attendanceId: "26",
// 				submittedAt: Date.now() - 86400000 * 4,
// 				activity: "normal-long-session",
// 				sessionType: "train-with-coach",
// 			},
// 			{
// 				id: "27",
// 				attendanceId: "27",
// 				submittedAt: Date.now() - 86400000 * 4,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "probability-practice",
// 				practiceType: "attack-board",
// 				practiceLevel: "2",
// 				practiceDescription: "Offensive rebound positioning drills",
// 			},
// 			{
// 				id: "28",
// 				attendanceId: "28",
// 				submittedAt: Date.now() - 86400000 * 5,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "personal-technique",
// 				thirtyMinExplanation: "Ball screen navigation drills",
// 			},
// 			{
// 				id: "29",
// 				attendanceId: "29",
// 				submittedAt: Date.now() - 86400000 * 5,
// 				activity: "normal-long-session",
// 				sessionType: "others",
// 				sessionExplanation: "Practice game with visiting team",
// 			},
// 			{
// 				id: "30",
// 				attendanceId: "30",
// 				submittedAt: Date.now() - 86400000 * 6,
// 				activity: "30-minutes-session",
// 				thirtyMinActivity: "probability-practice",
// 				practiceType: "layup",
// 				practiceLevel: "3",
// 				practiceDescription: "Floater and runner practice, 15/20 made",
// 			},
// 		],
// 	},
// ];

interface RemainingGoals {
	thirtyMin?: {
		personalTechnique?: number;
		probabilityPractice?: number;
		buddyTraining?: number;
	};
	enduranceRun?: number;
	normalSession?: {
		trainWithCoach?: number;
		trainNewbies?: number;
	};
}

function calculateRemainingGoals(
	groupedActivities: ReturnType<typeof groupActivities>,
): RemainingGoals {
	const remaining: RemainingGoals = {};

	// Check thirty minutes sessions
	const thirtyMin: RemainingGoals["thirtyMin"] = {};
	if (
		(groupedActivities.thirtyMinSessions.personalTechnique?.length || 0) <
		WEEKLY_GOALS.thirtyMin.personalTechnique
	) {
		thirtyMin.personalTechnique =
			WEEKLY_GOALS.thirtyMin.personalTechnique -
			(groupedActivities.thirtyMinSessions.personalTechnique?.length || 0);
	}
	if (
		(groupedActivities.thirtyMinSessions.probabilityPractice?.length || 0) <
		WEEKLY_GOALS.thirtyMin.probabilityPractice
	) {
		thirtyMin.probabilityPractice =
			WEEKLY_GOALS.thirtyMin.probabilityPractice -
			(groupedActivities.thirtyMinSessions.probabilityPractice?.length || 0);
	}
	if (
		(groupedActivities.thirtyMinSessions.buddyTraining?.length || 0) <
		WEEKLY_GOALS.thirtyMin.buddyTraining
	) {
		thirtyMin.buddyTraining =
			WEEKLY_GOALS.thirtyMin.buddyTraining -
			(groupedActivities.thirtyMinSessions.buddyTraining?.length || 0);
	}
	if (Object.keys(thirtyMin).length > 0) {
		remaining.thirtyMin = thirtyMin;
	}

	// Check endurance runs
	if (groupedActivities.enduranceRuns.length < WEEKLY_GOALS.enduranceRun) {
		remaining.enduranceRun =
			WEEKLY_GOALS.enduranceRun - groupedActivities.enduranceRuns.length;
	}

	// Check normal sessions
	const normalSession: RemainingGoals["normalSession"] = {};
	if (
		(groupedActivities.normalSessions.trainWithCoach?.length || 0) <
		WEEKLY_GOALS.normalSession.trainWithCoach
	) {
		normalSession.trainWithCoach =
			WEEKLY_GOALS.normalSession.trainWithCoach -
			(groupedActivities.normalSessions.trainWithCoach?.length || 0);
	}
	if (
		(groupedActivities.normalSessions.trainNewbies?.length || 0) <
		WEEKLY_GOALS.normalSession.trainNewbies
	) {
		normalSession.trainNewbies =
			WEEKLY_GOALS.normalSession.trainNewbies -
			(groupedActivities.normalSessions.trainNewbies?.length || 0);
	}
	if (Object.keys(normalSession).length > 0) {
		remaining.normalSession = normalSession;
	}

	return remaining;
}

function has30MinGoals(remainingGoals: RemainingGoals): boolean {
	return !!remainingGoals.thirtyMin;
}

function hasOtherGoals(remainingGoals: RemainingGoals): boolean {
	return !!remainingGoals.enduranceRun || !!remainingGoals.normalSession;
}

export default async function ThisWeekPage({
	searchParams,
}: {
	searchParams: Promise<{ weekOffset: string | undefined }>;
}) {
	const paramsWeekOffset = (await searchParams).weekOffset;
	const weekOffset = paramsWeekOffset ? Number.parseInt(paramsWeekOffset) : 0;

	if (weekOffset > 0) {
		redirect("/admin/attendance/by-week");
	}

	const weekRange = await getWeekRange(weekOffset);
	const attendanceData = await query_getAttendanceData(weekRange);
	const eligibleAthletes = await query_getEligibleAthletes();

	// Create a map of athletes who have recorded activities
	const recordedAthletesMap = new Map(
		attendanceData.map((athlete) => [athlete.athleteName, athlete]),
	);

	return (
		<div className="p-6">
			<div className="flex justify-end items-center mb-4">
				<WeekRangeNav
					weekRange={weekRange}
					disableNextWeek={weekOffset === 0}
				/>
			</div>

			{/* Progress Section */}
			<div className="space-y-6 mb-8">
				{attendanceData.map(async (athlete) => {
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
								<ThirtyMinutesSessionsProgress
									groupedActivities={groupedActivities.thirtyMinSessions}
									goals={WEEKLY_GOALS.thirtyMin}
								/>

								<EnduranceRunsProgress
									activities={groupedActivities.enduranceRuns}
									goal={WEEKLY_GOALS.enduranceRun}
								/>

								<NormalLongSessionsProgress
									groupedActivities={groupedActivities.normalSessions}
									goals={WEEKLY_GOALS.normalSession}
								/>
							</div>
						</div>
					);
				})}
			</div>

			{/* Incomplete Goals Section */}
			<div className="border rounded-lg p-4 bg-orange-50">
				<h2 className="text-xl font-semibold mb-3">Incomplete Weekly Goals</h2>

				{/* 30 Minutes Sessions Section */}
				<div className="mb-6">
					<h3 className="text-lg font-medium mb-2 text-orange-700">
						Missing 30-Minutes Sessions
					</h3>
					<div className="space-y-3">
						{eligibleAthletes.map((athlete: Taker) => {
							const recordedData = recordedAthletesMap.get(athlete.value);
							const groupedActivities = recordedData
								? groupActivities(recordedData.activities)
								: groupActivities([]);
							const remainingGoals = calculateRemainingGoals(groupedActivities);

							if (!has30MinGoals(remainingGoals)) return null;

							return (
								<div
									key={`30min-${athlete.id}`}
									className="border-b pb-2 last:border-b-0"
								>
									<h4 className="font-medium">{athlete.value}</h4>
									<div className="ml-4 text-sm text-gray-600 border-l-2 pl-2 my-1 border-orange-400">
										{remainingGoals.thirtyMin?.personalTechnique && (
											<div>
												Personal Technique:{" "}
												{remainingGoals.thirtyMin.personalTechnique} more
											</div>
										)}
										{remainingGoals.thirtyMin?.probabilityPractice && (
											<div>
												Probability Practice:{" "}
												{remainingGoals.thirtyMin.probabilityPractice} more
											</div>
										)}
										{remainingGoals.thirtyMin?.buddyTraining && (
											<div>
												Buddy Training: {remainingGoals.thirtyMin.buddyTraining}{" "}
												more
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Other Goals Section */}
				<div>
					<h3 className="text-lg font-medium mb-2">Missing Other Goals</h3>
					<div className="space-y-3">
						{eligibleAthletes.map((athlete: Taker) => {
							const recordedData = recordedAthletesMap.get(athlete.value);
							const groupedActivities = recordedData
								? groupActivities(recordedData.activities)
								: groupActivities([]);
							const remainingGoals = calculateRemainingGoals(groupedActivities);

							if (!hasOtherGoals(remainingGoals)) return null;

							return (
								<div
									key={`other-${athlete.id}`}
									className="border-b pb-2 last:border-b-0"
								>
									<h4 className="font-medium">{athlete.value}</h4>
									<ul className="ml-4 text-sm text-gray-600">
										{remainingGoals.enduranceRun && (
											<li>
												Endurance Runs: {remainingGoals.enduranceRun} more
												needed
											</li>
										)}
										{remainingGoals.normalSession && (
											<li>
												Normal Sessions:
												{remainingGoals.normalSession.trainWithCoach &&
													` Train with Coach (${remainingGoals.normalSession.trainWithCoach} more)`}
												{remainingGoals.normalSession.trainNewbies &&
													` Train Newbies (${remainingGoals.normalSession.trainNewbies} more)`}
											</li>
										)}
									</ul>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
