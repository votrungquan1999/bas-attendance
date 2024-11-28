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
import { action_handleSelectTaker } from "../../../server/actions/action_handleSelectTaker";

export default async function TakerPage() {
	const cookieStore = await cookies();
	const cookieTaker = cookieStore.get("taker");
	const takers = await getTakers();

	if (cookieTaker && takers.some((t) => t.id === cookieTaker.value)) {
		redirect("/attendance/activity");
	}

	return (
		<div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
			<div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
				<h1 className="text-center text-2xl font-semibold text-slate-800">
					You are:
				</h1>

				<div className="relative w-full">
					<ComboboxRoot
						defaultSelectedItemKey="1"
						handleSelectItem={action_handleSelectTaker}
					>
						<ComboboxPopover>
							<ComboboxTrigger
								className="w-full transition-all hover:border-slate-400 focus:ring-2 focus:ring-slate-200"
								placeholder={
									<span className="text-slate-500">Select your name...</span>
								}
							/>
							<ComboboxContent
								className="max-h-[300px] overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg"
								inputPlaceholder="Type to search..."
								emptyNode={
									<div className="p-4 text-center text-slate-500">
										No matching names found
									</div>
								}
							>
								<ComboboxGroup>
									{takers.map((taker) => {
										const nonAccentName = toNonAccentVietnamese(taker.value);

										return (
											<ComboboxItem
												key={taker.id}
												value={`${taker.id}-${taker.value}-${nonAccentName}`}
												className="cursor-pointer px-4 py-2 hover:bg-slate-100"
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

				<p className="text-center text-sm text-slate-500">
					Can&apos;t find your name? Please contact your administrator.
				</p>
			</div>
		</div>
	);
}
