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

export function SummaryTab() {
	return (
		<>
			<TabContentHeader>
				<TabContentTitle>Attendance Summary</TabContentTitle>
				<TabContentDescription>
					Final attendance details and walk-in athlete additions
				</TabContentDescription>
			</TabContentHeader>

			<TabContentBody>
				<PlaceholderContent>
					<PlaceholderTitle>Summary Interface</PlaceholderTitle>
					<PlaceholderText>
						This tab will show final attendance statistics and manage walk-ins.
					</PlaceholderText>
					<PlaceholderList>
						<PlaceholderListItem>
							• Summary statistics (registered, showed, no-show counts)
						</PlaceholderListItem>
						<PlaceholderListItem>
							• Add walk-in button for unregistered athletes who showed
						</PlaceholderListItem>
						<PlaceholderListItem>
							• List of athletes who showed with late/early departure toggles
						</PlaceholderListItem>
						<PlaceholderListItem>
							• Final save of attendance data with tracking details
						</PlaceholderListItem>
					</PlaceholderList>
				</PlaceholderContent>
			</TabContentBody>
		</>
	);
}
