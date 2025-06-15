import {
	TabContentHeader,
	TabContentTitle,
	TabContentDescription,
	TabContentBody,
	PlaceholderContent,
	PlaceholderTitle,
	PlaceholderText,
	PlaceholderList,
	PlaceholderListItem,
} from "./practice_detail.ui";

export function NoShowTab() {
	return (
		<>
			<TabContentHeader>
				<TabContentTitle>No Show Marking</TabContentTitle>
				<TabContentDescription>
					Mark which registered athletes didn&apos;t show up for practice
				</TabContentDescription>
			</TabContentHeader>

			<TabContentBody>
				<PlaceholderContent>
					<PlaceholderTitle>No Show Interface</PlaceholderTitle>
					<PlaceholderText>
						This tab will handle marking attendance for registered athletes.
					</PlaceholderText>
					<PlaceholderList>
						<PlaceholderListItem>
							• Display only registered athletes from Tab 1
						</PlaceholderListItem>
						<PlaceholderListItem>
							• Checkboxes to toggle between showed/no-show status
						</PlaceholderListItem>
						<PlaceholderListItem>
							• Clear visual distinction between attendance states
						</PlaceholderListItem>
						<PlaceholderListItem>
							• Determines who appears in final summary tab
						</PlaceholderListItem>
					</PlaceholderList>
				</PlaceholderContent>
			</TabContentBody>
		</>
	);
}
