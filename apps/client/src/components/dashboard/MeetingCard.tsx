interface MeetingCardProps {
  title: string;
  time: string;
  participants: number;
}

export default function MeetingCard({
  title,
  time,
  participants,
}: MeetingCardProps) {
  return (
    <div className="glass p-5 rounded-2xl">
      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="text-gray-400 mt-2">
        {time}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {participants} participants
        </span>

        <button className="btn-primary">
          Join
        </button>
      </div>
    </div>
  );
}