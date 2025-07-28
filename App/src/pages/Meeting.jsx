import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Video, MicOff, Rss, Radio, ChevronDown, Users, Clock,
    PlayCircle, StopCircle, Settings, Menu, X, Link, Mail, Share2, 
    VideoIcon, Clock4, Calendar, Copy, Check, LogOut
} from 'lucide-react';

import Sidebar from "../components/Sidebar";
import Toast from "../components/Toast";
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


// --- Animated Background Component ---
const AnimatedBackground = () => {
    const numLines = 25;
    const lines = Array.from({ length: numLines });

    const lineVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: (i) => ({
            pathLength: 1,
            opacity: 0.7,
            transition: {
                pathLength: { delay: i * 0.1, type: "spring", duration: 2, bounce: 0 },
                opacity: { delay: i * 0.1, duration: 0.1 },
            }
        })
    };
    
    return (
        <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
            <svg width="100%" height="100%" className="absolute top-0 left-0" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                        <stop offset="100%" stopColor="rgba(139, 92, 246, 0.2)" />
                    </linearGradient>
                </defs>
                {lines.map((_, i) => (
                    <React.Fragment key={i}>
                        <motion.line x1="-5%" y1={`${(i / (numLines - 1)) * 100}%`} x2="105%" y2={`${(i / (numLines - 1)) * 100}%`} stroke="url(#line-gradient)" strokeWidth="0.3" variants={lineVariants} initial="hidden" animate="visible" custom={i} />
                        <motion.line x1={`${(i / (numLines - 1)) * 100}%`} y1="-5%" x2={`${(i / (numLines - 1)) * 100}%`} y2="105%" stroke="url(#line-gradient)" strokeWidth="0.3" variants={lineVariants} initial="hidden" animate="visible" custom={i + 5} />
                    </React.Fragment>
                ))}
            </svg>
            <motion.div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-600/40 to-purple-600/40 rounded-full filter blur-3xl opacity-40" animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 1, 1.05, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 30, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }} />
            <motion.div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-gradient-to-tl from-purple-600/30 to-blue-600/30 rounded-full filter blur-3xl opacity-40" animate={{ x: [0, -30, 10, 0], y: [0, 20, -40, 0], scale: [1, 1.05, 1, 0.95, 1], rotate: [0, -15, 15, 0] }} transition={{ duration: 35, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 5 }} />
        </div>
    );
};

