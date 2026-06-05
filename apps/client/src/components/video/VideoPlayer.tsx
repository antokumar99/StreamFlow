"use client";

import {
  useEffect,
  useRef,
} from "react";

interface Props {
  stream: MediaStream | null;

  muted?: boolean;
}

export default function VideoPlayer({
  stream,
  muted,
}: Props) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (
      videoRef.current &&
      stream
    ) {
      console.log(
        "Attaching stream"
      );

      videoRef.current.srcObject =
        stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className="w-full h-full object-cover rounded-2xl bg-black"
    />
  );
}