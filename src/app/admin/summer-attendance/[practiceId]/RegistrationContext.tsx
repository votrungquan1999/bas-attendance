"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";

export interface Athlete {
	id: string;
	name: string;
}

export interface RegistrationState {
	selectedAthleteIds: string[];
	busyReasons: Record<string, string>; // athleteId -> reason
}

type RegistrationAction =
	| { type: "SET_REGISTERED_ATHLETES"; athleteIds: string[] }
	| { type: "REMOVE_REGISTERED_ATHLETE"; athleteId: string }
	| { type: "UPDATE_BUSY_REASON"; athleteId: string; reason: string }
	| { type: "RESET" };

const initialState: RegistrationState = {
	selectedAthleteIds: [],
	busyReasons: {},
};

function registrationReducer(
	state: RegistrationState,
	action: RegistrationAction,
): RegistrationState {
	switch (action.type) {
		case "SET_REGISTERED_ATHLETES": {
			// replace current selected athlete ids with the athlete ids
			const newSelectedAthleteIds = action.athleteIds;

			return {
				...state,
				selectedAthleteIds: newSelectedAthleteIds,
			};
		}
		case "REMOVE_REGISTERED_ATHLETE":
			return {
				...state,
				selectedAthleteIds: state.selectedAthleteIds.filter(
					(id) => id !== action.athleteId,
				),
			};

		case "UPDATE_BUSY_REASON":
			return {
				...state,
				busyReasons: {
					...state.busyReasons,
					[action.athleteId]: action.reason,
				},
			};

		case "RESET":
			return initialState;

		default:
			return state;
	}
}

interface RegistrationContextType {
	state: RegistrationState;
	dispatch: React.Dispatch<RegistrationAction>;
	isAthleteSelected: (athleteId: string) => boolean;
	getUnselectedAthletes: (allAthletes: Athlete[]) => Athlete[];
}

const RegistrationContext = createContext<RegistrationContextType | null>(null);

export function RegistrationProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(registrationReducer, initialState);

	const isAthleteSelected = (athleteId: string) =>
		state.selectedAthleteIds.some((id) => id === athleteId);

	const getUnselectedAthletes = (allAthletes: Athlete[]) =>
		allAthletes.filter((athlete) => !isAthleteSelected(athlete.id));

	return (
		<RegistrationContext.Provider
			value={{
				state,
				dispatch,
				isAthleteSelected,
				getUnselectedAthletes,
			}}
		>
			{children}
		</RegistrationContext.Provider>
	);
}

export function useRegistration() {
	const context = useContext(RegistrationContext);
	if (!context) {
		throw new Error(
			"useRegistration must be used within a RegistrationProvider",
		);
	}
	return context;
}
