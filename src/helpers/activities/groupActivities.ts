import type { CompletedActivity } from "src/app/attendance/activity/types";

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
					"sessionType" in activity && activity.sessionType === "train-newbies",
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

export default function groupActivities(activities: CompletedActivity[]) {
	return {
		thirtyMinSessions: groupThirtyMinSessions(activities),
		enduranceRuns: activities
			.filter((activity) => activity.activity === "endurance-run")
			.sort(sortByDate),
		normalSessions: groupNormalSessions(activities),
	};
}
