"use client";

import type { WeeklyGoals } from "src/server/types";
import { createReducerContext } from "src/components/reducerContext";

type WeeklyGoalsState = {
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
};

type WeeklyGoalsAction =
	| { type: "SET_THIRTY_MIN_GOALS"; payload: WeeklyGoals["thirtyMin"] }
	| { type: "SET_ENDURANCE_RUN"; payload: number }
	| { type: "SET_NORMAL_SESSION_GOALS"; payload: WeeklyGoals["normalSession"] }
	| { type: "UPDATE_PERSONAL_TECHNIQUE"; payload: number }
	| { type: "UPDATE_PROBABILITY_PRACTICE"; payload: number }
	| { type: "UPDATE_BUDDY_TRAINING"; payload: number }
	| { type: "UPDATE_TRAIN_WITH_COACH"; payload: number }
	| { type: "UPDATE_TRAIN_NEWBIES"; payload: number };

function reducer(
	state: WeeklyGoalsState,
	action: WeeklyGoalsAction,
): WeeklyGoalsState {
	switch (action.type) {
		case "SET_THIRTY_MIN_GOALS":
			return {
				...state,
				thirtyMin: action.payload,
			};
		case "SET_ENDURANCE_RUN":
			return {
				...state,
				enduranceRun: action.payload,
			};
		case "SET_NORMAL_SESSION_GOALS":
			return {
				...state,
				normalSession: action.payload,
			};
		case "UPDATE_PERSONAL_TECHNIQUE":
			return {
				...state,
				thirtyMin: {
					...state.thirtyMin,
					personalTechnique: action.payload,
				},
			};
		case "UPDATE_PROBABILITY_PRACTICE":
			return {
				...state,
				thirtyMin: {
					...state.thirtyMin,
					probabilityPractice: action.payload,
				},
			};
		case "UPDATE_BUDDY_TRAINING":
			return {
				...state,
				thirtyMin: {
					...state.thirtyMin,
					buddyTraining: action.payload,
				},
			};
		case "UPDATE_TRAIN_WITH_COACH":
			return {
				...state,
				normalSession: {
					...state.normalSession,
					trainWithCoach: action.payload,
				},
			};
		case "UPDATE_TRAIN_NEWBIES":
			return {
				...state,
				normalSession: {
					...state.normalSession,
					trainNewbies: action.payload,
				},
			};
	}
}

const { ReducerContextProvider, useDispatch, useState } =
	createReducerContext(reducer);

export function WeeklyGoalsProvider({
	children,
	initialState,
}: { children: React.ReactNode; initialState: WeeklyGoalsState }) {
	return (
		<ReducerContextProvider value={initialState}>
			{children}
		</ReducerContextProvider>
	);
}

export function useWeeklyGoals() {
	const state = useState();
	const dispatch = useDispatch();

	const allThirtyMinGoalsAreZero = () =>
		state.thirtyMin.personalTechnique === 0 &&
		state.thirtyMin.probabilityPractice === 0 &&
		state.thirtyMin.buddyTraining === 0;

	const allNormalSessionGoalsAreZero = () =>
		state.normalSession.trainWithCoach === 0 &&
		state.normalSession.trainNewbies === 0;

	return {
		state,
		dispatch,
		allThirtyMinGoalsAreZero,
		allNormalSessionGoalsAreZero,
	};
}
