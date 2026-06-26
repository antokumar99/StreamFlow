interface Props {
  onCreateVideo: () => void;
  onCreateAudio: () => void;
  onFocusJoin: () => void;
}

export default function QuickActions({
  onCreateVideo,
  onCreateAudio,
  onFocusJoin,
}: Props) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={onCreateVideo}
          className="glass p-6 text-left hover:border-indigo-500 transition"
        >
          <h3 className="text-xl font-semibold">
            New Meeting
          </h3>

          <p className="text-gray-400 mt-2">
            Start instant meeting
          </p>
        </button>

        <button
          onClick={onFocusJoin}
          className="glass p-6 text-left hover:border-indigo-500 transition"
        >
          <h3 className="text-xl font-semibold">
            Join Meeting
          </h3>

          <p className="text-gray-400 mt-2">
            Join with room ID
          </p>
        </button>

        <button
          onClick={onCreateAudio}
          className="glass p-6 text-left hover:border-indigo-500 transition"
        >
          <h3 className="text-xl font-semibold">
            Audio Call
          </h3>

          <p className="text-gray-400 mt-2">
            Start a voice-first room
          </p>
        </button>
      </div>
    </div>
  );
}
