"use client";

import { createContext, useContext, useReducer, type Dispatch } from "react";

export function createReducerContext<T, A>(
	reducer: (state: T, action: A) => T,
): {
	ReducerContextProvider: ({
		children,
		value,
	}: {
		children: React.ReactNode;
		value: T;
	}) => JSX.Element;
	useDispatch: () => Dispatch<A>;
	useState: () => T;
};

export function createReducerContext<T, A>(
	reducer: (state: T, action: A) => T,
	initialState: T,
): {
	ReducerContextProvider: ({
		children,
		value,
	}: {
		children: React.ReactNode;
		value?: T;
	}) => JSX.Element;
	useDispatch: () => Dispatch<A>;
	useState: () => T;
};

export function createReducerContext<T, A>(
	reducer: (state: T, action: A) => T,
	initialState?: T,
) {
	const ReducerContext = createContext<{
		state: T;
		dispatch: React.Dispatch<A>;
	} | null>(null);

	function ReducerContextProvider({
		children,
		value,
	}: {
		children: React.ReactNode;
		value?: T;
	}) {
		const init = value ?? initialState;
		if (!init) {
			throw new Error("No initial state provided");
		}

		const [state, dispatch] = useReducer(reducer, init);

		return (
			<ReducerContext.Provider value={{ state, dispatch }}>
				{children}
			</ReducerContext.Provider>
		);
	}

	function WithoutInitialStateProvider({
		children,
		value,
	}: {
		children: React.ReactNode;
		value: T;
	}) {
		return (
			<ReducerContextProvider value={value}>{children}</ReducerContextProvider>
		);
	}

	function useReducerContext() {
		const context = useContext(ReducerContext);
		if (!context) {
			throw new Error(
				"useReducerContext must be used within a ReducerContextProvider",
			);
		}

		return context;
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
		ReducerContextProvider: initialState
			? ReducerContextProvider
			: WithoutInitialStateProvider,
		useDispatch,
		useState,
	};
}
