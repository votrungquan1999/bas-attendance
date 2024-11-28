import query_getTakerFromCookies from "src/server/queries/query_getTakerFromCookies";
import AddNewActivitySection from "./AddNewActivitySection";

export default async function ActivityPage() {
	const athlete = await query_getTakerFromCookies();

	return <AddNewActivitySection attendanceId={athlete.id} />;
}
