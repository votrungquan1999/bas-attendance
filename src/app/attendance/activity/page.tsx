import AddNewActivitySection from './AddNewActivitySection'

export default async function ActivityPage({ params }: { params: { takerId: string } }) {
  return <AddNewActivitySection attendanceId={params.takerId} />
}
