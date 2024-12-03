import type { CompletedActivity, Activity } from "src/server/types";
import ActivityCard from "./ActivityCard";
import { cn } from "src/shadcn/lib/utils";

interface ActivitySectionProps {
	title?: string;
	activities: CompletedActivity[];
	theme: Activity;
}

export default function ActivitySection({
	title,
	activities,
	theme,
}: ActivitySectionProps) {
	return (
		<div className="space-y-2">
			{title && (
				<div className="flex justify-between items-center">
					<h4
						className={cn("text-sm font-medium", {
							"text-blue-500": theme === "30-minutes-session",
							"text-green-500": theme === "endurance-run",
							"text-purple-500": theme === "normal-long-session",
						})}
					>
						{title}
					</h4>
				</div>
			)}
			{activities.map((activity) => (
				<ActivityCard
					key={activity.submittedAt}
					activity={activity}
					theme={theme}
				/>
			))}
		</div>
	);
}
