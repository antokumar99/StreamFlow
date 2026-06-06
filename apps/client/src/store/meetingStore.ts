import { create } from "zustand";

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
}

interface MeetingState {
  participants: Participant[];

  addParticipant: (
    participant: Participant
  ) => void;

  removeParticipant: (
    id: string
  ) => void;

  clearParticipants: () => void;

  updateStream: (
    id: string,
    stream: MediaStream
  ) => void;
}

export const useMeetingStore =
  create<MeetingState>((set) => ({
    participants: [],

    addParticipant: (
      participant
    ) =>
      set((state) => {
        const exists =
          state.participants.find(
            (p) =>
              p.id ===
              participant.id
          );

        if (exists)
          return {
            participants:
              state.participants.map(
                (p) =>
                  p.id ===
                  participant.id
                    ? {
                        ...p,
                        name:
                          participant.name ||
                          p.name,
                      }
                    : p
              ),
          };

        return {
          participants: [
            ...state.participants,
            participant,
          ],
        };
      }),

    removeParticipant: (
      id
    ) =>
      set((state) => ({
        participants:
          state.participants.filter(
            (p) =>
              p.id !== id
          ),
      })),

    clearParticipants: () =>
      set({
        participants: [],
      }),

    updateStream: (
      id,
      stream
    ) =>
      set((state) => ({
        participants:
          state.participants.some(
            (participant) =>
              participant.id === id
          )
            ? state.participants.map(
                (participant) =>
                  participant.id === id
                    ? {
                        ...participant,
                        stream,
                      }
                    : participant
              )
            : [
                ...state.participants,
                {
                  id,
                  name: "Participant",
                  stream,
                },
              ],
      })),
  }));
