import type { CompletedActivity, Activity } from "src/server/types";
import formatDate from "../../helpers/formatDate";
import getActivityDescription from "src/helpers/activities/getActivityDescription";
import { cn } from "src/shadcn/lib/utils";
import { DateTime } from "luxon";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "src/shadcn/components/ui/popover";

interface ActivityCardProps {
	activity: CompletedActivity;
	theme: Activity;
}

export default function ActivityCard({ activity, theme }: ActivityCardProps) {
	const isSubmittedLate = () => {
		const activityDate = DateTime.fromMillis(activity.activityTimestamp, {
			zone: "Asia/Saigon",
		});
		const submittedDate = DateTime.fromMillis(activity.submittedAt, {
			zone: "Asia/Saigon",
		});

		return !activityDate.hasSame(submittedDate, "day");
	};

	return (
		<div key={activity.attendanceId} className="bg-gray-50 p-2 rounded">
			<div className="flex items-center gap-2">
				<div
					className={cn("text-sm font-medium", {
						"text-blue-600": theme === "30-minutes-session",
						"text-green-600": theme === "endurance-run",
						"text-purple-600": theme === "normal-long-session",
					})}
				>
					{formatDate(activity.activityTimestamp)}
				</div>
				{isSubmittedLate() && (
					<Popover>
						<PopoverTrigger>
							<span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded cursor-pointer hover:bg-yellow-200">
								Late submission
							</span>
						</PopoverTrigger>
						<PopoverContent className="w-fit p-2">
							<p className="text-sm">
								Submitted on: {formatDate(activity.submittedAt)}
							</p>
						</PopoverContent>
					</Popover>
				)}
			</div>
			<div className="text-sm mt-1">{getActivityDescription(activity)}</div>
		</div>
	);
}
