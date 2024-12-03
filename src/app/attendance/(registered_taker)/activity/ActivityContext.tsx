"use client";

import {
	createContext,
	useContext,
	useEffect,
	useReducer,
	type ReactNode,
} from "react";
import type {
	Activity,
	ThirtyMinutesSessionActivity,
	ProbabilityActivity,
	NormalSessionActivity,
} from "../../../../server/types";
import { DateTime } from "luxon";

export interface ActivityState {
	activityTimestamp: number;

	// Main activity
	activity?: Activity;

	// 30 Minutes Session
	thirtyMinActivity?: ThirtyMinutesSessionActivity;
	thirtyMinExplanation?: string;

	// Probability Practice
	practiceType?: ProbabilityActivity;
	practiceLevel?: string;
	practiceDescription?: string;

	// Endurance Run
	laps?: string;
	minutes?: string;

	// Normal Long Session
	sessionType?: NormalSessionActivity;
	sessionExplanation?: string;
}

type ActionType =
	| { type: "SET_ATTENDANCE_TIMESTAMP"; payload: number }
	| { type: "SET_ACTIVITY"; payload?: Activity }
	| { type: "SET_THIRTY_MIN_ACTIVITY"; payload?: ThirtyMinutesSessionActivity }
	| { type: "SET_THIRTY_MIN_EXPLANATION"; payload: string }
	| { type: "SET_PRACTICE_TYPE"; payload?: ProbabilityActivity }
	| { type: "SET_PRACTICE_LEVEL"; payload?: string }
	| { type: "SET_PRACTICE_DESCRIPTION"; payload: string }
	| { type: "SET_LAPS"; payload?: string }
	| { type: "SET_MINUTES"; payload?: string }
	| { type: "SET_SESSION_TYPE"; payload?: NormalSessionActivity }
	| { type: "SET_SESSION_EXPLANATION"; payload: string }
	| { type: "RESET_ALL" };

const initialState: ActivityState = {
	activityTimestamp: 0,
	activity: undefined,
	thirtyMinActivity: undefined,
	thirtyMinExplanation: undefined,
	practiceType: undefined,
	practiceLevel: undefined,
	practiceDescription: undefined,
	laps: undefined,
	minutes: undefined,
	sessionType: undefined,
	sessionExplanation: undefined,
};

function activityReducer(
	state: ActivityState,
	action: ActionType,
): ActivityState {
	switch (action.type) {
		case "SET_ATTENDANCE_TIMESTAMP":
			return {
				...state,
				activityTimestamp: action.payload,
			};
		case "SET_ACTIVITY":
			if (action.payload === state.activity) {
				return state;
			}

			return {
				...state, // Reset all fields
				activity: action.payload,
			};
		case "SET_THIRTY_MIN_ACTIVITY":
			return {
				...state,
				thirtyMinActivity: action.payload,
				thirtyMinExplanation: "", // Reset explanation when activity changes
			};
		case "SET_THIRTY_MIN_EXPLANATION":
			return {
				...state,
				thirtyMinExplanation: action.payload,
			};
		case "SET_PRACTICE_TYPE":
			return {
				...state,
				practiceType: action.payload,
				practiceLevel: undefined, // Reset dependent fields
				practiceDescription: "",
			};
		case "SET_PRACTICE_LEVEL":
			return {
				...state,
				practiceLevel: action.payload,
			};
		case "SET_PRACTICE_DESCRIPTION":
			return {
				...state,
				practiceDescription: action.payload,
			};
		case "SET_LAPS":
			return {
				...state,
				laps: action.payload,
			};
		case "SET_MINUTES":
			return {
				...state,
				minutes: action.payload,
			};
		case "SET_SESSION_TYPE":
			return {
				...state,
				sessionType: action.payload,
				sessionExplanation: "", // Reset explanation when type changes
			};
		case "SET_SESSION_EXPLANATION":
			return {
				...state,
				sessionExplanation: action.payload,
			};
		case "RESET_ALL":
			return {
				...initialState,
				activityTimestamp: state.activityTimestamp,
			};
		default:
			return state;
	}
}

interface ActivityContextType {
	state: ActivityState;
	dispatch: React.Dispatch<ActionType>;
}
const ActivityContext = createContext<ActivityContextType | undefined>(
	undefined,
);

export function ActivityProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(activityReducer, initialState);

	useEffect(() => {
		const now = DateTime.now().setZone("Asia/Saigon").startOf("day").toMillis();

		dispatch({
			type: "SET_ATTENDANCE_TIMESTAMP",
			payload: now,
		});
	}, []);

	return (
		<ActivityContext.Provider value={{ state, dispatch }}>
			{children}
		</ActivityContext.Provider>
	);
}

export function useActivity() {
	const context = useContext(ActivityContext);
	if (context === undefined) {
		throw new Error("useActivity must be used within an ActivityProvider");
	}
	return context;
}
