"use client";

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

interface ControlButtonProps {
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}

function ControlButton({
  label,
  onClick,
  active = false,
  danger = false,
  children,
}: ControlButtonProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={onClick}
        aria-label={label}
        title={label}
        className={[
          "flex h-12 w-12 items-center justify-center rounded-full transition sm:h-14 sm:w-14",
          danger
            ? "bg-red-600 text-white hover:bg-red-500"
            : active
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-red-500/20 text-red-400 hover:bg-red-500/30",
        ].join(" ")}
      >
        {children}
      </button>

      <span className="hidden text-xs text-gray-400 sm:block">
        {label}
      </span>
    </div>
  );
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
    <div className="mt-4 flex flex-wrap items-start justify-center gap-3 sm:gap-5">
      <ControlButton
        label={
          audioEnabled ? "Mute" : "Unmute"
        }
        onClick={toggleAudio}
        active={audioEnabled}
      >
        {audioEnabled ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1l22 22" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23M12 19v4M8 23h8" />
          </svg>
        )}
      </ControlButton>

      <ControlButton
        label={
          videoEnabled
            ? "Stop Video"
            : "Start Video"
        }
        onClick={toggleVideo}
        active={videoEnabled}
      >
        {videoEnabled ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1l22 22" />
            <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
          </svg>
        )}
      </ControlButton>

      <ControlButton
        label="Share Screen"
        onClick={startScreenShare}
        active
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      </ControlButton>

      <ControlButton
        label={
          whiteboardOpen
            ? "Hide Board"
            : "Whiteboard"
        }
        onClick={toggleWhiteboard}
        active={!whiteboardOpen}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      </ControlButton>

      <ControlButton
        label="Leave"
        onClick={leaveMeeting}
        danger
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
          <path d="M23 1L1 23" />
        </svg>
      </ControlButton>
    </div>
  );
}