// --- Toggle Switch Component ---
const ToggleSwitch = ({ label, enabled, setEnabled, icon: Icon }) => (
    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
        <div className="flex items-center gap-3">
            <Icon className="text-slate-400" size={18} />
            <span className="text-slate-300 text-sm font-medium">{label}</span>
        </div>
        <button 
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 ${enabled ? 'bg-blue-500' : 'bg-slate-600'}`}
        >
            <motion.span
                animate={{ x: enabled ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="inline-block h-5 w-5 transform rounded-full bg-white"
            />
        </button>
    </div>
);

// --- Share Modal Component ---
const ShareModal = ({ meetingLink, onClose }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        // Use a temporary textarea to copy to clipboard for better compatibility
        const textArea = document.createElement("textarea");
        textArea.value = meetingLink;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
        document.body.removeChild(textArea);
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-slate-800/80 backdrop-blur-lg border border-slate-700 p-6 rounded-2xl shadow-xl w-full max-w-md text-center"
                initial={{ scale: 0.9, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
            >
                <div className="flex justify-end">
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <Share2 className="mx-auto text-blue-400 mb-3" size={40} />
                <h2 className="text-2xl font-bold text-white mb-2">Meeting Ready!</h2>
                <p className="text-slate-400 mb-6">Share this link with your invitees.</p>
                
                <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-lg p-2 mb-4">
                    <input 
                        type="text" 
                        readOnly 
                        value={meetingLink}
                        className="flex-grow bg-transparent text-slate-300 text-sm outline-none px-2"
                    />
                    <button 
                        onClick={handleCopy}
                        className={`flex items-center justify-center gap-2 w-28 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${isCopied ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                        {isCopied ? <><Check size={16}/> Copied!</> : <><Copy size={16}/> Copy</>}
                    </button>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <a 
                        href={`mailto:?subject=Invitation to join meeting&body=Join my meeting with this link: ${meetingLink}`}
                        className="flex items-center gap-2 text-sm text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-colors px-4 py-2 rounded-lg"
                    >
                        <Mail size={18} />
                        <span>Email</span>
                    </a>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Create Meeting Component ---
const CreateMeeting = ({ onSubmit, isLoading }) => {
    const [meetingName, setMeetingName] = useState('');
    const [invitees, setInvitees] = useState('');
    const [scheduleOption, setScheduleOption] = useState('now');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [enableWaitingRoom, setEnableWaitingRoom] = useState(true);
    const [muteOnEntry, setMuteOnEntry] = useState(false);
    const [allowJoinAnytime, setAllowJoinAnytime] = useState(false);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        let scheduledFor = null;
        if (scheduleOption === 'later' && scheduledDate && scheduledTime) {
            scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
        }

        const meetingData = {
            name: meetingName || 'Instant Meeting',
            invitees: invitees.split(',').map(email => email.trim()).filter(email => email),
            isScheduled: scheduleOption === 'later',
            scheduledFor,
            options: {
                enableWaitingRoom,
                muteOnEntry,
                allowJoinAnytime,
            },
        };
        onSubmit(meetingData, scheduleOption);
    };

    return (
        <motion.form 
            onSubmit={handleFormSubmit}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 1 },
                visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
            }}
            className="p-4 sm:p-8 bg-slate-800/50 rounded-2xl border border-slate-700/50 h-full flex flex-col"
        >
            <motion.h2 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-2xl sm:text-3xl font-bold text-white">Create a New Meeting</motion.h2>
            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-slate-400 mt-2 mb-6 sm:mb-8">Instantly start or schedule meetings for a future date.</motion.p>
            
            <div className="flex-grow flex flex-col space-y-6">
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">1. Meeting Details</h3>
                        <div className="relative">
                            <VideoIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Meeting Name (e.g. Project Alpha Kick-off)" value={meetingName} onChange={(e) => setMeetingName(e.target.value)} className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="email" placeholder="Invite with email (comma separated)" value={invitees} onChange={(e) => setInvitees(e.target.value)} className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </motion.div>

                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">2. Meeting Options</h3>
                        <div className="space-y-3">
                            <ToggleSwitch label="Enable waiting room" enabled={enableWaitingRoom} setEnabled={setEnableWaitingRoom} icon={Users} />
                            <ToggleSwitch label="Mute on entry" enabled={muteOnEntry} setEnabled={setMuteOnEntry} icon={MicOff} />
                            <ToggleSwitch label="Join anytime" enabled={allowJoinAnytime} setEnabled={setAllowJoinAnytime} icon={Clock} />
                        </div>
                    </motion.div>
                </div>
                
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">3. Schedule</h3>
                    <div className="flex bg-slate-700/50 border-2 border-slate-600 rounded-lg p-1">
                        <button type="button" onClick={() => setScheduleOption('now')} className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${scheduleOption === 'now' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-600/50'}`}>Create Now</button>
                        <button type="button" onClick={() => setScheduleOption('later')} className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${scheduleOption === 'later' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-600/50'}`}>Schedule for Later</button>
                    </div>
                    <AnimatePresence>
                        {scheduleOption === 'later' && (
                            <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }} exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div className="relative">
                                        <Clock4 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
            
            <div className="mt-8">
                <motion.button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white transition-all hover:from-blue-500 hover:to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
                    whileTap={{ scale: 0.98 }}
                >
                    {isLoading ? 'Creating...' : (scheduleOption === 'now' ? 'Create & Start Meeting' : 'Schedule Meeting')}
                </motion.button>
            </div>
        </motion.form>
    );
};

