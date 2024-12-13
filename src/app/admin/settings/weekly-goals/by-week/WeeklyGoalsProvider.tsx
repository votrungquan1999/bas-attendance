"use client";

import { WEEKLY_GOALS } from "src/server/constants";
import type { WeeklyGoals } from "src/server/types";
import createReducerContext from "src/components/reducerContext";

type WeeklyGoalsState = {
	goals: WeeklyGoals;
	isSaving: boolean;
};

type WeeklyGoalsAction =
	| { type: "SET_THIRTY_MIN_GOALS"; payload: WeeklyGoals["thirtyMin"] }
	| { type: "SET_ENDURANCE_RUN"; payload: number }
	| { type: "SET_NORMAL_SESSION_GOALS"; payload: WeeklyGoals["normalSession"] }
	| { type: "SET_SAVING"; payload: boolean }
	| { type: "UPDATE_PERSONAL_TECHNIQUE"; payload: number }
	| { type: "UPDATE_PROBABILITY_PRACTICE"; payload: number }
	| { type: "UPDATE_BUDDY_TRAINING"; payload: number }
	| { type: "UPDATE_TRAIN_WITH_COACH"; payload: number }
	| { type: "UPDATE_TRAIN_NEWBIES"; payload: number };

const initialState: WeeklyGoalsState = {
	goals: WEEKLY_GOALS,
	isSaving: false,
};

function reducer(
	state: WeeklyGoalsState,
	action: WeeklyGoalsAction,
): WeeklyGoalsState {
	switch (action.type) {
		case "SET_THIRTY_MIN_GOALS":
			return {
				...state,
				goals: {
					...state.goals,
					thirtyMin: action.payload,
				},
			};
		case "SET_ENDURANCE_RUN":
			return {
				...state,
				goals: {
					...state.goals,
					enduranceRun: action.payload,
				},
			};
		case "SET_NORMAL_SESSION_GOALS":
			return {
				...state,
				goals: {
					...state.goals,
					normalSession: action.payload,
				},
			};
		case "SET_SAVING":
			return {
				...state,
				isSaving: action.payload,
			};
		case "UPDATE_PERSONAL_TECHNIQUE":
			return {
				...state,
				goals: {
					...state.goals,
					thirtyMin: {
						...state.goals.thirtyMin,
						personalTechnique: action.payload,
					},
				},
			};
		case "UPDATE_PROBABILITY_PRACTICE":
			return {
				...state,
				goals: {
					...state.goals,
					thirtyMin: {
						...state.goals.thirtyMin,
						probabilityPractice: action.payload,
					},
				},
			};
		case "UPDATE_BUDDY_TRAINING":
			return {
				...state,
				goals: {
					...state.goals,
					thirtyMin: {
						...state.goals.thirtyMin,
						buddyTraining: action.payload,
					},
				},
			};
		case "UPDATE_TRAIN_WITH_COACH":
			return {
				...state,
				goals: {
					...state.goals,
					normalSession: {
						...state.goals.normalSession,
						trainWithCoach: action.payload,
					},
				},
			};
		case "UPDATE_TRAIN_NEWBIES":
			return {
				...state,
				goals: {
					...state.goals,
					normalSession: {
						...state.goals.normalSession,
						trainNewbies: action.payload,
					},
				},
			};
	}
}

const { ReducerContextProvider, useDispatch, useState } = createReducerContext(
	reducer,
	initialState,
);

export function WeeklyGoalsProvider({
	children,
}: { children: React.ReactNode }) {
	return <ReducerContextProvider>{children}</ReducerContextProvider>;
}

export function useWeeklyGoals() {
	const state = useState();
	const dispatch = useDispatch();

	const allThirtyMinGoalsAreZero = () =>
		state.goals.thirtyMin.personalTechnique === 0 &&
		state.goals.thirtyMin.probabilityPractice === 0 &&
		state.goals.thirtyMin.buddyTraining === 0;

	const allNormalSessionGoalsAreZero = () =>
		state.goals.normalSession.trainWithCoach === 0 &&
		state.goals.normalSession.trainNewbies === 0;

	const handleSave = async () => {
		dispatch({ type: "SET_SAVING", payload: true });
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
		} catch (error) {
			console.error("Failed to save goals:", error);
		} finally {
			dispatch({ type: "SET_SAVING", payload: false });
		}
	};

	return {
		state,
		dispatch,
		allThirtyMinGoalsAreZero,
		allNormalSessionGoalsAreZero,
		handleSave,
	};
}
