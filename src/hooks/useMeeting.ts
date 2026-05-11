import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Peer from "peerjs";

export interface Participant {
  id: string;
  stream: MediaStream;
  isLocal: boolean;
}

export function useMeeting(roomId: string) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Get media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        setParticipants([{ id: "local", stream, isLocal: true }]);

        // Initialize Socket
        socketRef.current = io("/", {
          path: "/socket.io" // Ensure correct path for dev server
        });

        // Initialize Peer
        // Using a random ID for peer, or let peerjs generate one
        peerRef.current = new Peer();

        peerRef.current.on("open", (peerId) => {
          console.log("My peer ID is:", peerId);
          socketRef.current?.emit("join-room", roomId, peerId);
        });

        // Handle incoming calls
        peerRef.current.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            addParticipant(call.peer, remoteStream);
          });
        });

        // Handle new users connecting
        socketRef.current.on("user-connected", (userId: string) => {
          console.log("User connected:", userId);
          const call = peerRef.current?.call(userId, stream);
          call?.on("stream", (remoteStream) => {
            addParticipant(userId, remoteStream);
          });
        });

        // Handle users disconnecting
        socketRef.current.on("user-disconnected", (userId: string) => {
          console.log("User disconnected:", userId);
          setParticipants((prev) => prev.filter((p) => p.id !== userId));
        });

      } catch (err) {
        console.error("Failed to initialize meeting:", err);
        setError("Could not access camera/microphone. Please check permissions.");
      }
    };

    init();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      socketRef.current?.disconnect();
      peerRef.current?.destroy();
    };
  }, [roomId]);

  const addParticipant = (id: string, stream: MediaStream) => {
    setParticipants((prev) => {
      if (prev.find((p) => p.id === id)) return prev;
      return [...prev, { id, stream, isLocal: false }];
    });
  };

  return { participants, error };
}
