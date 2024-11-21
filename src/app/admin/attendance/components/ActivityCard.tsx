import type {
	CompletedActivity,
	Activity,
} from "src/app/attendance/activity/types";
import formatDate from "../../../../helpers/formatDate";
import getActivityDescription from "src/helpers/activities/getActivityDescription";
import { cn } from "src/shadcn/lib/utils";

interface ActivityCardProps {
	activity: CompletedActivity;
	theme: Activity;
}

export default function ActivityCard({ activity, theme }: ActivityCardProps) {
	return (
		<div key={activity.attendanceId} className="bg-gray-50 p-2 rounded">
			<div
				className={cn("text-sm font-medium mb-1", {
					"text-blue-600": theme === "30-minutes-session",
					"text-green-600": theme === "endurance-run",
					"text-purple-600": theme === "normal-long-session",
				})}
			>
				{formatDate(activity.submittedAt)}
			</div>
			<div className="text-sm">{getActivityDescription(activity)}</div>
		</div>
	);
}
