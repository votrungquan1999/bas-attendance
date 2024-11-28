interface GoalIndicatorProps {
	current: number;
	goal: number;
}

export default function GoalIndicator({ current, goal }: GoalIndicatorProps) {
	return (
		<div className="flex items-center gap-1 text-sm">
			<div className="font-medium">
				{current}/{goal}
			</div>
			<div className={current >= goal ? "text-green-500" : "text-yellow-500"}>
				({current >= goal ? "Complete" : "In Progress"})
			</div>
		</div>
	);
}
