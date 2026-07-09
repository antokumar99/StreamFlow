import MeetingRoom from "@/components/meeting/MeetingRoom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";


export default async function MeetingPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return (
    <ProtectedRoute>
      <MeetingRoom roomId={roomId} />
    </ProtectedRoute>
  );
}