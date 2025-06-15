"use client";

import { Slot } from "@radix-ui/react-slot";
import { ComboboxRoot } from "src/shadcn/components/behaviors/comboBox";
import { ReasonInput } from "./practice_detail.ui";
import { useRegistration, type Athlete } from "./RegistrationContext";

export function AthleteCombobox({ children }: { children: React.ReactNode }) {
	const { dispatch } = useRegistration();

	const handleSelectAthlete = async (values: string[]) => {
		const ids = values.map((value) => value.split("-")[0]);
		dispatch({ type: "SET_REGISTERED_ATHLETES", athleteIds: ids });
	};

	return (
		<ComboboxRoot
			defaultSelectedItemValues={[]}
			handleSelectItem={handleSelectAthlete}
			multiple
		>
			{children}
		</ComboboxRoot>
	);
}

export function RegisterCount() {
	const { state } = useRegistration();
	return <>{state.selectedAthleteIds.length}</>;
}

interface EmptyRegisteredWrapperProps {
	children: React.ReactNode;
}

export function EmptyRegisteredWrapper({
	children,
}: EmptyRegisteredWrapperProps) {
	const { state } = useRegistration();
	if (state.selectedAthleteIds.length > 0) return null;
	return <>{children}</>;
}

interface HasRegisteredWrapperProps {
	children: React.ReactNode;
}

export function HasRegisteredWrapper({ children }: HasRegisteredWrapperProps) {
	const { state } = useRegistration();
	if (state.selectedAthleteIds.length === 0) return null;
	return <>{children}</>;
}

interface AllRegisteredWrapperProps {
	allAthletes: Athlete[];
	children: React.ReactNode;
}

export function AllRegisteredWrapper({
	allAthletes,
	children,
}: AllRegisteredWrapperProps) {
	const { getUnselectedAthletes } = useRegistration();
	const unselectedAthletes = getUnselectedAthletes(allAthletes);
	if (unselectedAthletes.length > 0) return null;
	return <>{children}</>;
}

interface HasUnregisteredWrapperProps {
	allAthletes: Athlete[];
	children: React.ReactNode;
}

export function HasUnregisteredWrapper({
	allAthletes,
	children,
}: HasUnregisteredWrapperProps) {
	const { getUnselectedAthletes } = useRegistration();
	const unselectedAthletes = getUnselectedAthletes(allAthletes);
	if (unselectedAthletes.length === 0) return null;
	return <>{children}</>;
}

interface RegisteredAthleteWrapperProps {
	athleteId: string;
	children: React.ReactNode;
}

export function RegisteredAthleteWrapper({
	athleteId,
	children,
}: RegisteredAthleteWrapperProps) {
	const { state } = useRegistration();
	const isSelected = state.selectedAthleteIds.some((id) => id === athleteId);

	if (!isSelected) return null;

	return <>{children}</>;
}

interface BusyAthleteWrapperProps {
	athleteId: string;
	children: React.ReactNode;
}

export function BusyAthleteWrapper({
	athleteId,
	children,
}: BusyAthleteWrapperProps) {
	const { state } = useRegistration();
	const isSelected = state.selectedAthleteIds.some((id) => id === athleteId);

	if (isSelected) return null;

	return <>{children}</>;
}

interface RemoveButtonProps {
	athleteId: string;
	children: React.ReactNode;
}

export function RemoveButton({ athleteId, children }: RemoveButtonProps) {
	const { dispatch } = useRegistration();

	const handleRemove = () => {
		dispatch({ type: "REMOVE_REGISTERED_ATHLETE", athleteId });
	};

	return <Slot onClick={handleRemove}>{children}</Slot>;
}

interface BusyReasonInputProps {
	athleteId: string;
}

export function BusyReasonInput({ athleteId }: BusyReasonInputProps) {
	const { state, dispatch } = useRegistration();

	const handleUpdateReason = (reason: string) => {
		dispatch({ type: "UPDATE_BUSY_REASON", athleteId, reason });
	};

	return (
		<ReasonInput
			placeholder="Why can't they join? (optional)"
			value={state.busyReasons[athleteId] || ""}
			onChange={handleUpdateReason}
		/>
	);
}
