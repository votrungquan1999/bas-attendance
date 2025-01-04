"use client";

import { createReducerContext } from "src/components/reducerContext";
import { useStreakViewYearWeeks } from "./StreakViewContext";

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

export function useBiMonthlyWeeks() {
	const { biMonthlyIndex } = useState();
	const weeks = useStreakViewYearWeeks();

	// Split weeks into bi-monthly periods (roughly 8-9 weeks each)
	const biMonthlyPeriods = Array.from({ length: 6 }, (_, i) => {
		const startMonth = i * 2 + 1;
		return weeks.filter((week) => {
			const month = week.month;
			return month === startMonth || month === startMonth + 1;
		});
	});

	return biMonthlyPeriods[biMonthlyIndex];
}
