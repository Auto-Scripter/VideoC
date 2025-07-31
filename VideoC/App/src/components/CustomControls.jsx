// src/components/CustomControls.js

import React, { useState, useEffect } from 'react';
import { 
    Mic, 
    MicOff, 
    Video, 
    VideoOff, 
    PhoneOff, 
    MonitorUp, 
    Hand, 
    Radio // "Go Live" button ke liye icon
} from 'lucide-react';

// Naya modal import karein
import StreamKeyModal from './StreamKeyModal'; 

// ControlButton component (Ise aise hi rehne dein)
const ControlButton = ({ onClick, children, className = '' }) => (
    <button
        onClick={onClick}
        className={`p-3 rounded-full transition-colors duration-200 ${className}`}
    >
        {children}
    </button>
);


const CustomControls = ({ jitsiApi, onHangup }) => {
    // Pehle se maujood state
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    
    // --- NAYA CODE START ---
    // Modal ko dikhane/chhipane ke liye state
    const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
    // Meeting live hai ya nahi, iska status track karne ke liye state
    const [isStreaming, setIsStreaming] = useState(false);
    // --- NAYA CODE END ---

    useEffect(() => {
        if (!jitsiApi) {
            return;
        }

        // Mute status ke liye listeners (jaisa pehle tha)
        jitsiApi.isAudioMuted().then(muted => setIsAudioMuted(muted));
        jitsiApi.isVideoMuted().then(muted => setIsVideoMuted(muted));
        const handleAudioMute = ({ muted }) => setIsAudioMuted(muted);
        const handleVideoMute = ({ muted }) => setIsVideoMuted(muted);
        jitsiApi.addEventListener('audioMuteStatusChanged', handleAudioMute);
        jitsiApi.addEventListener('videoMuteStatusChanged', handleVideoMute);

        // --- NAYA CODE START ---
        // Live streaming ka status Jitsi se pata karne ke liye listener
        const handleStreamingStatus = ({ on }) => {
            console.log('Streaming status changed:', on);
            setIsStreaming(on);
        };
        jitsiApi.addEventListener('streamStatusChanged', handleStreamingStatus);
        // --- NAYA CODE END ---

        // Cleanup function
        return () => {
            jitsiApi.removeEventListener('audioMuteStatusChanged', handleAudioMute);
            jitsiApi.removeEventListener('videoMuteStatusChanged', handleVideoMute);
            // --- NAYA CODE START ---
            jitsiApi.removeEventListener('streamStatusChanged', handleStreamingStatus);
            // --- NAYA CODE END ---
        };
    }, [jitsiApi]);

    // Control command functions (jaisa pehle tha)
    const toggleAudio = () => jitsiApi?.executeCommand('toggleAudio');
    const toggleVideo = () => jitsiApi?.executeCommand('toggleVideo');
    const toggleScreenShare = () => jitsiApi?.executeCommand('toggleShareScreen');
    const raiseHand = () => jitsiApi?.executeCommand('toggleRaiseHand');

    // --- NAYA CODE START ---
    // Live stream shuru karne ke liye function
    const handleStartStream = (streamKey) => {
        if (!jitsiApi) return;
        jitsiApi.executeCommand('startRecording', {
            mode: 'stream',
            youtubeStreamKey: streamKey, // Jitsi API ise 'youtubeStreamKey' kehta hai
        });
        setIsStreamModalOpen(false); // Command bhej kar modal band kar dein
    };

    // Live stream rokne ke liye function
    const handleStopStream = () => {
        if (!jitsiApi) return;
        // Stream ko rokne ke liye 'startRecording' command ko 'stop' parameter ke saath use kiya ja sakta hai
        // lekin iske liye session ID ki zaroorat hoti hai.
        // Jibri ke default setup mein, aksar stream rokne ke liye meeting host ko Jibri UI se manage karna padta hai.
        // فی الحال, hum console par ek message log kar rahe hain.
        console.log("Stopping stream functionality depends on Jibri configuration.");
        // Agar aapke Jibri setup mein toggle ki suvidha hai, toh aap yahan stop command bhej sakte hain.
    };
    // --- NAYA CODE END ---

    return (
        <>
            {/* --- NAYA CODE START --- */}
            {/* Stream key modal ko yahan conditionally render karein */}
            {isStreamModalOpen && (
                <StreamKeyModal 
                    onStart={handleStartStream}
                    onClose={() => setIsStreamModalOpen(false)}
                    isLoading={false} // Aap yahan loading state bhi manage kar sakte hain
                />
            )}
            {/* --- NAYA CODE END --- */}
            
            <div className="absolute bottom-0 left-0 w-full z-10 bg-slate-800/80 backdrop-blur-md p-4 flex justify-center items-center gap-4 border-t border-slate-700">
                
                {/* Mic Button */}
                <ControlButton 
                    onClick={toggleAudio} 
                    className={isAudioMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}
                >
                    {isAudioMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </ControlButton>

                {/* Video Button */}
                <ControlButton 
                    onClick={toggleVideo} 
                    className={isVideoMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}
                >
                    {isVideoMuted ? <VideoOff size={24} /> : <Video size={24} />}
                </ControlButton>
                
                {/* --- NAYA CODE START --- */}
                {/* Go Live Button */}
                <ControlButton 
                    onClick={() => isStreaming ? handleStopStream() : setIsStreamModalOpen(true)}
                    className={isStreaming 
                        ? 'bg-green-600 text-white shadow-[0_0_10px_rgba(34,197,94,0.7)]' // Jab live ho toh green
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }
                    title={isStreaming ? "Live Streaming is ON" : "Go Live"}
                >
                    <Radio size={24} />
                </ControlButton>
                {/* --- NAYA CODE END --- */}
                
                {/* Screen Share Button */}
                <ControlButton onClick={toggleScreenShare} className="bg-slate-700 text-white hover:bg-slate-600">
                    <MonitorUp size={24} />
                </ControlButton>

                {/* Raise Hand Button */}
                <ControlButton onClick={raiseHand} className="bg-slate-700 text-white hover:bg-slate-600">
                    <Hand size={24} />
                </ControlButton>

                {/* Hang Up Button */}
                <ControlButton onClick={onHangup} className="bg-red-600 text-white hover:bg-red-500">
                    <PhoneOff size={24} />
                </ControlButton>
                
            </div>
        </>
    );
};

export default CustomControls;