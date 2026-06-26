interface Props {
  audioEnabled: boolean;
  videoEnabled: boolean;

  toggleAudio: () => void;
  toggleVideo: () => void;

  startScreenShare: () => void;
  leaveMeeting: () => void;
  toggleWhiteboard: () => void;
  whiteboardOpen: boolean;
}

export default function MeetingControls({
  audioEnabled,
  videoEnabled,
  toggleAudio,
  toggleVideo,
  startScreenShare,
  leaveMeeting,
  toggleWhiteboard,
  whiteboardOpen,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button
        onClick={toggleAudio}
        className="glass px-5 py-3 rounded-xl"
      >
        {audioEnabled
          ? "Mute"
          : "Unmute"}
      </button>

      <button
        onClick={toggleVideo}
        className="glass px-5 py-3 rounded-xl"
      >
        {videoEnabled
          ? "Stop Video"
          : "Start Video"}
      </button>

      <button
        onClick={startScreenShare}
        className="glass px-5 py-3 rounded-xl"
      >
        Share Screen
      </button>

      <button
        onClick={toggleWhiteboard}
        className="glass px-5 py-3 rounded-xl"
      >
        {whiteboardOpen
          ? "Hide Whiteboard"
          : "Whiteboard"}
      </button>

      <button
        onClick={leaveMeeting}
        className="glass px-5 py-3 rounded-xl"
      >
        Leave Meeting
      </button>
    </div>
  );
}
