import { Suspense } from "react";
import { Plus, Calendar } from "lucide-react";
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
} from "./practice_list.ui";
import { CreatePracticeForm } from "./CreatePracticeForm";

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
						<Suspense
							fallback={
								<div className="text-gray-500">Loading practices...</div>
							}
						>
							<EmptyState>
								<EmptyStateIcon>
									<Calendar className="h-12 w-12" />
								</EmptyStateIcon>
								<EmptyStateText>
									<h3 className="text-base font-medium text-gray-900 mb-1">
										No practices created yet
									</h3>
									<p className="text-sm text-gray-500 mb-2">
										Get started by creating your first summer practice session
										above.
									</p>
									<p className="text-xs text-gray-400">
										Once you create a practice, you can manage attendance with
										our 3-step workflow.
									</p>
								</EmptyStateText>
							</EmptyState>
						</Suspense>
					</SectionContent>
				</SectionCard>
			</div>
		</SummerAttendanceLayout>
	);
}
