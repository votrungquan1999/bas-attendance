import type { ProbabilityActivity } from "./ActivityContext";

// Base type for all completed activities
export interface BaseCompletedActivity {
	attendanceId: string;
	submittedAt: number;
}

// Type for completed 30-min probability practice
export interface CompletedProbabilityPractice extends BaseCompletedActivity {
	activity: "30-minutes-session";
	thirtyMinActivity: "probability-practice";
	practiceType: ProbabilityActivity;
	practiceLevel: string;
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
