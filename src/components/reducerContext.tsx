"use client";

import { createContext, useContext, useReducer } from "react";

export default function createReducerContext<T, A>(
	reducer: (state: T, action: A) => T,
	initialState: T,
) {
	const ReducerContext = createContext<{
		state: T;
		dispatch: React.Dispatch<A>;
	}>({ state: initialState, dispatch: () => {} });

	function ReducerContextProvider({
		children,
		value,
	}: {
		children: React.ReactNode;
		value?: T;
	}) {
		const [state, dispatch] = useReducer(reducer, value ?? initialState);

		return (
			<ReducerContext.Provider value={{ state, dispatch }}>
				{children}
			</ReducerContext.Provider>
		);
	}

	function useReducerContext() {
		return useContext(ReducerContext);
	}

	function useDispatch() {
		const { dispatch } = useReducerContext();
		return dispatch;
	}

	function useState() {
		const { state } = useReducerContext();
		return state;
	}

	return {
		ReducerContextProvider,
		useDispatch,
		useState,
	};
}
