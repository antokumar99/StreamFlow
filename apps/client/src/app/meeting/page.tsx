import { redirect } from "next/navigation";

export default function MeetingPage() {
  const roomId =
    crypto.randomUUID();

  redirect(`/meeting/${roomId}`);
}