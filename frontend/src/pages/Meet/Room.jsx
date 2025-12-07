import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, IconButton, Stack, Paper, Tooltip } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import { getSocket } from "../../services/socket";
import { useNotifications } from "../../context/NotificationContext";
import { toast } from "react-toastify";

const STUN_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export default function MeetingRoom() {
  const { id: roomId } = useParams();
  const localVideoRef = useRef(null);
  const [peers, setPeers] = useState({}); // socketId -> { pc, stream, remoteReady, userName }
  const peersRef = useRef({}); // socketId -> { pc, stream, remoteReady, userName }
  const candidateQueueRef = useRef({}); // socketId -> RTCIceCandidate[]
  const [localStream, setLocalStream] = useState(null);
  const [localUserName, setLocalUserName] = useState("");
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenStreamRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const { removeMeetingNotification } = useNotifications();

  const ensureQueue = (socketId) => {
    if (!candidateQueueRef.current[socketId]) candidateQueueRef.current[socketId] = [];
    return candidateQueueRef.current[socketId];
  };

  const markRemoteReady = (socketId) => {
    if (peersRef.current[socketId]) {
      peersRef.current[socketId].remoteReady = true;
    }
    setPeers((prev) => ({
      ...prev,
      [socketId]: { ...(prev[socketId] || {}), remoteReady: true },
    }));
    const queue = ensureQueue(socketId);
    const pc = peersRef.current[socketId]?.pc;
    if (!pc) return;
    queue.forEach(async (cand) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      } catch {
        console.error("Error adding queued ICE candidate");
      }
    });
    candidateQueueRef.current[socketId] = [];
  };

  const addTracksToPeerConnection = (pc, stream) => {
    if (!pc || !stream) return;
    const senders = pc.getSenders();
    
    // Get tracks from stream
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();
    const videoSenders = senders.filter((s) => s.track && s.track.kind === "video");
    const audioSenders = senders.filter((s) => s.track && s.track.kind === "audio");
    
    // If no senders exist, just add all tracks
    if (senders.length === 0) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
      return;
    }
    
    // Replace video tracks
    if (videoTracks.length > 0) {
      videoTracks.forEach((newVideoTrack, index) => {
        if (videoSenders[index]) {
          // Replace existing video track
          videoSenders[index].replaceTrack(newVideoTrack).catch((err) => {
            console.error("Error replacing video track:", err);
            // Fallback: remove and add
            try {
              pc.removeTrack(videoSenders[index]);
              pc.addTrack(newVideoTrack, stream);
            } catch (e) {
              console.error("Error in fallback track replacement:", e);
            }
          });
        } else {
          // No existing video sender, add new one
          pc.addTrack(newVideoTrack, stream);
        }
      });
    }
    
    // Remove extra video senders if any
    if (videoSenders.length > videoTracks.length) {
      for (let i = videoTracks.length; i < videoSenders.length; i++) {
        try {
          pc.removeTrack(videoSenders[i]);
        } catch (e) {
          console.error("Error removing video sender:", e);
        }
      }
    }
    
    // Handle audio tracks
    if (audioTracks.length > 0) {
      const newAudioTrack = audioTracks[0]; // Usually just one audio track
      if (audioSenders.length === 0) {
        // No audio sender, add one
        pc.addTrack(newAudioTrack, stream);
      } else if (audioSenders[0]) {
        // Replace existing audio track
        audioSenders[0].replaceTrack(newAudioTrack).catch((err) => {
          console.error("Error replacing audio track:", err);
        });
      }
    }
  };

  const createPeerConnection = (targetSocketId) => {
    const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });
    
    // Add tracks from current stream (could be camera or screen share)
    const currentStream = isScreenSharing && screenStreamRef.current 
      ? screenStreamRef.current 
      : localStream;
    if (currentStream) {
      addTracksToPeerConnection(pc, currentStream);
    }
    
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (peersRef.current[targetSocketId]) {
        peersRef.current[targetSocketId].stream = stream;
      }
      setPeers((prev) => ({
        ...prev,
        [targetSocketId]: { ...(prev[targetSocketId] || {}), stream, pc },
      }));
      
      // Update video element when stream arrives
      const videoEl = remoteVideoRefs.current[targetSocketId];
      if (videoEl && stream) {
        videoEl.srcObject = stream;
      }
    };
    
    // ICE
    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit("rtc-ice-candidate", {
          targetSocketId,
          candidate: e.candidate,
          roomId,
        });
      }
    };
    
    peersRef.current[targetSocketId] = {
      pc,
      stream: null,
      remoteReady: false,
      userName: peersRef.current[targetSocketId]?.userName || "",
    };
    return pc;
  };

  useEffect(() => {
    if (!roomId) return;
    let mounted = true;

    const init = async () => {
      let computedLocalName = "User";
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          computedLocalName = user.name || "User";
          setLocalUserName(computedLocalName);
        } else {
          setLocalUserName(computedLocalName);
        }
      } catch {
        setLocalUserName(computedLocalName);
      }

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch (err) {
        console.warn("getUserMedia error:", err?.name, err?.message);
        if (err?.name === "NotReadableError" || err?.name === "TrackStartError") {
          toast.error("Camera is in use by another application or tab. Joining audio-only.");
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            toast.info("Joined as audio-only because camera is busy.");
          } catch (err2) {
            console.error("Audio-only fallback failed:", err2);
            toast.error("Unable to access camera or microphone. Please close other apps/tabs and try again.");
          }
        } else {
          console.error("getUserMedia unexpected error:", err);
          toast.error("Unable to access camera or microphone. Please check permissions.");
        }
      }

      if (!mounted) return;
      if (stream) {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }

      // Connect socket
      // cookie-based socket, no token
