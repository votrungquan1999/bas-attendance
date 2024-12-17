"use client";

import { Trash2 } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "src/shadcn/components/ui/select";
import { useEffect, useRef, useState } from "react";
import { useWeeklyGoals } from "./WeeklyGoalsProvider";
import { WEEKLY_GOALS } from "src/server/constants";

// Helper function to generate number options
const generateOptions = (max: number) => {
	return Array.from({ length: max + 1 }, (_, i) => i);
};

const AddGoalButton = ({
	activity,
	onClick,
}: {
	activity: string;
	onClick: () => void;
}) => (
	<button
		type="button"
		onClick={onClick}
		className="w-full h-9 px-3 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center"
	>
		Add {activity} goal
	</button>
);

const NoGoalText = ({ activity }: { activity: string }) => (
	<span className="text-gray-500">No {activity} goal this week</span>
);

const DeleteButton = ({
	onClick,
	variant = "activity",
}: {
	onClick: () => void;
	variant?: "section" | "activity";
}) => {
	if (variant === "section") {
		return (
			<button
				type="button"
				onClick={onClick}
				className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
			>
				<Trash2 className="h-4 w-4" />
				<span className="text-sm font-medium">Delete All</span>
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={onClick}
			className="p-1 text-gray-400 hover:text-red-500 transition-colors"
		>
			<Trash2 className="h-4 w-4" />
		</button>
	);
};

type ActivityInputProps = {
	id: string;
	label: string;
	value: number;
	defaultValue: number;
	onValueChange: (value: number) => void;
	maxValue?: number;
};

const ActivityInput = ({
	id,
	label,
	value,
	defaultValue,
	onValueChange,
	maxValue = 10,
}: ActivityInputProps) => (
	<div className="flex flex-col gap-2">
		<label htmlFor={id} className="block text-sm font-medium text-gray-700">
			{label}
		</label>
		{value === 0 ? (
			<div className="flex items-center gap-2">
				<AddGoalButton
					activity={label.toLowerCase()}
					onClick={() => onValueChange(defaultValue)}
				/>
				<div className="invisible">
					<DeleteButton onClick={() => onValueChange(0)} />
				</div>
			</div>
		) : (
			<div className="flex items-center gap-2">
				<Select
					value={value.toString()}
					onValueChange={(v) => onValueChange(Number.parseInt(v))}
				>
					<SelectTrigger id={id}>
						<SelectValue placeholder="Select number of sessions" />
					</SelectTrigger>
					<SelectContent>
						{generateOptions(maxValue).map((num) => (
							<SelectItem key={num} value={num.toString()}>
								{num === 0 ? (
									<NoGoalText activity={label.toLowerCase()} />
								) : (
									num
								)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<DeleteButton onClick={() => onValueChange(0)} />
			</div>
		)}
	</div>
);

type GoalSectionProps = {
	title: string;
	showDelete: boolean;
	onDelete: () => void;
	children: React.ReactNode;
	isEmpty: boolean;
	onAdd: () => void;
	activity: string;
};

function GoalSection({
	title,
	showDelete,
	onDelete,
	children,
	isEmpty,
	onAdd,
	activity,
}: GoalSectionProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [goalSectionHeight, setGoalSectionHeight] = useState<number | "auto">(
		"auto",
	);

	useEffect(() => {
		if (containerRef.current) {
			const observer = new ResizeObserver((entries) => {
				setGoalSectionHeight(entries[0].contentRect.height);
			});

			observer.observe(containerRef.current);

			return () => {
				observer.disconnect();
			};
		}
	}, []);

	return (
		<section className="bg-white rounded-lg shadow">
			<section className="flex justify-between items-center p-6 pb-0">
				<h2 className="text-xl font-semibold">{title}</h2>
				{showDelete && <DeleteButton variant="section" onClick={onDelete} />}
			</section>

			<section
				className="transition-[height] duration-300 ease-in-out overflow-hidden p-6 pt-1"
				style={{
					height:
						goalSectionHeight === "auto" ? "auto" : goalSectionHeight + 28,
				}}
			>
				<div ref={containerRef}>
					{isEmpty ? (
						<AddGoalButton activity={activity} onClick={onAdd} />
					) : (
						children
					)}
				</div>
			</section>
		</section>
	);
}

export default function WeeklyGoalsClientWrapper() {
	const {
		state,
		dispatch,
		allThirtyMinGoalsAreZero,
		allNormalSessionGoalsAreZero,
	} = useWeeklyGoals();
	const goals = state;

	return (
		<div className="space-y-6">
			<GoalSection
				title="30 Minute Sessions"
				showDelete={!allThirtyMinGoalsAreZero()}
				onDelete={() =>
					dispatch({
						type: "SET_THIRTY_MIN_GOALS",
						payload: {
							personalTechnique: 0,
							probabilityPractice: 0,
							buddyTraining: 0,
						},
					})
				}
				isEmpty={allThirtyMinGoalsAreZero()}
				onAdd={() =>
					dispatch({
						type: "SET_THIRTY_MIN_GOALS",
						payload: WEEKLY_GOALS.thirtyMin,
					})
				}
				activity="30 minute sessions"
			>
				<div className="space-y-4">
					<ActivityInput
						id="personalTechnique"
						label="Personal Technique Sessions"
						value={goals.thirtyMin.personalTechnique}
						defaultValue={WEEKLY_GOALS.thirtyMin.personalTechnique}
						onValueChange={(value) =>
							dispatch({
								type: "UPDATE_PERSONAL_TECHNIQUE",
								payload: value,
							})
						}
					/>
					<ActivityInput
						id="probabilityPractice"
						label="Probability Practice Sessions"
						value={goals.thirtyMin.probabilityPractice}
						defaultValue={WEEKLY_GOALS.thirtyMin.probabilityPractice}
						onValueChange={(value) =>
							dispatch({
								type: "UPDATE_PROBABILITY_PRACTICE",
								payload: value,
							})
						}
					/>
					<ActivityInput
						id="buddyTraining"
						label="Buddy Training Sessions"
						value={goals.thirtyMin.buddyTraining}
						defaultValue={WEEKLY_GOALS.thirtyMin.buddyTraining}
						onValueChange={(value) =>
							dispatch({
								type: "UPDATE_BUDDY_TRAINING",
								payload: value,
							})
						}
					/>
				</div>
			</GoalSection>

			<GoalSection
				title="Endurance Runs"
				showDelete={goals.enduranceRun !== 0}
				onDelete={() =>
					dispatch({
						type: "SET_ENDURANCE_RUN",
						payload: 0,
					})
				}
				isEmpty={goals.enduranceRun === 0}
				onAdd={() =>
					dispatch({
						type: "SET_ENDURANCE_RUN",
						payload: WEEKLY_GOALS.enduranceRun,
					})
				}
				activity="endurance run"
			>
				<ActivityInput
					id="enduranceRun"
					label="Weekly Endurance Runs"
					value={goals.enduranceRun}
					defaultValue={WEEKLY_GOALS.enduranceRun}
					onValueChange={(value) =>
						dispatch({
							type: "SET_ENDURANCE_RUN",
							payload: value,
						})
					}
					maxValue={5}
				/>
			</GoalSection>

			<GoalSection
				title="Normal Sessions"
				showDelete={!allNormalSessionGoalsAreZero()}
				onDelete={() =>
					dispatch({
						type: "SET_NORMAL_SESSION_GOALS",
						payload: {
							trainWithCoach: 0,
							trainNewbies: 0,
						},
					})
				}
				isEmpty={allNormalSessionGoalsAreZero()}
				onAdd={() =>
					dispatch({
						type: "SET_NORMAL_SESSION_GOALS",
						payload: WEEKLY_GOALS.normalSession,
					})
				}
				activity="normal sessions"
			>
				<div className="space-y-4">
					<ActivityInput
						id="trainWithCoach"
						label="Train with Coach"
						value={goals.normalSession.trainWithCoach}
						defaultValue={WEEKLY_GOALS.normalSession.trainWithCoach}
						onValueChange={(value) =>
							dispatch({
								type: "UPDATE_TRAIN_WITH_COACH",
								payload: value,
							})
						}
					/>
					<ActivityInput
						id="trainNewbies"
						label="Train Newbies"
						value={goals.normalSession.trainNewbies}
						defaultValue={WEEKLY_GOALS.normalSession.trainNewbies}
						onValueChange={(value) =>
							dispatch({
								type: "UPDATE_TRAIN_NEWBIES",
								payload: value,
							})
						}
					/>
				</div>
			</GoalSection>
		</div>
	);
}
