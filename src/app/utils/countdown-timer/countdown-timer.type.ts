export enum CountdownStatus {
	Idle = "idle",
	Running = "running",
	Stopped = "stopped",
	Finished = "finished",
}

export interface CountdownState {
	status: CountdownStatus;
	configuredMs: number;
	remainingMs: number;
}

export type CountdownAction =
	| { type: "SET_MINUTES"; payload: number }
	| { type: "SET_SECONDS"; payload: number }
	| { type: "START" }
	| { type: "TICK"; payload: number }
	| { type: "STOP" }
	| { type: "RESET" };
