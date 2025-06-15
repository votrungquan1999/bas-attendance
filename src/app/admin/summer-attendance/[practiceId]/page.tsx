import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import query_getSummerPracticeById from "src/server/queries/query_getSummerPracticeById";
import query_getEligibleAthletes from "src/app/admin/attendance/by-week/query_getEligibleAthletes";
import {
	PracticeDetailLayout,
	PracticeDetailHeader,
	BackLink,
	PracticeTitle,
	PracticeTitleText,
	PracticeSubtitle,
	AttendanceManagementCard,
	AttendanceTabs,
	AttendanceTabsList,
	AttendanceTabsTrigger,
	AttendanceTabsContent,
	TabContentHeader,
	TabContentTitle,
	TabContentDescription,
	TabContentBody,
	AthleteSelectionSection,
	SectionTitle,
	RegisteredAthletesList,
	BusyAthletesList,
	RegisteredAthleteItem,
	BusyAthleteItem,
	AthleteLabel,
	TabFooter,
	SaveButton,
} from "./practice_detail.ui";
import { RegistrationProvider, type Athlete } from "./RegistrationContext";
import {
	AthleteCombobox,
	RegisterCount,
	EmptyRegisteredWrapper,
	HasRegisteredWrapper,
	AllRegisteredWrapper,
	HasUnregisteredWrapper,
	RegisteredAthleteWrapper,
	BusyAthleteWrapper,
	RemoveButton,
	BusyReasonInput,
} from "./registration.ui";
import { NoShowTab } from "./no-show.ui";
import { SummaryTab } from "./summary.ui";
import {
	ComboboxItem,
	ComboboxContent,
	ComboboxGroup,
	ComboboxPopover,
	ComboboxTrigger,
	ComboboxValue,
	ComboboxInput,
	ComboboxEmpty,
	ComboboxList,
} from "src/shadcn/components/behaviors/comboBox";
import toNonAccentVietnamese from "src/helpers/toNonAccentVietnamese";

interface PracticeDetailPageProps {
	params: Promise<{
		practiceId: string;
	}>;
}

export default async function PracticeDetailPage(
	props: PracticeDetailPageProps,
) {
	const params = await props.params;
	const practiceId = params.practiceId;

	const practice = await query_getSummerPracticeById(practiceId);

	if (!practice) {
		return (
			<PracticeDetailLayout>
				<PracticeDetailHeader>
					<Link href="/admin/summer-attendance">
						<BackLink>
							<ArrowLeft />
							Back to Practices
						</BackLink>
					</Link>
				</PracticeDetailHeader>
				<PracticeTitle>
					<PracticeTitleText>Practice Not Found</PracticeTitleText>
					<PracticeSubtitle>
						The practice you&apos;re looking for doesn&apos;t exist.
					</PracticeSubtitle>
				</PracticeTitle>
			</PracticeDetailLayout>
		);
	}

	const practiceDate = new Date(practice.date);
	const formattedDate = practiceDate.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<PracticeDetailLayout>
			<PracticeDetailHeader>
				<Link href="/admin/summer-attendance">
					<BackLink>
						<ArrowLeft />
						Back to Practices
					</BackLink>
				</Link>
			</PracticeDetailHeader>

			<PracticeTitle>
				<PracticeTitleText>Summer Practice</PracticeTitleText>
				<PracticeSubtitle>{formattedDate}</PracticeSubtitle>
			</PracticeTitle>

			<AttendanceManagementCard>
				<AttendanceTabs defaultValue="registration">
					<AttendanceTabsList>
						<AttendanceTabsTrigger value="registration">
							Registration
						</AttendanceTabsTrigger>
						<AttendanceTabsTrigger value="no-show">
							No Show Marking
						</AttendanceTabsTrigger>
						<AttendanceTabsTrigger value="summary">
							Attendance Summary
						</AttendanceTabsTrigger>
					</AttendanceTabsList>

					<AttendanceTabsContent value="registration">
						<Suspense fallback={<div>Loading athletes...</div>}>
							<RegistrationTabContent />
						</Suspense>
					</AttendanceTabsContent>

					<AttendanceTabsContent value="no-show">
						<NoShowTab />
					</AttendanceTabsContent>

					<AttendanceTabsContent value="summary">
						<SummaryTab />
					</AttendanceTabsContent>
				</AttendanceTabs>
			</AttendanceManagementCard>
		</PracticeDetailLayout>
	);
}