// --- Jitsi Meeting Component ---
const JitsiMeeting = ({ roomName, displayName, meetingOptions, onMeetingEnd }) => {
    const jitsiContainerRef = useRef(null);
    const [jitsiApi, setJitsiApi] = useState(null);

    useEffect(() => {
        // Dynamically load the Jitsi External API script
        const script = document.createElement('script');
        script.src = 'https://connect.genriva.com/external_api.js';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            if (!window.JitsiMeetExternalAPI) {
                console.error("Jitsi API not loaded");
                return;
            }

            const domain = 'connect.genriva.com';
            const options = {
                roomName: roomName,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: displayName
                },
                configOverwrite: {
                    startWithAudioMuted: meetingOptions.muteOnEntry,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: meetingOptions.enableWaitingRoom,
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    // --- CHANGE: Toolbar buttons are customized here ---
                    TOOLBAR_BUTTONS: [
                        'fullscreen', 'hangup'
                    ],
                },
            };

            const api = new window.JitsiMeetExternalAPI(domain, options);
            setJitsiApi(api);

            // Add event listener for when the meeting is ended (user hangs up)
            api.addEventListener('videoConferenceLeft', () => {
                onMeetingEnd();
            });
        };

        return () => {
            // Cleanup: remove the script and dispose of the Jitsi API instance
            if (jitsiApi) {
                jitsiApi.dispose();
            }
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, [roomName]); // Re-initialize if roomName changes

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden"
        >
            <div ref={jitsiContainerRef} className="w-full flex-grow" />
        </motion.div>
    );
};


