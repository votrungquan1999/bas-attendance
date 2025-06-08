import * as DatePicker from "./DatePicker";
import { CreateForm, FormActions } from "./practice_list.ui";
import { action_createSummerPractice } from "src/app/admin/summer-attendance/action_createSummerPractice";
import * as Form from "@radix-ui/react-form";
import * as SubmitButton from "src/components/behaviros/SubmitButton";

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
					<SubmitButton.Root>
						<SubmitButton.SubmitMessage>
							Create Practice
						</SubmitButton.SubmitMessage>
						<SubmitButton.PendingMessage>Creating…</SubmitButton.PendingMessage>
					</SubmitButton.Root>
				</FormActions>
			</Form.Root>
		</CreateForm>
	);
}
