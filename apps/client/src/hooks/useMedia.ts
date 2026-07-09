"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

interface UseMediaOptions {
  initialVideo?: boolean;
}

export const useMedia = (
  options: UseMediaOptions = {}
) => {
  const initialVideo =
    options.initialVideo ?? true;
  const cameraStreamRef =
    useRef<MediaStream | null>(
      null
    );

  const [stream, setStream] =
    useState<MediaStream | null>(
      null
    );

  const [audioEnabled, setAudioEnabled] =
    useState(true);

  const [videoEnabled, setVideoEnabled] =
    useState(initialVideo);

  const [mediaError, setMediaError] =
    useState("");

  useEffect(() => {
    const getMedia = async () => {
      // Try full media first, then fall back so a missing/blocked
      // camera or mic never prevents joining the meeting.
      try {
        const mediaStream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: initialVideo,
              audio: true,
            }
          );

        cameraStreamRef.current =
          mediaStream;

        setStream(mediaStream);
        return;
      } catch (error) {
        console.log(error);
      }

      if (initialVideo) {
        try {
          const audioStream =
            await navigator.mediaDevices.getUserMedia(
              {
                audio: true,
              }
            );

          cameraStreamRef.current =
            audioStream;

          setStream(audioStream);
          setVideoEnabled(false);
          setMediaError(
            "Camera is unavailable, joined with microphone only."
          );
          return;
        } catch (error) {
          console.log(error);
        }
      }

      const emptyStream =
        new MediaStream();

      cameraStreamRef.current =
        emptyStream;

      setStream(emptyStream);
      setAudioEnabled(false);
      setVideoEnabled(false);
      setMediaError(
        "Camera and microphone are unavailable. You joined as a viewer."
      );
    };

    getMedia();
  }, [initialVideo]);

  const toggleAudio = () => {
    if (!stream) return;

    stream
      .getAudioTracks()
      .forEach((track) => {
        track.enabled =
          !track.enabled;
      });

    setAudioEnabled(
      !audioEnabled
    );
  };

  const toggleVideo = () => {
    if (!stream) return;

    const videoTracks =
      stream.getVideoTracks();

    if (
      videoTracks.length === 0 &&
      !videoEnabled
    ) {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then((videoStream) => {
          const videoTrack =
            videoStream.getVideoTracks()[0];

          if (!videoTrack) return;

          const nextStream =
            new MediaStream([
              ...stream.getAudioTracks(),
              videoTrack,
            ]);

          cameraStreamRef.current =
            nextStream;
          setStream(nextStream);
          setVideoEnabled(true);
        })
        .catch((error) =>
          console.log(error)
        );

      return;
    }

    videoTracks.forEach((track) => {
      track.enabled =
        !track.enabled;
    });

    setVideoEnabled(
      !videoEnabled
    );
  };

  const startScreenShare =
    async () => {
      try {
        const screenStream =
          await navigator.mediaDevices.getDisplayMedia(
            {
              video: true,
            }
          );

        const screenVideoTrack =
          screenStream.getVideoTracks()[0];

        const audioTracks =
          cameraStreamRef.current?.getAudioTracks() ||
          [];

        const sharedStream =
          new MediaStream([
            screenVideoTrack,
            ...audioTracks,
          ]);

        screenVideoTrack.onended =
          () => {
            if (
              cameraStreamRef.current
            ) {
              setStream(
                cameraStreamRef.current
              );
            }
          };

        setStream(sharedStream);
      } catch (error) {
        console.log(error);
      }
    };

  const shareCanvasStream = (
    canvas: HTMLCanvasElement
  ) => {
    const canvasWithCapture =
      canvas as HTMLCanvasElement & {
        captureStream?: (
          frameRate?: number
        ) => MediaStream;
      };

    const canvasStream =
      canvasWithCapture.captureStream?.(30);

    const canvasTrack =
      canvasStream?.getVideoTracks()[0];

    if (!canvasTrack) {
      return;
    }

    const audioTracks =
      cameraStreamRef.current?.getAudioTracks() ||
      stream?.getAudioTracks() ||
      [];

    const sharedStream =
      new MediaStream([
        canvasTrack,
        ...audioTracks,
      ]);

    canvasTrack.onended =
      () => {
        if (cameraStreamRef.current) {
          setStream(
            cameraStreamRef.current
          );
        }
      };

    setStream(sharedStream);
    setVideoEnabled(true);
  };

  return {
    stream,
    audioEnabled,
    videoEnabled,
    mediaError,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    shareCanvasStream,
  };
};
