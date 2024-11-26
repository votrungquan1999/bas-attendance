import { DateTime } from "luxon";

export default function formatDate(timestamp: number): string {
	return DateTime.fromMillis(timestamp, {
		zone: "Asia/Saigon",
	}).toFormat("dd/MM/yyyy");
}
