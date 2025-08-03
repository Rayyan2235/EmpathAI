import React, { useState } from "react";
import VoiceRoom from './VoiceRoom';
import cat from './assets/Smiling-Cat.jpg';
import { Typewriter } from 'react-simple-typewriter';

// --- LiveKit Imports ---
import { Room, RoomEvent } from 'livekit-client';

// --- LiveKit Connection Details ---
// IMPORTANT: Replace with your actual LiveKit URL from your cloud dashboard.
const LIVEKIT_URL = "wss://empathai-s4qc5n7u.livekit.cloud"; 

// This is the virtual room name. It must EXACTLY match the one in your Backend's .env file.
const LIVEKIT_ROOM = "empathai-main-room"; 

// This is the URL of your backend server that generates tokens.
const TOKEN_ENDPOINT = "http://localhost:8000/get-livekit-token";

function TypingEffect() {
    return (
        <div className='App'>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '30px' }}>
                <Typewriter
                    loop
                    cursor
                    cursorStyle="_"
                    typeSpeed={70}
                    deleteSpeed={50}
                    delaySpeed={1000}
                    words={['Hello...', 'How are you feeling today?', "I'm here for you..."]}
                />
            </span>
        </div>
    );
}

/**
 * This component handles the entire LiveKit voice connection lifecycle.
 */
function LiveKitVoice() {
    const [connectionStatus, setConnectionStatus] = useState("Disconnected");
    const [room, setRoom] = useState(null);

    useEffect(() => {
        // This function will run when the component mounts (e.g., when you click the "Chat" tab)
        const connectToLiveKit = async () => {
            setConnectionStatus("Connecting...");
            try {
                // 1. Create a unique identity for the current user
                const identity = "user-" + Math.random().toString(16).slice(2);

                // 2. Fetch an access token from our backend server
                const response = await fetch(`${TOKEN_ENDPOINT}?identity=${identity}&room=${LIVEKIT_ROOM}`);
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || "Failed to fetch token");
                }
                const data = await response.json();
                const token = data.token;

                // 3. Create a new Room instance and set up event listeners
                const newRoom = new Room();

                // Handle incoming audio tracks from other participants (like our AI agent)
                newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                    if (track.kind === "audio") {
                        // Attach the audio track to an <audio> element and play it
                        const audioElement = track.attach();
                        document.body.appendChild(audioElement);
                    }
                });
                
                // 4. Connect to the room using the URL and token
                await newRoom.connect(LIVEKIT_URL, token);
                setConnectionStatus(`Connected to room: ${LIVEKIT_ROOM}`);
                
                // 5. Enable the user's microphone and publish it to the room
                await newRoom.localParticipant.setMicrophoneEnabled(true);
                setRoom(newRoom);

            } catch (error) {
                console.error("LiveKit connection failed:", error);
                setConnectionStatus(`Failed: ${error.message}`);
            }
        };

        connectToLiveKit();

        // This is a cleanup function that runs when the component is unmounted
        return () => {
            if (room) {
                console.log("Disconnecting from LiveKit room.");
                room.disconnect();
            }
        };
    }, []); // The empty array [] means this effect runs only once when the component mounts

    return <div className="connection-status">Voice Status: {connectionStatus}</div>;
}

function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });
            const data = await response.json();
            setMessages([...newMessages, { sender: "ai", text: data.response }]);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            setMessages([...newMessages, { sender: "ai", text: "Sorry, I'm having trouble connecting." }]);
        }
    };

    return (
        <div className="chat-container">
            {/* The LiveKitVoice component is added here to manage the voice connection */}
            <LiveKitVoice />
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="input-area">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

function Component() {
    const [activeTab, setActiveTab] = useState("Home");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showVoiceRoom, setShowVoiceRoom] = useState(false);

    if (showVoiceRoom) {
        return <VoiceRoom onBack={() => setShowVoiceRoom(false)} />;
    }

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-64 bg-gray-800 p-4`}>
                <h1 className="text-2xl font-bold mb-8">EmpathAI</h1>
                <nav>
                    <ul>
                        <li className="mb-4"><a href="#" onClick={() => setActiveTab("Home")} className="hover:text-gray-300">Home</a></li>
                        <li className="mb-4"><a href="#" onClick={() => setActiveTab("Chat")} className="hover:text-gray-300">Chat</a></li>
                        <li className="mb-4"><a href="#" onClick={() => setActiveTab("Settings")} className="hover:text-gray-300">Settings</a></li>
                    </ul>
                </nav>
            </div>

            <div className="flex-1 flex flex-col">
                <header className="p-4 bg-gray-800 md:hidden">
                <button
                    onClick={() => setShowVoiceRoom(true)}
                >
            Voice Settings / Mic Controls
        </button>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    </button>
                </header>
                <main className="flex-1 p-8">
                    {activeTab === "Home" && (
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Welcome to EmpathAI</h2>
                            <p>Your personal AI companion for emotional support and guidance.</p>
                            <TypingEffect />
                            <img src={cat} alt="cat" />
                        </div>
                    )}
                    {/* The Chat component will only be rendered (and thus connect to voice) when the Chat tab is active */}
                    {activeTab === "Chat" && <Chat />}
                    {activeTab === "Settings" && (
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Settings</h2>
                            <p>Here you can configure your preferences.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
export default Component;