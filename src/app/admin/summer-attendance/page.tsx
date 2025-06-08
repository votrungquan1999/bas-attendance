import { Suspense } from "react";
import { Plus, Calendar, Users, Clock } from "lucide-react";
import Link from "next/link";
import {
	SummerAttendanceLayout,
	PageHeader,
	PageTitleSection,
	SectionCard,
	SectionHeader,
	SectionContent,
	EmptyState,
	EmptyStateIcon,
	EmptyStateText,
	PracticeList,
	PracticeListItem,
	PracticeHeader,
	PracticeInfo,
	PracticeActions,
	PracticeStats,
	PracticeDate,
	PracticeUpdatedDate,
	PracticeAttendanceCount,
	PracticeStatusBadge,
	PracticeViewButton,
} from "./practice_list.ui";
import { CreatePracticeForm } from "./CreatePracticeForm";
import query_getSummerPractices from "src/server/queries/query_getSummerPractices";
import query_getSummerPracticeById from "src/server/queries/query_getSummerPracticeById";
import {
	PracticeListSkeleton,
	PracticeListItemSkeleton,
} from "./PracticeListSkeleton";

export default function SummerAttendancePage() {
	return (
		<SummerAttendanceLayout>
			<PageHeader>
				<PageTitleSection>
					<h1 className="text-2xl font-bold">Summer Attendance</h1>
					<p className="text-gray-600 text-sm">
						Manage summer practice attendance sessions
					</p>
				</PageTitleSection>
			</PageHeader>

			<div className="grid gap-4">
				{/* Create New Practice Section */}
				<SectionCard>
					<SectionHeader>
						<h2 className="text-lg font-semibold flex items-center gap-2">
							<Plus className="h-4 w-4" />
							Create New Practice
						</h2>
					</SectionHeader>
					<SectionContent>
						<CreatePracticeForm />
					</SectionContent>
				</SectionCard>

				{/* Practices List Section */}
				<SectionCard>
					<SectionHeader>
						<h2 className="text-lg font-semibold">Recent Practices</h2>
					</SectionHeader>
					<SectionContent>
						<Suspense fallback={<PracticeListSkeleton />}>
							<PracticeListContainer />
						</Suspense>
					</SectionContent>
				</SectionCard>
			</div>
		</SummerAttendanceLayout>
	);
}

async function PracticeListContainer() {
	const practiceIds = await query_getSummerPractices();

	if (practiceIds.length === 0) {
		return <EmptyPracticeList />;
	}

	return (
		<PracticeList>
			{practiceIds.map((practiceId) => (
				<Suspense key={practiceId} fallback={<PracticeListItemSkeleton />}>
					<PracticeListItemContainer practiceId={practiceId} />
				</Suspense>
			))}
		</PracticeList>
	);
}

async function PracticeListItemContainer({
	practiceId,
}: {
	practiceId: string;
}) {
	const practice = await query_getSummerPracticeById(practiceId);

	if (!practice) {
		return null;
	}

	const attendanceCount = practice.attendance_data.athletes.length;
	const registeredCount = practice.attendance_data.athletes.filter(
		(athlete) => athlete.registered,
	).length;

	const practiceDate = new Date(practice.date);
	const updatedDate = new Date(practice.updated_at);

	return (
		<PracticeListItem>
			<PracticeHeader>
				<PracticeInfo>
					<PracticeDate>
						{practiceDate.toLocaleDateString("en-US", {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</PracticeDate>
					<PracticeUpdatedDate>
						Last updated {updatedDate.toLocaleDateString("en-US")} at{" "}
						{updatedDate.toLocaleTimeString("en-US", {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</PracticeUpdatedDate>
				</PracticeInfo>
				<PracticeActions>
					<PracticeStatusBadge>
						{attendanceCount === 0 ? "No Data" : "Active"}
					</PracticeStatusBadge>
					<Link href={`/admin/summer-attendance/${practice.id}`}>
						<PracticeViewButton>View Details</PracticeViewButton>
					</Link>
				</PracticeActions>
			</PracticeHeader>

			<PracticeStats>
				<PracticeAttendanceCount>
					<Users className="h-4 w-4 inline-block mr-1" />
					{registeredCount} registered
				</PracticeAttendanceCount>
				<PracticeAttendanceCount>
					<Clock className="h-4 w-4 inline-block mr-1" />
					{attendanceCount} total records
				</PracticeAttendanceCount>
			</PracticeStats>
		</PracticeListItem>
	);
}

function EmptyPracticeList() {
	return (
		<EmptyState>
			<EmptyStateIcon>
				<Calendar className="h-12 w-12" />
			</EmptyStateIcon>
			<EmptyStateText>
				<h3 className="text-base font-medium text-gray-900 mb-1">
					No practices created yet
				</h3>
				<p className="text-sm text-gray-500 mb-2">
					Get started by creating your first summer practice session above.
				</p>
				<p className="text-xs text-gray-400">
					Once you create a practice, you can manage attendance with our 3-step
					workflow.
				</p>
			</EmptyStateText>
		</EmptyState>
	);
}
