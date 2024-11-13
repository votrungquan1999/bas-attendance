import {
	ComboboxRoot,
	ComboboxTrigger,
	ComboboxContent,
	ComboboxGroup,
	ComboboxItem,
	ComboboxPopover,
} from "src/shadcn/components/behaviors/comboBox";
import { setTimeout } from "node:timers/promises";
import { revalidatePath } from "next/cache";

const takers = [
	{
		key: "1",
		value: "123",
	},
	{
		key: "2",
		value: "234",
	},
	{
		key: "3",
		value: "345",
	},
	{
		key: "4",
		value: "456",
	},
];

export default async function TakerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	console.log("TakerLayout rendering");
	await setTimeout(2000);
	console.log("TakerLayout rendered");

	return (
		<div>
			<ComboboxRoot
				defaultSelectedItemKey="1"
				handleSelectItem={async (key: string) => {
					"use server";

					await setTimeout(2000);
					console.log(key);

					revalidatePath("/");
				}}
			>
				<ComboboxPopover>
					<ComboboxTrigger placeholder="Select a taker" />
					<ComboboxContent
						inputPlaceholder="Search taker..."
						emptyNode="No taker found."
					>
						<ComboboxGroup>
							{takers.map((taker) => (
								<ComboboxItem key={taker.key} value={taker.key}>
									{taker.value}
								</ComboboxItem>
							))}
						</ComboboxGroup>
					</ComboboxContent>
				</ComboboxPopover>
			</ComboboxRoot>
			{children}
		</div>
	);
}