const s = getSocket();
socketRef.current = s;


      // Receive list of current peers
      s.on("rtc-room-users", async ({ peers }) => {
        for (const targetSocketId of peers) {
          if (!peersRef.current[targetSocketId]?.pc) {
            const pc = createPeerConnection(targetSocketId);
            peersRef.current[targetSocketId].pc = pc;
          }
          const pc = peersRef.current[targetSocketId].pc;
          // Create offer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          s.emit("rtc-offer", { targetSocketId, description: offer, roomId });
        }
      });

      // A new user joined: wait for them to send an offer to avoid glare
      s.on("rtc-user-joined", async ({ socketId: targetSocketId }) => {
        // Optionally pre-create the connection to be ready for incoming offer
        if (!peersRef.current[targetSocketId]) {
          const pc = createPeerConnection(targetSocketId);
          peersRef.current[targetSocketId].pc = pc;
        }
        // Send our user info so the newcomer gets our display name
        try {
          s.emit("rtc-user-info", { roomId, userName: computedLocalName });
        } catch (e) {
          // ignore
        }
      });

      // Incoming offer
      s.on("rtc-offer", async ({ fromSocketId, description }) => {
        let pc = peersRef.current[fromSocketId]?.pc;
        if (!pc) {
          pc = createPeerConnection(fromSocketId);
          peersRef.current[fromSocketId].pc = pc;
        }
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(description));
          // Remote description set: now ready to accept ICE
          markRemoteReady(fromSocketId);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          s.emit("rtc-answer", { targetSocketId: fromSocketId, description: answer, roomId });
        } catch (err) {
          console.error("Error handling offer:", err);
        }
      });

      // Incoming answer
      s.on("rtc-answer", async ({ fromSocketId, description }) => {
        const pc = peersRef.current[fromSocketId]?.pc;
        if (!pc) return;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(description));
          // Remote description set: now ready to accept ICE
          markRemoteReady(fromSocketId);
        } catch (err) {
          console.error("Error handling answer:", err);
        }
      });

      // Incoming ICE
      s.on("rtc-ice-candidate", async ({ fromSocketId, candidate }) => {
        const pc = peersRef.current[fromSocketId]?.pc;
        if (!pc || !candidate) return;
        const peerState = peersRef.current[fromSocketId];
        const isReady = peerState?.remoteReady;
        if (isReady) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch {
            // ignore
          }
        } else {
          ensureQueue(fromSocketId).push(candidate);
        }
      });

      // Peer info (name) forwarded by server
      s.on("rtc-peer-info", ({ socketId: otherSocketId, userName }) => {
        if (!otherSocketId) return;
        // Update ref and state for UI
        if (!peersRef.current[otherSocketId]) {
          peersRef.current[otherSocketId] = { pc: null, stream: null, remoteReady: false, userName: userName || "User" };
        } else {
          peersRef.current[otherSocketId].userName = userName || "User";
        }
        setPeers((prev) => ({
          ...prev,
          [otherSocketId]: { ...(prev[otherSocketId] || {}), userName: userName || "User" },
        }));
      });

      // Peer left
      s.on("rtc-user-left", ({ socketId }) => {
        const pc = peersRef.current[socketId]?.pc;
        if (pc) {
          try { pc.close(); } catch {}
          delete peersRef.current[socketId];
        }
        setPeers((prev) => {
          const copy = { ...prev };
          delete copy[socketId];
          return copy;
        });
      });

      // Join room
      s.emit("rtc-join-room", { roomId });

      // Share local user info (name) with peers via server
      try {
        s.emit("rtc-user-info", { roomId, userName: computedLocalName });
      } catch (e) {
        // ignore
      }
    };

    init();
    return () => {
      mounted = false;
      // Cleanup
      try {
        socketRef.current?.off("rtc-room-users");
        socketRef.current?.off("rtc-user-joined");
        socketRef.current?.off("rtc-offer");
        socketRef.current?.off("rtc-answer");
        socketRef.current?.off("rtc-ice-candidate");
        socketRef.current?.off("rtc-user-left");
      } catch {}
      Object.values(peersRef.current).forEach((peerData) => {
        try { 
          if (peerData?.pc) {
            peerData.pc.close(); 
          }
        } catch {}
      });
      peersRef.current = {};
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Update peer connections when localStream becomes available
  useEffect(() => {
    if (!localStream) return;
    
    // Add tracks to all existing peer connections
    Object.keys(peersRef.current).forEach((socketId) => {
      const pc = peersRef.current[socketId]?.pc;
      if (pc && !isScreenSharing) {
        // Only update if not screen sharing
        const senders = pc.getSenders();
        const hasTracks = senders.some((sender) => sender.track);
        
        if (!hasTracks) {
          // No tracks yet, add them
          addTracksToPeerConnection(pc, localStream);
        }
      }
    });
  }, [localStream, isScreenSharing]);

  // Update remote video elements when peer streams change
  useEffect(() => {
    Object.entries(peers).forEach(([socketId, peer]) => {
      const videoEl = remoteVideoRefs.current[socketId];
      if (videoEl && peer.stream && videoEl.srcObject !== peer.stream) {
        videoEl.srcObject = peer.stream;
      }
    });
  }, [peers]);

  const toggleMic = () => {
    const currentStream = isScreenSharing && screenStreamRef.current 
      ? screenStreamRef.current 
      : localStream;
    if (!currentStream) return;
    const audioTracks = currentStream.getAudioTracks();
    if (audioTracks.length) {
      const next = !micOn;
      audioTracks.forEach((t) => { t.enabled = next; });
      setMicOn(next);
    }
  };

  const toggleCam = () => {
    if (isScreenSharing) {
      toast.info("Cannot toggle camera while screen sharing");
      return;
    }
    if (!localStream) return;
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length) {
      const next = !camOn;
      videoTracks.forEach((t) => { t.enabled = next; });
      setCamOn(next);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      
      // Switch back to camera stream
      if (localStream) {
        // Update all peer connections with camera stream
        Object.keys(peersRef.current).forEach((socketId) => {
          const pc = peersRef.current[socketId]?.pc;
          if (pc) {
            addTracksToPeerConnection(pc, localStream);
            // Re-negotiate connection
            pc.createOffer().then((offer) => {
              pc.setLocalDescription(offer);
              if (socketRef.current) {
                socketRef.current.emit("rtc-offer", {
                  targetSocketId: socketId,
                  description: offer,
                  roomId,
                });
              }
            }).catch((err) => console.error("Error renegotiating:", err));
          }
        });
        
        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      }
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);
        
        // Update all peer connections with screen stream
        Object.keys(peersRef.current).forEach((socketId) => {
          const pc = peersRef.current[socketId]?.pc;
          if (pc) {
            addTracksToPeerConnection(pc, screenStream);
            // Re-negotiate connection
            pc.createOffer().then((offer) => {
              pc.setLocalDescription(offer);
              if (socketRef.current) {
                socketRef.current.emit("rtc-offer", {
                  targetSocketId: socketId,
                  description: offer,
                  roomId,
                });
              }
            }).catch((err) => console.error("Error renegotiating:", err));
          }
        });
        
        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // Handle screen share end (user clicks stop in browser)
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      } catch (err) {
        console.error("Error starting screen share:", err);
        toast.error("Failed to start screen sharing. Please check permissions.");
      }
    }
  };

  const leaveMeeting = () => {
    try {
      socketRef.current?.emit("rtc-leave-room", { roomId });
    } catch {}
    // Close peers
    Object.values(peersRef.current).forEach((peerData) => {
      try { 
        if (peerData?.pc) {
          peerData.pc.close();
        }
      } catch {}
    });
    peersRef.current = {};
    setPeers({});
    // Stop local media
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    try {
      removeMeetingNotification(roomId);
    } catch (e) {
      // ignore
    }
    navigate("/connections");
  };

  if (!roomId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Invalid meeting ID</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1, p: 1 }}>
        {/* Local Video */}
        <Box sx={{ position: "relative", background: "#000", borderRadius: 2, overflow: "hidden" }}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              left: 10,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            {localUserName} (You)
          </Box>
        </Box>

        {/* Remote Videos */}
        {Object.entries(peers).map(([sid, p]) => (
          <Box
            key={sid}
            sx={{ position: "relative", background: "#000", borderRadius: 2, overflow: "hidden" }}
          >
            <video
              autoPlay
              playsInline
              ref={(el) => {
                if (el) {
                  remoteVideoRefs.current[sid] = el;
                  if (p.stream && el.srcObject !== p.stream) {
                    el.srcObject = p.stream;
                  }
                }
              }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 10,
                left: 10,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              {p.userName || "User"}
            </Box>
          </Box>
        ))}
      </Box>
      <Paper
        elevation={3}
        sx={{
          p: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          borderRadius: 0,
        }}
      >
        <Tooltip title={micOn ? "Mute" : "Unmute"}>
          <IconButton
            onClick={toggleMic}
            sx={{
              backgroundColor: micOn ? "success.main" : "error.main",
              color: "#fff",
              "&:hover": { opacity: 0.9 },
            }}
          >
            {micOn ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={camOn ? "Turn off camera" : "Turn on camera"}>
          <IconButton
            onClick={toggleCam}
            disabled={isScreenSharing}
            sx={{
              backgroundColor: camOn ? "primary.main" : "warning.main",
              color: "#fff",
              "&:hover": { opacity: 0.9 },
              "&:disabled": { opacity: 0.5 },
            }}
          >
            {camOn ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={isScreenSharing ? "Stop sharing screen" : "Share screen"}>
          <IconButton
            onClick={toggleScreenShare}
            sx={{
              backgroundColor: isScreenSharing ? "warning.main" : "info.main",
              color: "#fff",
              "&:hover": { opacity: 0.9 },
            }}
          >
            {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Leave meeting">
          <IconButton
            onClick={leaveMeeting}
            sx={{
              backgroundColor: "error.main",
              color: "#fff",
              "&:hover": { opacity: 0.9 },
              ml: 2,
            }}
          >
            <CallEndIcon />
          </IconButton>
        </Tooltip>
      </Paper>
    </Box>
  );
}


