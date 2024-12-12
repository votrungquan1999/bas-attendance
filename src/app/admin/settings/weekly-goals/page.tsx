"use client";

import { useEffect, useRef, useState } from "react";
import { WEEKLY_GOALS } from "src/server/constants";
import type { WeeklyGoals } from "src/server/types";
import { Trash2 } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "src/shadcn/components/ui/select";
// import { cn } from "src/shadcn/lib/utils";

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
					// add 28 for the padding added (24 bottom + 4 top)
					// need to add padding here, instead of the outer section
					// because fix height + without padding + overflow-hidden will cause the
					// outline to be cut off
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

export default function WeeklyGoalsSettings() {
	const [goals, setGoals] = useState<WeeklyGoals>(WEEKLY_GOALS);
	const [isSaving, setIsSaving] = useState(false);

	// Helper functions to check if all goals in a section are 0
	const allThirtyMinGoalsAreZero = () =>
		goals.thirtyMin.personalTechnique === 0 &&
		goals.thirtyMin.probabilityPractice === 0 &&
		goals.thirtyMin.buddyTraining === 0;

	const allNormalSessionGoalsAreZero = () =>
		goals.normalSession.trainWithCoach === 0 &&
		goals.normalSession.trainNewbies === 0;

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
		} catch (error) {
			console.error("Failed to save goals:", error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<div className="space-y-6">
				<GoalSection
					title="30 Minute Sessions"
					showDelete={!allThirtyMinGoalsAreZero()}
					onDelete={() =>
						setGoals((prev) => ({
							...prev,
							thirtyMin: {
								personalTechnique: 0,
								probabilityPractice: 0,
								buddyTraining: 0,
							},
						}))
					}
					isEmpty={allThirtyMinGoalsAreZero()}
					onAdd={() =>
						setGoals((prev) => ({
							...prev,
							thirtyMin: WEEKLY_GOALS.thirtyMin,
						}))
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
								setGoals((prev) => ({
									...prev,
									thirtyMin: { ...prev.thirtyMin, personalTechnique: value },
								}))
							}
						/>
						<ActivityInput
							id="probabilityPractice"
							label="Probability Practice Sessions"
							value={goals.thirtyMin.probabilityPractice}
							defaultValue={WEEKLY_GOALS.thirtyMin.probabilityPractice}
							onValueChange={(value) =>
								setGoals((prev) => ({
									...prev,
									thirtyMin: {
										...prev.thirtyMin,
										probabilityPractice: value,
									},
								}))
							}
						/>
						<ActivityInput
							id="buddyTraining"
							label="Buddy Training Sessions"
							value={goals.thirtyMin.buddyTraining}
							defaultValue={WEEKLY_GOALS.thirtyMin.buddyTraining}
							onValueChange={(value) =>
								setGoals((prev) => ({
									...prev,
									thirtyMin: { ...prev.thirtyMin, buddyTraining: value },
								}))
							}
						/>
					</div>
				</GoalSection>

				<GoalSection
					title="Endurance Runs"
					showDelete={goals.enduranceRun !== 0}
					onDelete={() =>
						setGoals((prev) => ({
							...prev,
							enduranceRun: 0,
						}))
					}
					isEmpty={goals.enduranceRun === 0}
					onAdd={() =>
						setGoals((prev) => ({
							...prev,
							enduranceRun: WEEKLY_GOALS.enduranceRun,
						}))
					}
					activity="endurance run"
				>
					<ActivityInput
						id="enduranceRun"
						label="Weekly Endurance Runs"
						value={goals.enduranceRun}
						defaultValue={WEEKLY_GOALS.enduranceRun}
						onValueChange={(value) =>
							setGoals((prev) => ({
								...prev,
								enduranceRun: value,
							}))
						}
						maxValue={5}
					/>
				</GoalSection>

				<GoalSection
					title="Normal Sessions"
					showDelete={!allNormalSessionGoalsAreZero()}
					onDelete={() =>
						setGoals((prev) => ({
							...prev,
							normalSession: {
								trainWithCoach: 0,
								trainNewbies: 0,
							},
						}))
					}
					isEmpty={allNormalSessionGoalsAreZero()}
					onAdd={() =>
						setGoals((prev) => ({
							...prev,
							normalSession: WEEKLY_GOALS.normalSession,
						}))
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
								setGoals((prev) => ({
									...prev,
									normalSession: {
										...prev.normalSession,
										trainWithCoach: value,
									},
								}))
							}
						/>
						<ActivityInput
							id="trainNewbies"
							label="Train Newbies"
							value={goals.normalSession.trainNewbies}
							defaultValue={WEEKLY_GOALS.normalSession.trainNewbies}
							onValueChange={(value) =>
								setGoals((prev) => ({
									...prev,
									normalSession: {
										...prev.normalSession,
										trainNewbies: value,
									},
								}))
							}
						/>
					</div>
				</GoalSection>

				<div className="flex justify-end">
					<button
						type="button"
						className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						onClick={handleSave}
						disabled={isSaving}
					>
						{isSaving ? "Saving..." : "Save Changes"}
					</button>
				</div>
			</div>
		</div>
	);
}
