"use client";

import {
  useEffect,
  useRef,
} from "react";

import { socket } from "@/lib/socket";

import { createPeerConnection } from "@/lib/webrtc";

import { useMeetingStore } from "@/store/meetingStore";

interface SocketParticipant {
  socketId: string;
  name?: string;
}

export const useWebRTC = (
  roomId: string,
  localStream: MediaStream | null
) => {
  const localStreamRef =
    useRef<MediaStream | null>(
      null
    );

  const peerConnections =
    useRef<Record<string, RTCPeerConnection | undefined>>({});

  const {
    addParticipant,
    updateStream,
    removeParticipant,
    clearParticipants,
  } = useMeetingStore();

  const hasLocalStream =
    Boolean(localStream);

  useEffect(() => {
    localStreamRef.current =
      localStream;

    if (!localStream) return;

    Object.values(
      peerConnections.current
    ).forEach((peer) => {
      if (!peer) return;

      localStream
        .getTracks()
        .forEach((track) => {
          const sender =
            peer
              .getSenders()
              .find(
                (peerSender) =>
                  peerSender.track?.kind ===
                  track.kind
              );

          if (sender) {
            sender.replaceTrack(
              track
            );
          }
        });
    });
  }, [localStream]);

  useEffect(() => {
    if (
      !roomId ||
      !hasLocalStream
    )
      return;

    if (!socket.connected) {
      socket.connect();
    }

    const createPeer = (
      targetId: string
    ) => {
      const existingPeer =
        peerConnections.current[
          targetId
        ];

      if (
        existingPeer &&
        existingPeer.connectionState !==
          "closed"
      ) {
        return existingPeer;
      }

      const peer =
        createPeerConnection();

      peerConnections.current[
        targetId
      ] = peer;

      const currentStream =
        localStreamRef.current;

      currentStream
        ?.getTracks()
        .forEach((track) => {
          peer.addTrack(
            track,
            currentStream
          );
        });

      peer.ontrack = (
        event
      ) => {
        updateStream(
          targetId,
          event.streams[0]
        );
      };

      peer.onicecandidate =
        (
          event
        ) => {
          if (
            event.candidate
          ) {
            socket.emit(
              "ice-candidate",
              {
                target:
                  targetId,

                candidate:
                  event.candidate,
              }
            );
          }
        };

      return peer;
    };

    const createOffer =
      async (
        targetId: string
      ) => {
        const peer =
          createPeer(
            targetId
          );

        const offer =
          await peer.createOffer();

        await peer.setLocalDescription(
          offer
        );

        socket.emit(
          "offer",
          {
            target:
              targetId,

            offer,
          }
        );
      };

    const handleExistingParticipants =
      async (
        participants: SocketParticipant[]
      ) => {
        for (const participant of participants) {
          if (
            participant.socketId ===
            socket.id
          )
            continue;

          addParticipant({
            id: participant.socketId,
            name:
              participant.name ||
              "Participant",
          });

          await createOffer(
            participant.socketId
          );
        }
      };

    const handleUserJoined =
      (
        user: SocketParticipant
      ) => {
        addParticipant({
          id: user.socketId,
          name:
            user.name ||
              "Participant",
        });
      };

    const handleOffer =
      async ({
        offer,
        senderId,
      }: {
        offer: RTCSessionDescriptionInit;
        senderId: string;
      }) => {
        addParticipant({
          id: senderId,
          name: "Participant",
        });

        const peer =
          createPeer(
            senderId
          );

        await peer.setRemoteDescription(
          new RTCSessionDescription(
            offer
          )
        );

        const answer =
          await peer.createAnswer();

        await peer.setLocalDescription(
          answer
        );

        socket.emit(
          "answer",
          {
            target:
              senderId,

            answer,
          }
        );
      };

    const handleAnswer =
      async ({
        answer,
        senderId,
      }: {
        answer: RTCSessionDescriptionInit;
        senderId: string;
      }) => {
        await peerConnections.current[
          senderId
        ]?.setRemoteDescription(
          new RTCSessionDescription(
            answer
          )
        );
      };

    const handleIceCandidate =
      async ({
        candidate,
        senderId,
      }: {
        candidate: RTCIceCandidateInit;
        senderId: string;
      }) => {
        await peerConnections.current[
          senderId
        ]?.addIceCandidate(
          new RTCIceCandidate(
            candidate
          )
        );
      };

    const handleUserLeft =
      (
        socketId: string
      ) => {
        removeParticipant(
          socketId
        );

        peerConnections.current[
          socketId
        ]?.close();

        delete peerConnections.current[
          socketId
        ];
      };

    socket.on(
      "existing-participants",
      handleExistingParticipants
    );

    socket.on(
      "user-joined",
      handleUserJoined
    );

    socket.on(
      "offer",
      handleOffer
    );

    socket.on(
      "answer",
      handleAnswer
    );

    socket.on(
      "ice-candidate",
      handleIceCandidate
    );

    socket.on(
      "user-left",
      handleUserLeft
    );

    socket.emit(
      "join-meeting",
      roomId
    );

    return () => {
      socket.emit(
        "leave-meeting",
        roomId
      );

      socket.off(
        "existing-participants",
        handleExistingParticipants
      );

      socket.off(
        "user-joined",
        handleUserJoined
      );

      socket.off(
        "offer",
        handleOffer
      );

      socket.off(
        "answer",
        handleAnswer
      );

      socket.off(
        "ice-candidate",
        handleIceCandidate
      );

      socket.off(
        "user-left",
        handleUserLeft
      );

      Object.values(
        peerConnections.current
      ).forEach((peer) => {
        peer?.close();
      });

      peerConnections.current = {};

      clearParticipants();
    };
  }, [
    roomId,
    hasLocalStream,
    addParticipant,
    updateStream,
    removeParticipant,
    clearParticipants,
  ]);
};
