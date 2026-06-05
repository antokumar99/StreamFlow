import MeetingCard from "./MeetingCard";

const meetings = [
  {
    title: "Team Sync Meeting",
    time: "Today - 10:00 AM",
    participants: 8,
  },

  {
    title: "Product Discussion",
    time: "Yesterday - 2:00 PM",
    participants: 5,
  },

  {
    title: "AI Planning Session",
    time: "Monday - 6:00 PM",
    participants: 12,
  },
];

export default function RecentMeetings() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Recent Meetings
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {meetings.map((meeting, index) => (
          <MeetingCard
            key={index}
            title={meeting.title}
            time={meeting.time}
            participants={
              meeting.participants
            }
          />
        ))}
      </div>
    </div>
  );
}