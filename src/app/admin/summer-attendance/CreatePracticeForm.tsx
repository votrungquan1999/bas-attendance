import * as DatePicker from "./DatePicker";
import { CreateForm, FormActions } from "./practice_list.ui";
import { action_createSummerPractice } from "src/server/actions/action_createSummerPractice";
import * as Form from "@radix-ui/react-form";

export function CreatePracticeForm() {
	return (
		<CreateForm>
			<Form.Root action={action_createSummerPractice} className="contents">
				<Form.Field name="practiceDate">
					<Form.Label className="block text-sm font-medium text-gray-700 mb-2">
						Practice Date
					</Form.Label>
					<Form.Control asChild>
						<DatePicker.Root name="practiceDate">
							<DatePicker.Trigger>
								<DatePicker.Value placeholder="Select practice date" />
							</DatePicker.Trigger>
						</DatePicker.Root>
					</Form.Control>
				</Form.Field>

				<FormActions>
					<button
						type="submit"
						className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Create Practice
					</button>
					<button
						type="reset"
						className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
					>
						Clear
					</button>
				</FormActions>
			</Form.Root>
		</CreateForm>
	);
}
