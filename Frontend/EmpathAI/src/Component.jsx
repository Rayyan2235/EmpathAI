import React, { useState, useEffect } from "react";
import VoiceRoom from './VoiceRoom';
import cat from './assets/Smiling-Cat.jpg';
import { Typewriter } from 'react-simple-typewriter';

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

function Chat() {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-4">Chat with EmpathAI</h2>
            <p className="mb-4">Start a conversation with your AI therapist.</p>
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <p className="text-gray-300">Text chat functionality will be implemented here.</p>
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
                        <li className="mb-4">
                            <button 
                                onClick={() => setShowVoiceRoom(true)} 
                                className="text-left w-full hover:text-gray-300 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg transition-colors duration-200"
                            >
                                🎙️ Voice Room
                            </button>
                        </li>
                        <li className="mb-4"><a href="#" onClick={() => setActiveTab("Settings")} className="hover:text-gray-300">Settings</a></li>
                    </ul>
                </nav>
            </div>

            <div className="flex-1 flex flex-col">
                <header className="p-4 bg-gray-800 flex justify-between items-center">
                    <button 
                        onClick={() => setShowVoiceRoom(true)}
                        className="md:hidden bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        🎙️ Voice Room
                    </button>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden">
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