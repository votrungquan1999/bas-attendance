import type { CompletedActivity } from "src/app/attendance/activity/types";
import WeekRangeNav from "src/app/admin/attendance/components/WeekRangeNav";
import getWeekRange from "src/helpers/weekRange";
import ThirtyMinutesSessionsProgress from "../components/ThirtyMinutesSessionsProgress";
import EnduranceRunsProgress from "../components/EnduranceRunsProgress";
import NormalLongSessionsProgress from "../components/NormalLongSessionsProgress";
import groupActivities from "src/helpers/activities/groupActivities";

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

export default async function ThisWeekPage() {
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
				<WeekRangeNav weekRange={weekRange} />
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
		</div>
	);
}
