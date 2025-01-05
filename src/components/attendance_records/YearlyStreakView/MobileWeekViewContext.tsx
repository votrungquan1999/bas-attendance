"use client";

import { createReducerContext } from "src/components/reducerContext";

interface MobileWeekViewState {
	biMonthlyIndex: number;
}

const initialState: MobileWeekViewState = {
	biMonthlyIndex: 0,
};

type Action = { type: "setBiMonthlyIndex"; payload: number };

function reducer(
	state: MobileWeekViewState,
	action: Action,
): MobileWeekViewState {
	switch (action.type) {
		case "setBiMonthlyIndex":
			return { ...state, biMonthlyIndex: action.payload };
		default:
			return state;
	}
}

const {
	ReducerContextProvider: MobileWeekViewProvider,
	useDispatch,
	useState,
} = createReducerContext(reducer, initialState);

export { MobileWeekViewProvider };

export function useMobileWeekViewState() {
	const context = useState();

	return context;
}

export function useSetBiMonthlyIndex() {
	const dispatch = useDispatch();

	return (index: number) => {
		dispatch({ type: "setBiMonthlyIndex", payload: index });
	};
}
