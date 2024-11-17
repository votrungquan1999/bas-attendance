"use client";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "src/shadcn/components/ui/select";
import type {
	Activity,
	ThirtyMinutesSessionActivity,
	ProbabilityActivity,
	NormalSessionActivity,
} from "./ActivityContext";
import { useActivity } from "./ActivityContext";
import { cn } from "src/shadcn/lib/utils";

export default function AddNewActivitySection() {
	const { state, dispatch } = useActivity();

	return (
		<div className="max-w-2xl mx-auto p-6 space-y-8">
			<div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
				<div className="space-y-2">
					<label
						htmlFor="main-activity"
						className="text-lg font-semibold text-gray-900"
					>
						What activity did you do today?
					</label>
					<Select
						value={state.activity}
						onValueChange={(value) =>
							dispatch({ type: "SET_ACTIVITY", payload: value as Activity })
						}
					>
						<SelectTrigger id="main-activity" className="w-full">
							<SelectValue placeholder="Select an activity" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Activities</SelectLabel>
								<SelectItem value="30-minutes-session">
									30 minutes session
								</SelectItem>
								<SelectItem value="endurance-run">Endurance run</SelectItem>
								<SelectItem value="normal-long-session">
									Normal long session
								</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<div className="mt-6">
					{state.activity && (
						<div className="border-t pt-6">
							{state.activity === "30-minutes-session" && (
								<ThirtyMinutesSession />
							)}
							{state.activity === "endurance-run" && <EnduranceRun />}
							{state.activity === "normal-long-session" && (
								<NormalLongSession />
							)}
						</div>
					)}
				</div>
			</div>

			<SubmitButton />
		</div>
	);
}

