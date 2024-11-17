import {
	ComboboxRoot,
	ComboboxTrigger,
	ComboboxContent,
	ComboboxGroup,
	ComboboxItem,
	ComboboxPopover,
} from "src/shadcn/components/behaviors/comboBox";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import toNonAccentVietnamese from "src/helpers/toNonAccentVietnamese";
import { getTakers } from "./getTakers";
import { action_handleSelectTaker } from "./action_handleSelectTaker";

export default async function TakerPage() {
	const cookieStore = await cookies();

	const cookieTaker = cookieStore.get("taker");

	const takers = await getTakers();

	if (cookieTaker && takers.some((t) => t.id === cookieTaker.value)) {
		redirect("/attendance/activity");
	}

	return (
		<div className="flex flex-col justify-center flex-1">
			<div className="flex justify-center">
				<ComboboxRoot
					defaultSelectedItemKey="1"
					handleSelectItem={action_handleSelectTaker}
				>
					<ComboboxPopover>
						<ComboboxTrigger
							placeholder={<span className="text-slate-500">You are:</span>}
						/>
						<ComboboxContent
							inputPlaceholder="Search your name…"
							emptyNode="Not found."
						>
							<ComboboxGroup>
								{takers.map((taker) => {
									const nonAccentName = toNonAccentVietnamese(taker.value);

									if (taker.id === "test_user") {
										return (
											<ComboboxItem
												key={taker.id}
												value={`${taker.id}-${taker.value}-${nonAccentName}`}
											>
												{""}
											</ComboboxItem>
										);
									}

									return (
										<ComboboxItem
											key={taker.id}
											value={`${taker.id}-${taker.value}-${nonAccentName}`}
										>
											{taker.value}
										</ComboboxItem>
									);
								})}
							</ComboboxGroup>
						</ComboboxContent>
					</ComboboxPopover>
				</ComboboxRoot>
			</div>
		</div>
	);
}
