"use client";

import {
  useMemo,
  useState,
} from "react";

import { useAuthStore } from "@/store/authStore";
import { useMeetingStore } from "@/store/meetingStore";

import VideoPlayer from "../video/VideoPlayer";

interface Props {
  localStream: MediaStream | null;
}

interface Tile {
  id: string;
  name: string;
  stream: MediaStream | null;
  isLocal?: boolean;
}

interface VideoTileProps {
  tile: Tile;
  selected?: boolean;
  variant: "gallery" | "stage" | "thumb";
  onSelect: () => void;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getGalleryColumns = (
  count: number
) => {
  if (count <= 1) {
    return "grid-cols-1";
  }

  if (count === 2) {
    return "grid-cols-1 md:grid-cols-2";
  }

  if (count <= 4) {
    return "grid-cols-1 sm:grid-cols-2";
  }

  if (count <= 6) {
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }

  if (count <= 9) {
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }

  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
};

function VideoTile({
  tile,
  selected,
  variant,
  onSelect,
}: VideoTileProps) {
  const hasVideo =
    Boolean(
      tile.stream
        ?.getVideoTracks()
        .some(
          (track) =>
            track.readyState === "live"
        )
    );

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "group relative min-h-0 overflow-hidden bg-black text-left shadow-lg transition",
        "focus:outline-none focus:ring-2 focus:ring-indigo-400",
        variant === "gallery"
          ? "h-full rounded-lg border"
          : "",
        variant === "stage"
          ? "h-full rounded-lg border"
          : "",
        variant === "thumb"
          ? "aspect-video rounded-md border"
          : "",
        selected
          ? "border-indigo-400 ring-2 ring-indigo-400/50"
          : "border-gray-700 hover:border-gray-500",
      ].join(" ")}
    >
      <VideoPlayer
        stream={tile.stream}
        muted={tile.isLocal}
      />

      {!hasVideo ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111827]">
          <div
            className={[
              "flex items-center justify-center rounded-full bg-indigo-500/20 font-semibold text-indigo-100",
              variant === "thumb"
                ? "h-12 w-12 text-base"
                : "h-24 w-24 text-3xl",
            ].join(" ")}
          >
            {getInitials(tile.name)}
          </div>
          {variant !== "thumb" ? (
            <p className="mt-4 text-sm text-gray-400">
              Camera off
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/70 px-3 py-2">
        <span className="min-w-0 truncate text-sm font-medium text-white">
          {tile.name}
          {tile.isLocal ? " (You)" : ""}
        </span>

        {selected ? (
          <span className="shrink-0 rounded bg-indigo-500 px-2 py-0.5 text-xs text-white">
            Focus
          </span>
        ) : null}
      </div>
    </button>
  );
}

export default function ParticipantGrid({
  localStream,
}: Props) {
  const { participants } =
    useMeetingStore();
  const { user } =
    useAuthStore();
  const [focusedId, setFocusedId] =
    useState<string | null>(null);

  const tiles = useMemo<Tile[]>(
    () => [
      {
        id: "local",
        name:
          user?.name ||
          "You",
        stream: localStream,
        isLocal: true,
      },
      ...participants.map(
        (participant) => ({
          id: participant.id,
          name:
            participant.name ||
            "Participant",
          stream:
            participant.stream ||
            null,
        })
      ),
    ],
    [
      localStream,
      participants,
      user?.name,
    ]
  );

  const focusedTile =
    focusedId
      ? tiles.find(
          (tile) =>
            tile.id === focusedId
        )
      : null;

  if (!focusedTile) {
    return (
      <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-800 bg-[#111827] p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-200">
            Gallery View
          </h2>
          <span className="rounded bg-white/10 px-2 py-1 text-xs text-gray-300">
            {tiles.length} participants
          </span>
        </div>

        <div
          className={[
            "grid min-h-[58vh] flex-1 gap-3",
            getGalleryColumns(
              tiles.length
            ),
          ].join(" ")}
        >
          {tiles.map((tile) => (
            <VideoTile
              key={tile.id}
              tile={tile}
              variant="gallery"
              onSelect={() =>
                setFocusedId(tile.id)
              }
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex min-h-[58vh] flex-1">
        <VideoTile
          tile={focusedTile}
          selected
          variant="stage"
          onSelect={() =>
            setFocusedId(
              focusedTile.id
            )
          }
        />
      </div>

      <div className="rounded-lg border border-gray-800 bg-[#111827] p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-200">
            Participants
          </h2>

          <button
            onClick={() =>
              setFocusedId(null)
            }
            className="rounded bg-white/10 px-3 py-1 text-xs text-gray-200 hover:bg-white/20"
          >
            Gallery
          </button>
        </div>

        <div className="grid max-h-[22vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7">
          {tiles.map((tile) => (
            <VideoTile
              key={tile.id}
              tile={tile}
              selected={
                tile.id ===
                focusedTile.id
              }
              variant="thumb"
              onSelect={() =>
                setFocusedId(tile.id)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
