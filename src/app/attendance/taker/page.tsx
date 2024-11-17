import {
	ComboboxRoot,
	ComboboxTrigger,
	ComboboxContent,
	ComboboxGroup,
	ComboboxItem,
	ComboboxPopover,
} from "src/shadcn/components/behaviors/comboBox";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import toNonAccentVietnamese from "src/helpers/toNonAccentVietnamese";
import { getTakers } from "./getTakers";

async function handleSelectTaker(value: string) {
	"use server";

	const cookieStore = await cookies();

	const [id] = value.split("-");

	if (!id) return;

	cookieStore.set("taker", id);

	revalidatePath("/");
}

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
					handleSelectItem={handleSelectTaker}
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

									console.log(nonAccentName);

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
