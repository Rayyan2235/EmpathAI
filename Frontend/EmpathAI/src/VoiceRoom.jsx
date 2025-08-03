import React, { useState, useEffect, useRef } from "react";
import { Room, RoomEvent, Participant, Track } from "livekit-client";

const LIVEKIT_URL = "wss://empathai-s4qc5n7u.livekit.cloud";
const LIVEKIT_ROOM = "empathai-main-room";
const TOKEN_ENDPOINT = "http://localhost:8000/get-livekit-token";

function VoiceRoom() {
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
      const identity = "user-" + Math.random().toString(16).slice(2);
      const res = await fetch(
        `${TOKEN_ENDPOINT}?identity=${identity}&room=${LIVEKIT_ROOM}`
      );
      const data = await res.json();
      const token = data.token;
      const newRoom = new Room();
      roomRef.current = newRoom;
      // Listen for participant events
      newRoom.on(RoomEvent.ParticipantConnected, () => updateParticipants(newRoom));
      newRoom.on(RoomEvent.ParticipantDisconnected, () => updateParticipants(newRoom));
      newRoom.on(RoomEvent.TrackMuted, () => updateParticipants(newRoom));
      newRoom.on(RoomEvent.TrackUnmuted, () => updateParticipants(newRoom));
      newRoom.on(RoomEvent.TrackSubscribed, (track, pub, participant) => {
        if (track.kind === "audio") {
          const audioEl = track.attach();
          document.body.appendChild(audioEl);
        }
      });
      await newRoom.connect(LIVEKIT_URL, token);
      await newRoom.localParticipant.setMicrophoneEnabled(true);
      setMicEnabled(true);
      setRoom(newRoom);
      setConnected(true);
      setStatus("Connected");
      updateParticipants(newRoom);
    } catch (err) {
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
    <div style={{ background: "#181c2f", color: "#fff", borderRadius: 12, padding: 24, maxWidth: 400, margin: "40px auto" }}>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>Live Voice Room</h2>
      <div style={{ marginBottom: 12 }}>Status: <b>{status}</b></div>
      {!connected ? (
        <button onClick={joinRoom} style={{ padding: "8px 20px", borderRadius: 8, background: "#6c47ff", color: "#fff", border: "none", fontWeight: 600 }}>Join Room</button>
      ) : (
        <>
          <button onClick={leaveRoom} style={{ padding: "8px 20px", borderRadius: 8, background: "#ff4747", color: "#fff", border: "none", fontWeight: 600, marginRight: 8 }}>Leave Room</button>
          <button onClick={toggleMic} style={{ padding: "8px 20px", borderRadius: 8, background: micEnabled ? "#6c47ff" : "#aaa", color: "#fff", border: "none", fontWeight: 600 }}>
            {micEnabled ? "Mute Mic" : "Unmute Mic"}
          </button>
        </>
      )}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>Participants</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {participants.map((p) => (
            <li key={p.identity} style={{ marginBottom: 6 }}>
              {p.identity} {p.isLocal ? "(You)" : ""} {p.isMicrophoneEnabled ? "🎤" : "🔇"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default VoiceRoom; 