function ThirtyMinutesSession() {
	const { state, dispatch } = useActivity();

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<label
					htmlFor="thirty-minutes-activity"
					className="text-lg font-semibold"
				>
					Select your 30 minutes activity:
				</label>
				<Select
					value={state.thirtyMinActivity}
					onValueChange={(value) =>
						dispatch({
							type: "SET_THIRTY_MIN_ACTIVITY",
							payload: value as ThirtyMinutesSessionActivity,
						})
					}
				>
					<SelectTrigger
						id="thirty-minutes-activity"
						className="w-full max-w-sm"
					>
						<SelectValue placeholder="Select an activity" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Activities</SelectLabel>
							<SelectItem value="personal-technique">
								Personal technique
							</SelectItem>
							<SelectItem value="probability-practice">
								Probability practice
							</SelectItem>
							<SelectItem value="buddy-training">Train with Buddy</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>

			<div className="mt-4">
				{state.thirtyMinActivity === "personal-technique" && (
					<div className="space-y-2">
						<label
							htmlFor="personal-technique-explanation"
							className="text-lg font-semibold"
						>
							Explain what you practiced:
						</label>
						<textarea
							id="personal-technique-explanation"
							className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							value={state.thirtyMinExplanation}
							onChange={(e) =>
								dispatch({
									type: "SET_THIRTY_MIN_EXPLANATION",
									payload: e.target.value,
								})
							}
							rows={3}
						/>
					</div>
				)}

				{state.thirtyMinActivity === "probability-practice" && (
					<ProbabilityPractice />
				)}

				{state.thirtyMinActivity === "buddy-training" && (
					<div className="space-y-2">
						<label
							htmlFor="buddy-training-explanation"
							className="text-lg font-semibold"
						>
							Describe your training session:
						</label>
						<textarea
							id="buddy-training-explanation"
							className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							value={state.thirtyMinExplanation}
							onChange={(e) =>
								dispatch({
									type: "SET_THIRTY_MIN_EXPLANATION",
									payload: e.target.value,
								})
							}
							rows={3}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

function ProbabilityPractice() {
	const { state, dispatch } = useActivity();

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<label htmlFor="practice-type" className="text-lg font-semibold">
					Select your practice type:
				</label>
				<Select
					value={state.practiceType}
					onValueChange={(value) =>
						dispatch({
							type: "SET_PRACTICE_TYPE",
							payload: value as ProbabilityActivity,
						})
					}
				>
					<SelectTrigger id="practice-type" className="w-full max-w-sm">
						<SelectValue placeholder="Select practice type" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Practice Types</SelectLabel>
							<SelectItem value="layup">Layup</SelectItem>
							<SelectItem value="straight-shot">Straight shot</SelectItem>
							<SelectItem value="attack-board">Attack board</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>

			{state.practiceType && (
				<div className="space-y-6 p-4 bg-gray-50 rounded-lg">
					<div className="space-y-2">
						<label htmlFor="practice-level" className="text-lg font-semibold">
							Select the level you reached:
						</label>
						<Select
							value={state.practiceLevel}
							onValueChange={(value) =>
								dispatch({ type: "SET_PRACTICE_LEVEL", payload: value })
							}
						>
							<SelectTrigger id="practice-level" className="w-full max-w-sm">
								<SelectValue placeholder="Select your level" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Level</SelectLabel>
									{[1, 2, 3, 4].map((num) => (
										<SelectItem key={num} value={num.toString()}>
											Level {num}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="practice-description"
							className="text-lg font-semibold"
						>
							Describe your practice results:
						</label>
						<textarea
							id="practice-description"
							className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							value={state.practiceDescription}
							onChange={(e) =>
								dispatch({
									type: "SET_PRACTICE_DESCRIPTION",
									payload: e.target.value,
								})
							}
							rows={3}
							placeholder="what is the highest attempt you achieved? 30 in a row?"
						/>
					</div>
				</div>
			)}
		</div>
	);
}

function EnduranceRun() {
	const { state, dispatch } = useActivity();

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<label htmlFor="laps-count" className="text-lg font-semibold">
					Select number of laps completed:
				</label>
				<Select
					value={state.laps}
					onValueChange={(value) =>
						dispatch({ type: "SET_LAPS", payload: value })
					}
				>
					<SelectTrigger id="laps-count" className="w-full max-w-sm">
						<SelectValue placeholder="Number of laps" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Laps</SelectLabel>
							{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
								<SelectItem key={num} value={num.toString()}>
									{num} laps
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<label htmlFor="completion-time" className="text-lg font-semibold">
					Select your completion time:
				</label>
				<Select
					value={state.minutes}
					onValueChange={(value) =>
						dispatch({ type: "SET_MINUTES", payload: value })
					}
				>
					<SelectTrigger id="completion-time" className="w-full max-w-sm">
						<SelectValue placeholder="Duration (minutes)" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Minutes</SelectLabel>
							{[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((num) => (
								<SelectItem key={num} value={num.toString()}>
									{num} minutes
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}

function NormalLongSession() {
	const { state, dispatch } = useActivity();

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<label htmlFor="session-type" className="text-lg font-semibold">
					Select your session type:
				</label>
				<Select
					value={state.sessionType}
					onValueChange={(value) =>
						dispatch({
							type: "SET_SESSION_TYPE",
							payload: value as NormalSessionActivity,
						})
					}
				>
					<SelectTrigger id="session-type" className="w-full max-w-sm">
						<SelectValue placeholder="Select activity" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Activities</SelectLabel>
							<SelectItem value="train-newbies">Train for newbies</SelectItem>
							<SelectItem value="train-with-coach">Train with coach</SelectItem>
							<SelectItem value="others">Others</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>

			{state.sessionType === "others" && (
				<div className="space-y-2">
					<label
						htmlFor="normal-session-explanation"
						className="text-lg font-semibold"
					>
						Describe your session:
					</label>
					<textarea
						id="normal-session-explanation"
						className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						value={state.sessionExplanation}
						onChange={(e) =>
							dispatch({
								type: "SET_SESSION_EXPLANATION",
								payload: e.target.value,
							})
						}
						rows={3}
					/>
				</div>
			)}
		</div>
	);
}

function SubmitButton() {
	const { state } = useActivity();

	const isComplete = () => {
		switch (state.activity) {
			case "30-minutes-session":
				if (!state.thirtyMinActivity) return false;
				if (state.thirtyMinActivity === "probability-practice") {
					return !!(
						state.practiceType &&
						state.practiceLevel &&
						state.practiceDescription
					);
				}
				return !!state.thirtyMinExplanation;

			case "endurance-run":
				return state.laps && state.minutes;

			case "normal-long-session":
				if (!state.sessionType) return false;
				if (state.sessionType === "others") {
					return !!state.sessionExplanation;
				}
				return true;

			default:
				return false;
		}
	};

	return (
		<button
			type="submit"
			className={cn(
				"w-full p-4 rounded-lg font-semibold transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white shadow-sm",
				!isComplete() && "invisible",
			)}
		>
			Submit Activity
		</button>
	);
}