async function RegistrationTabContent() {
	const eligibleTakers = await query_getEligibleAthletes();
	const allAthletes: Athlete[] = eligibleTakers.map((taker) => ({
		id: taker.id,
		name: taker.value,
	}));

	return (
		<RegistrationProvider>
			<TabContentHeader>
				<TabContentTitle>Athlete Registration</TabContentTitle>
				<TabContentDescription>
					Select which athletes are registered for this practice session
				</TabContentDescription>
			</TabContentHeader>

			<TabContentBody>
				<AthleteSelectionSection>
					<SectionTitle>Add Athletes to Practice</SectionTitle>
					<AthleteCombobox>
						<ComboboxPopover>
							<ComboboxTrigger className="w-full">
								<ComboboxValue placeholder="Search and select athletes..." />
							</ComboboxTrigger>
							<ComboboxContent className="w-full">
								<ComboboxInput placeholder="Type athlete name..." />
								<ComboboxEmpty>No athletes found</ComboboxEmpty>
								<ComboboxList>
									<ComboboxGroup>
										{allAthletes.map((athlete) => {
											const nonAccentName = toNonAccentVietnamese(athlete.name);

											return (
												<ComboboxItem
													key={athlete.id}
													value={`${athlete.id}-${nonAccentName}`}
												>
													{athlete.name}
												</ComboboxItem>
											);
										})}
									</ComboboxGroup>
								</ComboboxList>
							</ComboboxContent>
						</ComboboxPopover>
					</AthleteCombobox>
				</AthleteSelectionSection>

				<AthleteSelectionSection>
					<SectionTitle>
						Registered Athletes (<RegisterCount />)
					</SectionTitle>
					<RegisteredAthletesList>
						<EmptyRegisteredWrapper>
							<p className="text-gray-500 text-sm text-center py-4">
								No athletes registered yet. Use the search above to add
								athletes.
							</p>
						</EmptyRegisteredWrapper>
						<HasRegisteredWrapper>
							{allAthletes.map((athlete) => (
								<RegisteredAthleteWrapper
									key={athlete.id}
									athleteId={athlete.id}
								>
									<RegisteredAthleteItem>
										<AthleteLabel>{athlete.name}</AthleteLabel>
										<RemoveButton athleteId={athlete.id}>
											<button
												type="button"
												className="flex items-center gap-2 text-red-500"
											>
												<X className="size-4" />
												Remove
											</button>
										</RemoveButton>
									</RegisteredAthleteItem>
								</RegisteredAthleteWrapper>
							))}
						</HasRegisteredWrapper>
					</RegisteredAthletesList>
				</AthleteSelectionSection>

				<AthleteSelectionSection>
					<SectionTitle>Busy Athletes (Optional Reasons)</SectionTitle>
					<BusyAthletesList>
						<AllRegisteredWrapper allAthletes={allAthletes}>
							<p className="text-gray-500 text-sm text-center py-4">
								All athletes are registered for this practice.
							</p>
						</AllRegisteredWrapper>
						<HasUnregisteredWrapper allAthletes={allAthletes}>
							{allAthletes.map((athlete) => (
								<BusyAthleteWrapper key={athlete.id} athleteId={athlete.id}>
									<BusyAthleteItem>
										<AthleteLabel>{athlete.name}</AthleteLabel>
										<BusyReasonInput athleteId={athlete.id} />
									</BusyAthleteItem>
								</BusyAthleteWrapper>
							))}
						</HasUnregisteredWrapper>
					</BusyAthletesList>
				</AthleteSelectionSection>
			</TabContentBody>

			<TabFooter>
				<SaveButton>Save Registration</SaveButton>
			</TabFooter>
		</RegistrationProvider>
	);
}
