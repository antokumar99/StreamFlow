"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

export const useMedia = () => {
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
    useState(true);

    useEffect(() => {
    const getMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(
          {
            video: true,
            audio: true,
          }
        );

        cameraStreamRef.current =
          mediaStream;

        setStream(mediaStream);
      } catch (error) {
        console.log(error);
      }
    };

    getMedia();
    }, []);

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

    stream
      .getVideoTracks()
      .forEach((track) => {
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

  return {
    stream,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    startScreenShare,
  };
};
