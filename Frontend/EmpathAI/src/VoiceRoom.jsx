import React, { useState, useEffect, useRef } from "react";
import { Room, RoomEvent, Participant, Track } from "livekit-client";

const LIVEKIT_URL = "wss://empathai-s4qc5n7u.livekit.cloud";
const LIVEKIT_ROOM = "empathai-main-room";
const TOKEN_ENDPOINT = "http://localhost:8000/get-livekit-token";

function VoiceRoom({ onBack }) {
  const [room, setRoom] = useState(null);
  const [connected, setConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [status, setStatus] = useState("Disconnected");
  const roomRef = useRef(null);

  // Helper to update participant list
  const updateParticipants = (room) => {
    setParticipants([
      ...Array.from(room.participants.values()),
      room.localParticipant,
    ]);
  };

  // Join the room
  const joinRoom = async () => {
    setStatus("Connecting...");
    try {
      // 1. Generate a unique identity for the user
      const identity = "user-" + Math.random().toString(16).slice(2);
      console.log("Requesting token for identity:", identity);

      // 2. Fetch token from backend with better error handling
      const res = await fetch(
        `${TOKEN_ENDPOINT}?identity=${identity}&room=${LIVEKIT_ROOM}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("Token response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Token fetch error:", errorText);
        throw new Error(`HTTP ${res.status}: ${errorText || 'Failed to fetch token'}`);
      }

      const data = await res.json();
      console.log("Token response data:", data);
      console.log("Type of data:", typeof data);
      console.log("Data keys:", Object.keys(data));
      console.log("data.token:", data.token);
      console.log("data.error:", data.error);

      if (!data.token) {
        console.error("No token found in response. Full response:", data);
        throw new Error("No token received from server");
      }

      const token = data.token;

      // 3. Create and configure the LiveKit room
      const newRoom = new Room();
      roomRef.current = newRoom;

      // Set up event listeners
      newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log("Participant connected:", participant.identity);
        updateParticipants(newRoom);
      });

      newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log("Participant disconnected:", participant.identity);
        updateParticipants(newRoom);
      });

      newRoom.on(RoomEvent.TrackMuted, () => updateParticipants(newRoom));
      newRoom.on(RoomEvent.TrackUnmuted, () => updateParticipants(newRoom));

      newRoom.on(RoomEvent.TrackSubscribed, (track, pub, participant) => {
        console.log("Track subscribed:", track.kind, "from", participant.identity);
        if (track.kind === "audio") {
          const audioEl = track.attach();
          audioEl.autoplay = true;
          document.body.appendChild(audioEl);
        }
      });

      // 4. Connect to the LiveKit room
      console.log("Connecting to room:", LIVEKIT_ROOM);
      await newRoom.connect(LIVEKIT_URL, token);

      // 5. Enable microphone
      await newRoom.localParticipant.setMicrophoneEnabled(true);
      setMicEnabled(true);

      // 6. Update state
      setRoom(newRoom);
      setConnected(true);
      setStatus("Connected");
      updateParticipants(newRoom);

      console.log("Successfully connected to LiveKit room!");

    } catch (err) {
      console.error("Failed to join room:", err);
      setStatus("Failed: " + err.message);
      setConnected(false);
    }
  };

  // Leave the room
  const leaveRoom = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      setRoom(null);
      setConnected(false);
      setParticipants([]);
      setStatus("Disconnected");
    }
  };

  // Toggle mic
  const toggleMic = async () => {
    if (roomRef.current) {
      const enabled = !micEnabled;
      await roomRef.current.localParticipant.setMicrophoneEnabled(enabled);
      setMicEnabled(enabled);
      updateParticipants(roomRef.current);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div style={{ background: "#181c2f", color: "#fff", borderRadius: 12, padding: 24, maxWidth: 500, margin: "40px auto" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <button 
          onClick={onBack}
          style={{ 
            background: "transparent", 
            border: "1px solid #6c47ff", 
            color: "#6c47ff", 
            padding: "6px 12px", 
            borderRadius: 6, 
            marginRight: 12,
            cursor: "pointer"
          }}
        >
          ← Back
        </button>
        <h2 style={{ fontSize: 24, margin: 0 }}>🎙️ Live Voice Room</h2>
      </div>
      
      <div style={{ marginBottom: 16, padding: 12, background: "#2a2f4a", borderRadius: 8 }}>
        <div style={{ marginBottom: 8 }}>Status: <b style={{ color: connected ? "#4ade80" : "#f87171" }}>{status}</b></div>
        <div style={{ fontSize: 14, color: "#9ca3af" }}>
          {connected ? "You're connected to the therapy room" : "Click 'Join Room' to start your session"}
        </div>
      </div>
      
      <div style={{ marginBottom: 20 }}>
        {!connected ? (
          <button 
            onClick={joinRoom} 
            style={{ 
              padding: "12px 24px", 
              borderRadius: 8, 
              background: "#6c47ff", 
              color: "#fff", 
              border: "none", 
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              width: "100%"
            }}
          >
            Join Room
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button 
              onClick={leaveRoom} 
              style={{ 
                padding: "8px 20px", 
                borderRadius: 8, 
                background: "#ff4747", 
                color: "#fff", 
                border: "none", 
                fontWeight: 600,
                cursor: "pointer",
                flex: 1
              }}
            >
              Leave Room
            </button>
            <button 
              onClick={toggleMic} 
              style={{ 
                padding: "8px 20px", 
                borderRadius: 8, 
                background: micEnabled ? "#6c47ff" : "#6b7280", 
                color: "#fff", 
                border: "none", 
                fontWeight: 600,
                cursor: "pointer",
                flex: 1
              }}
            >
              {micEnabled ? "🎤 Mute" : "🔇 Unmute"}
            </button>
          </div>
        )}
      </div>
      
      <div style={{ background: "#2a2f4a", borderRadius: 8, padding: 16 }}>
        <h3 style={{ fontSize: 18, marginBottom: 12, margin: "0 0 12px 0" }}>Participants ({participants.length})</h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {participants.length === 0 ? (
            <li style={{ color: "#9ca3af", fontStyle: "italic" }}>No participants yet</li>
          ) : (
            participants.map((p) => (
              <li key={p.identity} style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{p.identity} {p.isLocal ? "(You)" : ""}</span>
                <span>{p.isMicrophoneEnabled ? "🎤" : "🔇"}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default VoiceRoom;