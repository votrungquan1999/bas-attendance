// Define all activity types
export type Activity =
	| "30-minutes-session"
	| "endurance-run"
	| "normal-long-session";
export type ThirtyMinutesSessionActivity =
	| "personal-technique"
	| "probability-practice"
	| "buddy-training";
export type ProbabilityActivity = "layup" | "straight-shot" | "attack-board";
export type NormalSessionActivity =
	| "train-newbies"
	| "train-with-coach"
	| "others";
export type PracticeLevel = "1" | "2" | "3" | "4";

// Base type for all completed activities
export interface BaseCompletedActivity {
	id: string;
	attendanceId: string;

	submittedAt: number;

	// this timestamp is the start of the day of the activity, in the timezone of Asia/Saigon
	activityTimestamp: number;
}

// Type for completed 30-min probability practice
export interface CompletedProbabilityPractice extends BaseCompletedActivity {
	activity: "30-minutes-session";
	thirtyMinActivity: "probability-practice";
	practiceType: ProbabilityActivity;
	practiceLevel: PracticeLevel;
	practiceDescription: string;
}

// Type for completed other 30-min activities
export interface CompletedThirtyMinActivity extends BaseCompletedActivity {
	activity: "30-minutes-session";
	thirtyMinActivity: "personal-technique" | "buddy-training";
	thirtyMinExplanation: string;
}

// Type for completed endurance run
export interface CompletedEnduranceRun extends BaseCompletedActivity {
	activity: "endurance-run";
	laps: string;
	minutes: string;
}

// Type for completed normal session with "others" type
export interface CompletedOtherSession extends BaseCompletedActivity {
	activity: "normal-long-session";
	sessionType: "others";
	sessionExplanation: string;
}

// Type for completed normal session with standard types
export interface CompletedStandardSession extends BaseCompletedActivity {
	activity: "normal-long-session";
	sessionType: "train-newbies" | "train-with-coach";
}

// Union type of all possible completed activities
export type CompletedActivity =
	| CompletedProbabilityPractice
	| CompletedThirtyMinActivity
	| CompletedEnduranceRun
	| CompletedOtherSession
	| CompletedStandardSession;
