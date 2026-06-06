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
  isFocused?: boolean;
  isMinimized?: boolean;
  onSelect: () => void;
  onToggleMinimize?: () => void;
}

function VideoTile({
  tile,
  isFocused,
  isMinimized,
  onSelect,
  onToggleMinimize,
}: VideoTileProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "group relative overflow-hidden border bg-black text-left transition",
        "focus:outline-none focus:ring-2 focus:ring-indigo-400",
        isFocused
          ? "h-full rounded-xl border-indigo-400"
          : "aspect-video rounded-lg border-gray-700 hover:border-indigo-400",
        isMinimized
          ? "max-w-45"
          : "",
      ].join(" ")}
    >
      <VideoPlayer
        stream={tile.stream}
        muted={tile.isLocal}
      />

      {!tile.stream ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#111827] text-sm text-gray-400">
          Waiting for video
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/65 px-3 py-2">
        <span className="min-w-0 truncate text-sm font-medium text-white">
          {tile.name}
          {tile.isLocal ? " (You)" : ""}
        </span>

        {tile.isLocal &&
        onToggleMinimize ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              onToggleMinimize();
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                event.stopPropagation();
                onToggleMinimize();
              }
            }}
            className="shrink-0 rounded bg-white/15 px-2 py-1 text-xs text-white hover:bg-white/25"
          >
            {isMinimized
              ? "Restore"
              : "Minimize"}
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

  const [
    focusedId,
    setFocusedId,
  ] = useState("local");

  const [
    isLocalMinimized,
    setIsLocalMinimized,
  ] = useState(false);

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
    tiles.find(
      (tile) =>
        tile.id === focusedId
    ) || tiles[0];

  const otherTiles =
    tiles.filter(
      (tile) =>
        tile.id !== focusedTile.id
    );

  const handleSelect = (
    tile: Tile
  ) => {
    setFocusedId(tile.id);

    if (tile.isLocal) {
      setIsLocalMinimized(false);
    }
  };

  const handleToggleLocalMinimize =
    () => {
      setIsLocalMinimized(
        (current) => {
          const next = !current;

          if (
            next &&
            focusedId === "local"
          ) {
            const firstRemote =
              tiles.find(
                (tile) =>
                  tile.id !==
                  "local"
              );

            if (firstRemote) {
              setFocusedId(
                firstRemote.id
              );
            }
          }

          return next;
        }
      );
    };

  if (tiles.length === 1) {
    return (
      <div className="flex-1 min-h-0">
        <VideoTile
          tile={tiles[0]}
          isFocused
          isMinimized={
            isLocalMinimized
          }
          onSelect={() =>
            handleSelect(tiles[0])
          }
          onToggleMinimize={
            handleToggleLocalMinimize
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4">
      <div className="min-h-65 flex-1">
        <VideoTile
          tile={focusedTile}
          isFocused
          isMinimized={
            focusedTile.isLocal &&
            isLocalMinimized
          }
          onSelect={() =>
            handleSelect(
              focusedTile
            )
          }
          onToggleMinimize={
            focusedTile.isLocal
              ? handleToggleLocalMinimize
              : undefined
          }
        />
      </div>

      <div className="grid max-h-[34vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {otherTiles.map(
          (tile) => (
            <VideoTile
              key={tile.id}
              tile={tile}
              isMinimized={
                tile.isLocal &&
                isLocalMinimized
              }
              onSelect={() =>
                handleSelect(tile)
              }
              onToggleMinimize={
                tile.isLocal
                  ? handleToggleLocalMinimize
                  : undefined
              }
            />
          )
        )}
      </div>
    </div>
  );
}
