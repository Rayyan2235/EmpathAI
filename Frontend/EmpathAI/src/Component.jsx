import React, { useState, useRef } from "react";
import cat from './assets/Smiling-Cat.jpg'
import { Typewriter } from 'react-simple-typewriter';

function TypingEffect(){
    return(
         <div
        className="typewriter-container center hover "
        style={{
            /* KEPT: Font family and size from your original */
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '1.5rem',
            /* KEPT: Letter spacing from your original */
            letterSpacing: '1.5px',
            /* KEPT: Your color choice */
            color: 'pink',       
        }}
    >
        <Typewriter className="typewriter-container"
            words={["Welcome to EmpathAI", "Your own trusted AI Therapist", "Be at ease and don't hesitate to be yourself"]}
            loop={true}
            cursor
            cursorStyle='_'
            typeSpeed={60}
            deleteSpeed={40}
            delaySpeed={2000}
        />
    </div>
    )
}

function Component(){
    const [activeTab, setActiveTab] = useState('home');
    const [input, setInput] = useState("");
    const [chat, setChat] = useState([]); // [{sender: 'user'|'therapist', text: string, sentiment?: string}]
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);
    const [listening, setListening] = useState(false);

    // Microphone (Web Speech API)
    const handleMicClick = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser.');
            return;
        }
        let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(prev => prev + (prev ? ' ' : '') + transcript);
            };
            recognitionRef.current.onend = () => setListening(false);
            recognitionRef.current.onerror = () => setListening(false);
        }
        setListening(true);
        recognitionRef.current.start();
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setError(null);
        setChat(prev => [...prev, { sender: 'user', text: input }]);
        try {
            const res = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });
            if (!res.ok) throw new Error('Server error');
            const data = await res.json();
            setChat(prev => [...prev, { sender: 'therapist', text: data.response, sentiment: data.sentiment }]);
        } catch (err) {
            setError('Failed to get response from server.');
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    return(
        <>
        {activeTab === 'home' && (
            <div className="content-container">
                <h1>This is EmpathAI</h1>
            
                <TypingEffect></TypingEffect>
                 {/* ADDED: 'hover' class for hover effects */}
                {/* IMPROVED: Better alt text for accessibility */}
                <img className='container hover' src={cat} alt="Smiling Cat" />

                
               {/* REMOVED: All inline styles from button */}
               {/* OLD: style={{color:'purple', backgroundColor:'pink', border:'3px solidrgb(162,0,255)', padding:'10px', margin:'10px', borderRadius:'10px', fontSize:'1.8rem'}} */
                /* These styles are now in the CSS file to avoid conflicts */}
                <button 
                    className="hover container" 
                    onClick={() => setActiveTab('chat')}
                >
                    Let's get talking
                </button> 
            </div>
        )}
        {activeTab ==='chat' && (
            <div className="content-container" style={{maxWidth: 600, width: '100%'}}>
                <h1>This is the chat tab</h1>
                <div style={{
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: 12,
                    padding: 16,
                    minHeight: 300,
                    maxHeight: 350,
                    overflowY: 'auto',
                    width: '100%',
                    marginBottom: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                }}>
                    {chat.length === 0 && <div style={{color:'#aaa'}}>No messages yet. Start the conversation!</div>}
                    {chat.map((msg, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: 10
                        }}>
                            <div style={{
                                background: msg.sender === 'user' ? '#521bdf' : '#fff',
                                color: msg.sender === 'user' ? '#fff' : '#521bdf',
                                padding: '8px 14px',
                                borderRadius: 16,
                                maxWidth: '80%',
                                wordBreak: 'break-word',
                                boxShadow: msg.sender === 'user' ? '0 2px 8px rgba(82,27,223,0.08)' : '0 2px 8px rgba(0,0,0,0.08)'
                            }}>
                                {msg.text}
                                {msg.sender === 'therapist' && msg.sentiment && (
                                    <div style={{ fontSize: '0.8em', color: '#a0a', marginTop: 4 }}>Sentiment: {msg.sentiment}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type your message..."
                        style={{ flex: 1, padding: '0.5em', fontSize: '1em', borderRadius: '8px', border: '1px solid #ccc' }}
                        onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                        disabled={loading}
                    />
                    <button onClick={handleSend} style={{ marginLeft: '10px' }} disabled={loading || !input.trim()}>
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                    <button
                        onClick={handleMicClick}
                        style={{ marginLeft: 8, background: listening ? '#ffb347' : '#eee', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title={listening ? 'Listening...' : 'Speak'}
                        disabled={loading}
                    >
                        <span role="img" aria-label="microphone" style={{ fontSize: 22 }}>
                            {listening ? '🎤' : '🎙️'}
                        </span>
                    </button>
                </div>
                {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
            </div>
        )}
        </>
    )
}
export default Component;