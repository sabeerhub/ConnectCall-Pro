import { useEffect, useRef, useState, useCallback } from 'react';
import Peer, { Instance, SignalData } from 'simple-peer';
import { io, Socket } from 'socket.io-client';

export interface Participant {
  id: string;
  stream: MediaStream;
  peer: Instance | null;
  isLocal: boolean;
  name: string;
  photo?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking?: boolean;
}

export function useWebRTC(roomId: string, userId: string, userName: string, userPhoto?: string) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<{ [key: string]: Instance }>({});
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);

  // Audio analysis for speaker detection
  useEffect(() => {
    if (!localStreamRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(localStreamRef.current);
    source.connect(analyser);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    let animationId: number;
    const checkVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((p, c) => p + c, 0);
      const average = sum / dataArray.length;
      
      if (average > 30) {
        if (activeSpeakerId !== userId) {
          setActiveSpeakerId(userId);
          socketRef.current?.emit('speaking', { userId, roomId, isSpeaking: true });
        }
      } else {
        if (activeSpeakerId === userId) {
          setActiveSpeakerId(null);
          socketRef.current?.emit('speaking', { userId, roomId, isSpeaking: false });
        }
      }
      animationId = requestAnimationFrame(checkVolume);
    };

    checkVolume();

    return () => {
      cancelAnimationFrame(animationId);
      audioContext.close();
    };
  }, [participants.length, userId]);

  const createPeer = useCallback((userToCall: string, callerId: string, stream: MediaStream, remoteName: string, remotePhoto?: string) => {
    const peer = new Peer({ 
      initiator: true, 
      trickle: false, 
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ]
      }
    });

    peer.on('signal', signal => {
      socketRef.current?.emit('sending-signal', { userToCall, callerId, signal });
    });

    peer.on('stream', remoteStream => {
      setParticipants(prev => {
        const existing = prev.find(p => p.id === userToCall);
        if (existing) {
          return prev.map(p => p.id === userToCall ? { ...p, stream: remoteStream, peer } : p);
        }
        return [...prev, { 
          id: userToCall, 
          stream: remoteStream, 
          peer, 
          isLocal: false, 
          name: remoteName, 
          photo: remotePhoto,
          isMuted: false, 
          isVideoOff: false 
        }];
      });
    });

    peer.on('error', err => console.error('Peer error:', err));
    return peer;
  }, [roomId]);

  const addPeer = useCallback((incomingSignal: SignalData, callerId: string, stream: MediaStream, remoteName: string, remotePhoto?: string) => {
    const peer = new Peer({ 
      initiator: false, 
      trickle: false, 
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ]
      }
    });

    peer.on('signal', signal => {
      socketRef.current?.emit('returning-signal', { signal, callerId });
    });

    peer.on('stream', remoteStream => {
      setParticipants(prev => {
        const existing = prev.find(p => p.id === callerId);
        if (existing) {
          return prev.map(p => p.id === callerId ? { ...p, stream: remoteStream, peer } : p);
        }
        return [...prev, { 
          id: callerId, 
          stream: remoteStream, 
          peer, 
          isLocal: false, 
          name: remoteName, 
          photo: remotePhoto,
          isMuted: false, 
          isVideoOff: false 
        }];
      });
    });

    peer.on('error', err => console.error('Peer error:', err));
    peer.signal(incomingSignal);
    return peer;
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !userId) return;

    const startConnection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        
        setParticipants([{ 
          id: userId, 
          stream, 
          isLocal: true, 
          name: userName, 
          photo: userPhoto,
          peer: null,
          isMuted: false,
          isVideoOff: false
        }]);

        socketRef.current = io('/', { path: '/socket.io' });
        socketRef.current.emit('join-room', roomId, userId, userName, userPhoto);

        socketRef.current.on('all-users', (users: { userId: string, name: string, photo?: string }[]) => {
          users.forEach(u => {
            const peer = createPeer(u.userId, userId, stream, u.name, u.photo);
            peersRef.current[u.userId] = peer;
          });
        });

        socketRef.current.on('user-joined-notification', ({ userId: remoteId, name, photo }: any) => {
          // New user joined, we'll wait for their signal (they are the initiator)
          setParticipants(prev => {
            if (prev.find(p => p.id === remoteId)) return prev;
            return [...prev, { 
              id: remoteId, 
              name, 
              photo, 
              isLocal: false, 
              isMuted: false, 
              isVideoOff: false, 
              stream: new MediaStream(), // Placeholder until stream event
              peer: null 
            }];
          });
        });

        socketRef.current.on('user-joined-signal', (payload: { signal: SignalData, callerId: string }) => {
          setParticipants(prev => {
            const p = prev.find(x => x.id === payload.callerId);
            const peer = addPeer(payload.signal, payload.callerId, stream, p?.name || 'Participant', p?.photo);
            peersRef.current[payload.callerId] = peer;
            return prev;
          });
        });

        socketRef.current.on('receiving-returned-signal', (payload: { signal: SignalData, id: string }) => {
          const peer = peersRef.current[payload.id];
          if (peer) {
            peer.signal(payload.signal);
          }
        });

        socketRef.current.on('user-disconnected', (remoteUserId: string) => {
          const peer = peersRef.current[remoteUserId];
          if (peer) {
            peer.destroy();
            delete peersRef.current[remoteUserId];
          }
          setParticipants(prev => prev.filter(p => p.id !== remoteUserId));
        });

        socketRef.current.on('user-kicked', ({ targetUserId }: { targetUserId: string }) => {
          if (targetUserId === userId) {
            window.location.href = '/dashboard?kicked=true';
            return;
          }
          setParticipants(prev => prev.filter(p => p.id !== targetUserId));
        });

        socketRef.current.on('toggle-remote-media', ({ type, value, targetUserId }: { type: 'audio' | 'video', value: boolean, targetUserId: string }) => {
          if (targetUserId === userId) {
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

        socketRef.current.on('user-speaking', ({ userId: speakerId, isSpeaking }: { userId: string, isSpeaking: boolean }) => {
          if (isSpeaking) {
            setActiveSpeakerId(speakerId);
          } else if (activeSpeakerId === speakerId) {
            setActiveSpeakerId(null);
          }
        });

      } catch (error) {
        console.error('WebRTC Init Error:', error);
      }
    };

    startConnection();

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      socketRef.current?.disconnect();
      Object.keys(peersRef.current).forEach(id => {
        peersRef.current[id].destroy();
        delete peersRef.current[id];
      });
    };
  }, [roomId, userId, userName, userPhoto, createPeer, addPeer]);

  const toggleMedia = (type: 'audio' | 'video', value: boolean, targetUserId: string) => {
    if (targetUserId === userId && localStreamRef.current) {
      if (type === 'audio') {
        localStreamRef.current.getAudioTracks().forEach(t => t.enabled = value);
      } else {
        localStreamRef.current.getVideoTracks().forEach(t => t.enabled = value);
      }
      
      setParticipants(prev => prev.map(p => {
        if (p.id === userId) {
          return { 
            ...p, 
            isMuted: type === 'audio' ? !value : p.isMuted,
            isVideoOff: type === 'video' ? !value : p.isVideoOff
          };
        }
        return p;
      }));
    }
    socketRef.current?.emit('toggle-media', { type, value, targetUserId, roomId });
  };

  const kickUser = (targetUserId: string) => {
    socketRef.current?.emit('kick-user', { targetUserId, roomId });
  };

  return { participants, toggleMedia, activeSpeakerId, kickUser };
}
