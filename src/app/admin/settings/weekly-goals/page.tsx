import { redirect } from "next/navigation";

export default function WeeklyGoalsSettings() {
	redirect("/admin/settings/weekly-goals/by-week");
}