// --- MEETING PAGE ---
const MeetingPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeToast, setActiveToast] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [newMeetingLink, setNewMeetingLink] = useState('');
    
    // State for managing the active meeting view
    const [activeMeeting, setActiveMeeting] = useState(null); // e.g., { id, name, options }

    // --- State for streaming and recording (placeholders) ---
    const [isStreaming, setIsStreaming] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const showToast = (toastData) => {
        setActiveToast({ id: Date.now(), ...toastData });
    };

    const handleCreateMeeting = async (meetingData, scheduleOption) => {
        setIsLoading(true);
        const user = auth.currentUser;

        if (!user) {
            showToast({ title: 'Authentication Error', message: 'You must be logged in to create a meeting.', type: 'error' });
            setIsLoading(false);
            return;
        }

        try {
            const meetingPayload = {
                ...meetingData,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'meetings'), meetingPayload);
            
            const link = `${window.location.origin}/meeting/${docRef.id}`;
            setNewMeetingLink(link);
            
            showToast({ title: 'Success!', message: `Meeting ${scheduleOption === 'now' ? 'created' : 'scheduled'}!`, type: 'success' });

            if (scheduleOption === 'now') {
                // If "Create Now", immediately start the meeting
                setActiveMeeting({
                    id: docRef.id,
                    name: meetingData.name,
                    options: meetingData.options
                });
            } else {
                // If "Schedule for Later", just show the share modal
                setIsShareModalOpen(true);
            }

        } catch (error) {
            console.error("Error creating meeting: ", error);
            showToast({ title: 'Error', message: 'Failed to create meeting. Please try again.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEndMeeting = () => {
        showToast({ title: 'Meeting Ended', message: 'You have left the meeting.', type: 'info' });
        setActiveMeeting(null);
    };

    return (
        <div className="flex h-screen relative z-10">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <div className="fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-5 w-full max-w-sm px-4 sm:px-0 z-[60]">
                <AnimatePresence>
                    {activeToast && (
                        <Toast
                            key={activeToast.id}
                            toast={activeToast}
                            onClose={() => setActiveToast(null)}
                        />
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isShareModalOpen && (
                    <ShareModal 
                        meetingLink={newMeetingLink} 
                        onClose={() => setIsShareModalOpen(false)} 
                    />
                )}
            </AnimatePresence>
            
            <div className="flex-1 flex flex-col h-screen">
                <header className="flex-shrink-0 bg-slate-900/50 backdrop-blur-lg border-b border-slate-700/50">
                    <div className="flex items-center justify-between h-20 px-4 sm:px-8">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-full hover:bg-slate-700/50">
                                <Menu size={24} />
                            </button>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-white">
                                    {activeMeeting ? activeMeeting.name : 'Meetings'}
                                </h1>
                                <p className="text-slate-400 text-sm hidden sm:block">
                                    {activeMeeting ? 'You are in a meeting' : 'Control your live meeting settings'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            {activeMeeting && (
                                <motion.button 
                                    onClick={handleEndMeeting}
                                    className="flex items-center gap-2 py-2 px-4 rounded-lg bg-red-600 font-semibold text-white transition-all hover:bg-red-500"
                                    whileTap={{scale: 0.95}}
                                >
                                    <LogOut size={18} />
                                    <span className="hidden sm:inline">Leave Meeting</span>
                                </motion.button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto">
                    <div className="lg:col-span-2 h-full">
                        <AnimatePresence mode="wait">
                            {activeMeeting ? (
                                <JitsiMeeting
                                    key={activeMeeting.id}
                                    roomName={activeMeeting.id}
                                    displayName={auth.currentUser?.displayName || 'Guest'}
                                    meetingOptions={activeMeeting.options}
                                    onMeetingEnd={handleEndMeeting}
                                />
                            ) : (
                                <motion.div 
                                    key="create-form"
                                    initial={{opacity: 0, x: -20}} 
                                    animate={{opacity: 1, x: 0}} 
                                    exit={{opacity: 0, x: 20}}
                                    transition={{duration: 0.3}}
                                    className="h-full"
                                >
                                    <CreateMeeting onSubmit={handleCreateMeeting} isLoading={isLoading} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.div 
                        initial={{opacity: 0, x: 20}} 
                        animate={{opacity: 1, x: 0}} 
                        transition={{duration: 0.5, delay: 0.2}} 
                        className="flex flex-col justify-around p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50"
                    >
                        <section>
                            <h3 className="flex items-center gap-3 text-xl font-semibold text-white mb-4"><Rss className="text-blue-400" /> Live Streaming</h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <select className="w-full appearance-none bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>Facebook Live</option>
                                        <option>YouTube Live</option>
                                        <option>Twitch</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                                <div className="flex gap-4">
                                    <motion.button onClick={() => setIsStreaming(true)} disabled={isStreaming} className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-blue-600 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-blue-500" whileTap={{scale: 0.95}}><PlayCircle size={20}/> Start</motion.button>
                                    <motion.button onClick={() => setIsStreaming(false)} disabled={!isStreaming} className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-slate-700 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-slate-600" whileTap={{scale: 0.95}}><StopCircle size={20}/> Stop</motion.button>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-sm">
                                {isStreaming ? <motion.div initial={{scale:0}} animate={{scale:1}} className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.7)]"></motion.div> : <div className="w-3 h-3 rounded-full bg-slate-600"></div>}
                                <span className={isStreaming ? "text-green-400" : "text-slate-400"}>{isStreaming ? "Stream is live" : "Stream is offline"}</span>
                            </div>
                        </section>

                        <section>
                            <h3 className="flex items-center gap-3 text-xl font-semibold text-white mb-4"><Radio className="text-red-400" /> Recording</h3>
                               <div className="space-y-4">
                                 <div className="relative">
                                     <select className="w-full appearance-none bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                         <option>Gallery View</option>
                                         <option>Speaker View</option>
                                         <option>Shared Screen</option>
                                     </select>
                                     <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                 </div>
                                 <div className="flex gap-4">
                                     <motion.button onClick={() => setIsRecording(true)} disabled={isRecording} className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-red-600 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-red-500" whileTap={{scale: 0.95}}><PlayCircle size={20}/> Record</motion.button>
                                     <motion.button onClick={() => setIsRecording(false)} disabled={!isRecording} className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-slate-700 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-slate-600" whileTap={{scale: 0.95}}><StopCircle size={20}/> Stop</motion.button>
                                 </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-sm">
                                {isRecording ? <motion.div initial={{scale:0}} animate={{scale:1}} className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]"></motion.div> : <div className="w-3 h-3 rounded-full bg-slate-600"></div>}
                                <span className={isRecording ? "text-red-400" : "text-slate-400"}>{isRecording ? "Recording active: 00:00:00" : "Not recording"}</span>
                            </div>
                        </section>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    return (
        <div className="relative min-h-screen bg-slate-900 text-white font-sans overflow-hidden">
            <AnimatedBackground />
            <MeetingPage />
        </div>
    );
}
