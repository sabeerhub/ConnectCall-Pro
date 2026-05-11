import { useEffect, useRef, useState } from 'react';
import Peer, { Instance, SignalData } from 'simple-peer';
import { io, Socket } from 'socket.io-client';

export interface Participant {
  id: string;
  stream: MediaStream;
  peer: Instance;
  isLocal: boolean;
  name: string;
  isMuted: boolean;
  isVideoOff: boolean;
}

export function useWebRTC(roomId: string, userId: string, userName: string) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<{ [key: string]: Instance }>({});

  // Audio analysis for speaker detection
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);

  useEffect(() => {
    const startConnection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        
        // Add ourselves
        setParticipants([{ 
          id: userId, 
          stream, 
          isLocal: true, 
          name: userName, 
          peer: null as any,
          isMuted: false,
          isVideoOff: false
        }]);

        socketRef.current = io('/', { path: '/socket.io' });
        socketRef.current.emit('join-room', roomId, userId);

        socketRef.current.on('user-connected', (remoteUserId: string) => {
          const peer = createPeer(remoteUserId, userId, stream);
          peersRef.current[remoteUserId] = peer;
        });

        socketRef.current.on('receiving-returned-signal', (payload: { signal: SignalData, id: string }) => {
          const peer = peersRef.current[payload.id];
          peer?.signal(payload.signal);
        });

        socketRef.current.on('user-joined-signal', (payload: { signal: SignalData, callerId: string }) => {
          const peer = addPeer(payload.signal, payload.callerId, stream);
          peersRef.current[payload.callerId] = peer;
        });

        socketRef.current.on('user-disconnected', (remoteUserId: string) => {
          const peer = peersRef.current[remoteUserId];
          if (peer) {
            (peer as any).destroy();
            delete peersRef.current[remoteUserId];
          }
          setParticipants(prev => prev.filter(p => p.id !== remoteUserId));
        });

        socketRef.current.on('user-kicked', ({ targetUserId }: { targetUserId: string }) => {
          if (targetUserId === userId) {
            // We are kicked!
            window.location.href = '/dashboard?kicked=true';
          }
          setParticipants(prev => prev.filter(p => p.id !== targetUserId));
        });

        socketRef.current.on('toggle-remote-media', ({ type, value, targetUserId }: { type: 'audio' | 'video', value: boolean, targetUserId: string }) => {
          if (targetUserId === userId) {
            // Apply locally
            if (type === 'audio') {
              stream.getAudioTracks().forEach(t => t.enabled = value);
            } else {
              stream.getVideoTracks().forEach(t => t.enabled = value);
            }
          }
          
          setParticipants(prev => prev.map(p => {
            if (p.id === targetUserId) {
              return { 
                ...p, 
                isMuted: type === 'audio' ? !value : p.isMuted,
                isVideoOff: type === 'video' ? !value : p.isVideoOff
              };
            }
            return p;
          }));
        });

      } catch (error) {
        console.error('WebRTC Init Error:', error);
      }
    };

    startConnection();

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      socketRef.current?.disconnect();
      Object.values(peersRef.current).forEach(peer => (peer as any).destroy());
    };
  }, [roomId, userId]);

  function createPeer(userToCall: string, callerId: string, stream: MediaStream) {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on('signal', signal => socketRef.current?.emit('sending-signal', { userToCall, callerId, signal }));
    peer.on('stream', remoteStream => {
      setParticipants(prev => {
        if (prev.find(p => p.id === userToCall)) return prev;
        return [...prev, { 
          id: userToCall, 
          stream: remoteStream, 
          peer, 
          isLocal: false, 
          name: 'Participant', 
          isMuted: false, 
          isVideoOff: false 
        }];
      });
    });
    return peer;
  }

  function addPeer(incomingSignal: SignalData, callerId: string, stream: MediaStream) {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on('signal', signal => socketRef.current?.emit('returning-signal', { signal, callerId }));
    peer.on('stream', remoteStream => {
       setParticipants(prev => {
        if (prev.find(p => p.id === callerId)) return prev;
        return [...prev, { 
          id: callerId, 
          stream: remoteStream, 
          peer, 
          isLocal: false, 
          name: 'Participant', 
          isMuted: false, 
          isVideoOff: false 
        }];
      });
    });
    peer.signal(incomingSignal);
    return peer;
  }

  const toggleMedia = (type: 'audio' | 'video', value: boolean, targetUserId: string) => {
    socketRef.current?.emit('toggle-media', { type, value, targetUserId, roomId });
  };

  const kickUser = (targetUserId: string) => {
    socketRef.current?.emit('kick-user', { targetUserId, roomId });
  };

  return { participants, toggleMedia, activeSpeakerId, kickUser };
}
