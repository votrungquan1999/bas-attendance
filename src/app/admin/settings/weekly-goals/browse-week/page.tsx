import WeekSelector from "./WeekSelector";

import { connection } from "next/dist/server/request/connection";

export default async function BrowseWeekPage() {
	await connection();

	const now = Date.now();

	return (
		<div className="container mx-auto p-6">
			<div className="bg-white rounded-lg shadow-md">
				<WeekSelector now={now} />
			</div>
		</div>
	);
}
