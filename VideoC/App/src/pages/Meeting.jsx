import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    VideoIcon, Mail, Calendar, Clock, Video, X, Share2, Copy, Check,
    Users, Film, MessageSquare, ArrowLeft, User as UserIcon, KeyRound, ChevronLeft, ChevronRight,
    Mic, MicOff, VideoOff, Settings as SettingsIcon, Hand, MonitorUp, PhoneOff
} from 'lucide-react';

// Component Imports (assuming they are in the correct paths)
import Sidebar from "../components/Sidebar";
import Toast from "../components/Toast";
import JitsiMeet from '../components/JitsiMeet';
import CustomControls from '../components/CustomControls'; // Make sure this path is correct
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


// --- Placeholder Components (as in original code) ---
const AnimatedBackground = () => {
    const numLines = 25;
    const lines = Array.from({ length: numLines });
    const lineVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: (i) => ({ pathLength: 1, opacity: 0.7, transition: { pathLength: { delay: i * 0.1, type: "spring", duration: 2, bounce: 0 }, opacity: { delay: i * 0.1, duration: 0.1 }}})
    };
    return (
        <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
            <svg width="100%" height="100%" className="absolute top-0 left-0" preserveAspectRatio="none">
                <defs><linearGradient id="line-gradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" /><stop offset="100%" stopColor="rgba(139, 92, 246, 0.2)" /></linearGradient></defs>
                {lines.map((_, i) => (<React.Fragment key={i}><motion.line x1="-5%" y1={`${(i / (numLines - 1)) * 100}%`} x2="105%" y2={`${(i / (numLines - 1)) * 100}%`} stroke="url(#line-gradient)" strokeWidth="0.3" variants={lineVariants} initial="hidden" animate="visible" custom={i} /><motion.line x1={`${(i / (numLines - 1)) * 100}%`} y1="-5%" x2={`${(i / (numLines - 1)) * 100}%`} y2="105%" stroke="url(#line-gradient)" strokeWidth="0.3" variants={lineVariants} initial="hidden" animate="visible" custom={i + 5} /></React.Fragment>))}
            </svg>
            <motion.div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-600/40 to-purple-600/40 rounded-full filter blur-3xl opacity-40" animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 1, 1.05, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 30, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }} />
            <motion.div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-gradient-to-tl from-purple-600/30 to-blue-600/30 rounded-full filter blur-3xl opacity-40" animate={{ x: [0, -30, 10, 0], y: [0, 20, -40, 0], scale: [1, 1.05, 1, 0.95, 1], rotate: [0, -15, 15, 0] }} transition={{ duration: 35, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 5 }} />
        </div>
    );
};

const ShareModal = ({ meetingLink, onClose }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(meetingLink).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        });
    };
    return (
        <motion.div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-slate-800/80 backdrop-blur-lg border border-slate-700 p-6 rounded-2xl shadow-xl w-full max-w-md text-center" initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
                <div className="flex justify-end"><button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button></div>
                <Share2 className="mx-auto text-blue-400 mb-3" size={40} />
                <h2 className="text-2xl font-bold text-white mb-2">Meeting Ready!</h2>
                <p className="text-slate-400 mb-6">Share this link with your invitees.</p>
                <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-lg p-2 mb-4">
                    <input type="text" readOnly value={meetingLink} className="flex-grow bg-transparent text-slate-300 text-sm outline-none px-2" />
                    <button onClick={handleCopy} className={`flex items-center justify-center gap-2 w-28 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${isCopied ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'}`}>{isCopied ? <><Check size={16}/> Copied!</> : <><Copy size={16}/> Copy</>}</button>
                </div>
                <div className="flex items-center justify-center gap-4"><a href={`mailto:?subject=Invitation to join meeting&body=Join my meeting with this link: ${meetingLink}`} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-colors px-4 py-2 rounded-lg"><Mail size={18} /><span>Email</span></a></div>
            </motion.div>
        </motion.div>
    );
};

const LiveClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    const formatDate = (date) => date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return (
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
            <p className="text-3xl font-bold text-white tracking-wider">{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
            <p className="text-sm text-slate-400">{formatDate(time)}</p>
        </div>
    );
};

const InfoPanel = ({ onQuickStart }) => {
    const getFutureDateString = (daysToAdd, formatOptions) => {
        const date = new Date();
        date.setDate(date.getDate() + daysToAdd);
        return date.toLocaleDateString('en-GB', formatOptions);
    };
    const upcomingMeetings = [
        { id: 1, name: 'Project Phoenix Sync', time: 'Tomorrow at 10:00 AM' },
        { id: 2, name: 'Marketing Stand-up', time: `${getFutureDateString(7, {day: 'numeric', month: 'short' })} at 2:30 PM` },
    ];
    return (
        <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} transition={{duration: 0.5, delay: 0.2}} className="flex flex-col space-y-6 h-full">
            <div className="space-y-4"><h3 className="text-lg font-semibold text-white">Dashboard</h3><LiveClock /></div>
            <div className="space-y-4"><h3 className="text-lg font-semibold text-white">Quick Actions</h3><motion.button onClick={onQuickStart} whileTap={{ scale: 0.97 }} className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg bg-slate-700/70 border border-slate-600 font-semibold text-white transition-all hover:bg-slate-700 hover:border-blue-500"><Video size={20} className="text-blue-400" /><span>Start Instant Meeting</span></motion.button></div>
            <div className="space-y-4 flex-grow flex flex-col min-h-0">
                <h3 className="text-lg font-semibold text-white">Upcoming Meetings</h3>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3 flex-grow overflow-y-auto hide-scrollbar">
                    {upcomingMeetings.map(meeting => (
                        <div key={meeting.id} className="bg-slate-700/40 p-3 rounded-md">
                            <p className="font-semibold text-slate-200 text-sm">{meeting.name}</p>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-slate-400 flex items-center gap-1.5"><Clock size={12} /> {meeting.time}</p>
                                <button className="text-xs font-bold text-blue-400 hover:underline">Join</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const CustomCalendar = ({ selectedDate, setSelectedDate, close }) => {
    const [date, setDate] = useState(selectedDate || new Date());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();
    const handlePrevMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    const handleNextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    const handleSelectDate = (day) => {
        const newDate = new Date(date.getFullYear(), date.getMonth(), day);
        if (newDate < today) return;
        setSelectedDate(newDate);
        close();
    };

    const month = date.getMonth();
    const year = date.getFullYear();
    const numDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);

    return (
        <motion.div 
            className="bg-slate-800 p-4 rounded-lg shadow-xl w-full max-w-xs border border-slate-700"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        >
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-700"><ChevronLeft size={20} /></button>
                <span className="font-semibold text-lg">{date.toLocaleString('default', { month: 'long' })} {year}</span>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-700"><ChevronRight size={20} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {Array.from({ length: numDays }).map((_, i) => {
                    const day = i + 1;
                    const currentDate = new Date(year, month, day);
                    const isPast = currentDate < today;
                    const isToday = today.getTime() === currentDate.getTime();
                    const isSelected = selectedDate && selectedDate.getTime() === currentDate.getTime();
                    return (
                        <button 
                            key={day} 
                            onClick={() => handleSelectDate(day)}
                            disabled={isPast}
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors
                                ${isSelected ? 'bg-blue-500 text-white font-bold' : ''}
                                ${!isSelected && isToday ? 'border border-blue-500 text-blue-400' : ''}
                                ${!isSelected && !isToday ? 'hover:bg-slate-700' : ''}
                                ${isPast ? 'text-slate-600 cursor-not-allowed' : ''}
                            `}
                        >
                            {day}
                        </button>
                    )
                })}
            </div>
        </motion.div>
    );
};

const CustomTimePicker = ({ selectedTime, setSelectedTime, close }) => {
    const [hour, setHour] = useState(selectedTime ? selectedTime.getHours() % 12 === 0 ? 12 : selectedTime.getHours() % 12 : 12);
    const [minute, setMinute] = useState(selectedTime ? selectedTime.getMinutes() : 0);
    const [period, setPeriod] = useState(selectedTime ? (selectedTime.getHours() >= 12 ? 'PM' : 'AM') : 'PM');
    
    const handleSave = () => {
        let finalHour = hour;
        if (period === 'PM' && hour < 12) finalHour += 12;
        if (period === 'AM' && hour === 12) finalHour = 0;
        
        const newTime = new Date();
        newTime.setHours(finalHour, minute);
        setSelectedTime(newTime);
        close();
    };

    return (
        <motion.div 
            className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-xs border border-slate-700"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        >
            <h3 className="text-lg font-semibold text-center mb-4">Select Time</h3>
            <div className="flex items-center justify-center gap-2 text-4xl font-mono">
                <input type="number" min="1" max="12" value={hour} onChange={e => setHour(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))} className="w-20 bg-slate-700 text-center rounded-lg p-2 outline-none focus:ring-2 ring-blue-500" />
                <span>:</span>
                <input type="number" min="0" max="59" step="1" value={String(minute).padStart(2, '0')} onChange={e => setMinute(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))} className="w-20 bg-slate-700 text-center rounded-lg p-2 outline-none focus:ring-2 ring-blue-500" />
                <div className="flex flex-col gap-2 ml-2">
                    <button onClick={() => setPeriod('AM')} className={`px-3 py-1 text-sm rounded-md transition-colors ${period === 'AM' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>AM</button>
                    <button onClick={() => setPeriod('PM')} className={`px-3 py-1 text-sm rounded-md transition-colors ${period === 'PM' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>PM</button>
                </div>
            </div>
            <button onClick={handleSave} className="w-full mt-6 py-2 px-4 rounded-lg bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-500">Set Time</button>
        </motion.div>
    );
};

const SettingsModal = ({ formValues, handleInputChange, close }) => (
    <motion.div 
        className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-sm border border-slate-700"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
    >
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Advanced Settings</h3>
            <button onClick={close} className="p-1 rounded-full hover:bg-slate-700"><X size={20} /></button>
        </div>
        <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                    <Users className="text-slate-400" size={18} />
                    <span className="text-slate-300 text-sm font-medium">Enable waiting room</span>
                </div>
                <button onClick={() => handleInputChange({ target: { name: 'waitingRoomEnabled', value: !formValues.waitingRoomEnabled } })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formValues.waitingRoomEnabled ? 'bg-blue-500' : 'bg-slate-600'}`}>
                    <motion.span animate={{ x: formValues.waitingRoomEnabled ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }} className="inline-block h-5 w-5 transform rounded-full bg-white" />
                </button>
            </div>
        </div>
    </motion.div>
);

const MeetingDetailsForm = ({ 
    isScheduling, 
    onSubmit, 
    setView, 
    formValues,
    handleInputChange,
    handleDateChange,
    isLoading 
}) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <motion.form 
            key={isScheduling ? "schedule-form" : "start-form"}
            onSubmit={onSubmit}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                    <button type="button" onClick={() => setView('initial')} className="p-2 rounded-full hover:bg-slate-700/50 mr-2"><ArrowLeft size={20}/></button>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{isScheduling ? 'Schedule a Meeting' : 'Start an Instant Meeting'}</h2>
                        <p className="text-slate-400 text-sm">Fill in the details to get started.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => handleInputChange({ target: { name: 'micEnabled', value: !formValues.micEnabled } })} className={`p-2 rounded-full transition-colors ${formValues.micEnabled ? 'bg-slate-700 text-white' : 'bg-slate-600 text-slate-400'}`}>
                        {formValues.micEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                    </button>
                    <button type="button" onClick={() => handleInputChange({ target: { name: 'cameraEnabled', value: !formValues.cameraEnabled } })} className={`p-2 rounded-full transition-colors ${formValues.cameraEnabled ? 'bg-slate-700 text-white' : 'bg-slate-600 text-slate-400'}`}>
                        {formValues.cameraEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                    </button>
                    <button type="button" onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full bg-slate-700 text-white hover:bg-slate-600"><SettingsIcon size={18} /></button>
                </div>
            </div>
            <div className="space-y-4 flex-grow">
                <div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" name="userName" placeholder="Your Name*" value={formValues.userName} onChange={handleInputChange} required className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /></div>
                <div className="relative"><VideoIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" name="meetingTitle" placeholder="Meeting Title*" value={formValues.meetingTitle} onChange={handleInputChange} required className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /></div>
                <div className="relative"><MessageSquare className="absolute left-4 top-4 text-slate-400" size={18} /><textarea name="meetingPurpose" placeholder="Meeting Purpose (Optional)" value={formValues.meetingPurpose} onChange={handleInputChange} rows="3" className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" /></div>
                <div className="relative"><KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="password" name="meetingPassword" placeholder="Set Password (Optional)" value={formValues.meetingPassword} onChange={handleInputChange} className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /></div>
                {isScheduling && (
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <button type="button" onClick={() => setIsCalendarOpen(true)} className="w-full flex items-center justify-between bg-slate-700/50 border-2 border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <span>{formValues.scheduleDate ? formValues.scheduleDate.toLocaleDateString() : 'Select Date'}</span>
                                <Calendar className="text-slate-400" size={18} />
                            </button>
                        </div>
                        <div className="relative">
                             <button type="button" onClick={() => setIsTimePickerOpen(true)} className="w-full flex items-center justify-between bg-slate-700/50 border-2 border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <span>{formValues.scheduleTime ? formValues.scheduleTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Select Time'}</span>
                                <Clock className="text-slate-400" size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="pt-6 mt-auto flex justify-center">
                <motion.button type="submit" disabled={isLoading} className="w-auto flex items-center justify-center gap-2 py-2 px-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white transition-all duration-300 ease-in-out hover:from-blue-500 hover:to-purple-500 hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" whileTap={{ scale: 0.98 }}>{isLoading ? 'Processing...' : (isScheduling ? 'Schedule Meeting' : 'Create & Start')}</motion.button>
            </div>

            <AnimatePresence>
                {(isCalendarOpen || isTimePickerOpen || isSettingsOpen) && (
                    <motion.div 
                        className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => { setIsCalendarOpen(false); setIsTimePickerOpen(false); setIsSettingsOpen(false); }}
                    >
                        {isCalendarOpen && <div onClick={(e) => e.stopPropagation()}><CustomCalendar selectedDate={formValues.scheduleDate} setSelectedDate={(date) => handleDateChange({target: {name: 'scheduleDate', value: date}})} close={() => setIsCalendarOpen(false)} /></div>}
                        {isTimePickerOpen && <div onClick={(e) => e.stopPropagation()}><CustomTimePicker selectedTime={formValues.scheduleTime} setSelectedTime={(time) => handleDateChange({target: {name: 'scheduleTime', value: time}})} close={() => setIsTimePickerOpen(false)} /></div>}
                        {isSettingsOpen && <div onClick={(e) => e.stopPropagation()}><SettingsModal formValues={formValues} handleInputChange={handleInputChange} close={() => setIsSettingsOpen(false)} /></div>}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.form>
    );
};

const CreateMeeting = ({ onSubmit, isLoading, initialUserName }) => {
    const [view, setView] = useState('initial');
    const [formValues, setFormValues] = useState({
        userName: initialUserName || '',
        meetingTitle: '',
        meetingPurpose: '',
        meetingPassword: '',
        scheduleDate: null,
        scheduleTime: null,
        micEnabled: true,
        cameraEnabled: true,
        waitingRoomEnabled: true,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const isScheduling = view === 'schedule';
        const finalDateTime = (isScheduling && formValues.scheduleDate && formValues.scheduleTime) ? new Date(
            formValues.scheduleDate.getFullYear(),
            formValues.scheduleDate.getMonth(),
            formValues.scheduleDate.getDate(),
            formValues.scheduleTime.getHours(),
            formValues.scheduleTime.getMinutes()
        ) : null;

        const formData = { 
            name: formValues.meetingTitle || (isScheduling ? 'Scheduled Meeting' : 'Instant Meeting'), 
            purpose: formValues.meetingPurpose,
            password: formValues.meetingPassword,
            isScheduled: isScheduling, 
            scheduledFor: finalDateTime,
            hostName: formValues.userName,
            startWithAudioMuted: !formValues.micEnabled,
            startWithVideoMuted: !formValues.cameraEnabled,
            prejoinPageEnabled: formValues.waitingRoomEnabled,
        };
        onSubmit(formData, isScheduling ? 'later' : 'now');
    };

    return (
        <motion.div 
            className="p-4 sm:p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 h-full flex flex-col justify-center"
        >
            <AnimatePresence mode="wait">
                {view === 'initial' && (
                           <motion.div
                                key="initial-view"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="text-center flex flex-col items-center justify-center h-full"
                            >
                                <h2 className="text-3xl font-bold text-white">Start a Meeting</h2>
                                <p className="text-slate-400 mt-2 max-w-xs mx-auto">Get started instantly or schedule a call for later.</p>
                                <div className="flex items-center justify-center gap-6 mt-8">
                                    <motion.button onClick={() => setView('startNow')} whileHover={{scale: 1.05}} whileTap={{scale: 0.95}} className="flex flex-col items-center gap-2 text-white font-semibold group">
                                        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300 transform group-hover:-translate-y-1">
                                            <Video size={40} />
                                        </div>
                                        <span>Start Now</span>
                                    </motion.button>
                                    <motion.button onClick={() => setView('schedule')} whileHover={{scale: 1.05}} whileTap={{scale: 0.95}} className="flex flex-col items-center gap-2 text-white font-semibold group">
                                        <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 shadow-lg group-hover:bg-purple-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-purple-500/30 transition-all duration-300 transform group-hover:-translate-y-1">
                                            <Calendar size={40} />
                                        </div>
                                        <span>Schedule</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                )}
                {(view === 'startNow' || view === 'schedule') && (
                    <MeetingDetailsForm 
                        isScheduling={view === 'schedule'} 
                        onSubmit={handleFormSubmit}
                        setView={setView}
                        formValues={formValues}
                        handleInputChange={handleInputChange}
                        handleDateChange={handleDateChange}
                        isLoading={isLoading}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700/80 flex items-center gap-4 backdrop-blur-sm">
        <div className={`p-3 rounded-md ${color}`}>
            <Icon size={20} className="text-white" />
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const EMPTY_TOOLBAR = [];

const MeetingPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeToast, setActiveToast] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [newMeetingLink, setNewMeetingLink] = useState('');
    const [activeMeeting, setActiveMeeting] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [userName, setUserName] = useState('Guest');
    const [jitsiApi, setJitsiApi] = useState(null);
    
    // --- CHANGE 1: REMOVED isJitsiReady STATE ---
    // The isJitsiReady state and its corresponding useEffect were removed
    // as they were causing a race condition. The CustomControls component
    // will now render as soon as the jitsiApi object is available.

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            const storedUserName = localStorage.getItem('userName');
            if (user) {
                setUserName(storedUserName || user.displayName || 'User');
            } else {
                setUserName('Guest');
            }
        });
        return () => unsubscribe();
    }, []);

    const showToast = (toastData) => { setActiveToast({ id: Date.now(), ...toastData }); };

    const handleCreateMeeting = async (formData, scheduleOption = 'now') => {
        setIsLoading(true);
        if (!currentUser) {
            showToast({ title: 'Auth Error', message: 'You must be logged in.', type: 'error' });
            setIsLoading(false);
            return;
        }

        if (formData.hostName) localStorage.setItem('userName', formData.hostName);

        try {
            const meetingPayload = { ...formData, createdBy: currentUser.uid, createdAt: serverTimestamp() };
            const docRef = await addDoc(collection(db, 'meetings'), meetingPayload);
            const link = `${window.location.origin}/meeting/${docRef.id}`;
            setNewMeetingLink(link);
            showToast({ title: 'Success!', message: `Meeting ${scheduleOption === 'now' ? 'created' : 'scheduled'}!`, type: 'success' });
            
            if (scheduleOption === 'now') {
                setActiveMeeting({ 
                    id: docRef.id, 
                    name: meetingPayload.name, 
                    displayName: meetingPayload.hostName,
                    password: meetingPayload.password,
                    startWithVideoMuted: meetingPayload.startWithVideoMuted,
                    startWithAudioMuted: meetingPayload.startWithAudioMuted,
                    prejoinPageEnabled: false, // For custom controls, we usually skip the prejoin page
                });
            } else {
                setIsShareModalOpen(true);
            }
        } catch (error) {
            console.error("Error creating meeting: ", error);
            showToast({ title: 'Error', message: 'Failed to create meeting.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickStart = () => {
        // This is a placeholder for your quick start logic.
        // You would typically call handleCreateMeeting with some default values.
        if (!currentUser) {
             showToast({ title: 'Auth Error', message: 'You must be logged in to start a meeting.', type: 'error' });
             return;
        }
        const quickStartData = {
            name: `Instant Meeting - ${new Date().toLocaleDateString()}`,
            purpose: 'Quick call',
            password: '',
            isScheduled: false,
            scheduledFor: null,
            hostName: userName,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
        };
        handleCreateMeeting(quickStartData, 'now');
    };
    
    const handleEndMeeting = useCallback(() => {
        showToast({ title: 'Meeting Ended', message: 'You have left the meeting.', type: 'info' });
        setActiveMeeting(null);
        setJitsiApi(null); // Reset the API object
    }, []); // Empty dependency array is correct here

    const handleApiReady = useCallback((api) => {
        setJitsiApi(api);
    }, []); // Empty dependency array is correct here

    return (
        <div className="flex h-screen relative z-10">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-5 w-full max-w-sm px-4 sm:px-0 z-[60]"><AnimatePresence>{activeToast && <Toast key={activeToast.id} toast={activeToast} onClose={() => setActiveToast(null)} />}</AnimatePresence></div>
            <AnimatePresence>{isShareModalOpen && <ShareModal meetingLink={newMeetingLink} onClose={() => setIsShareModalOpen(false)} />}</AnimatePresence>
            <div className="flex-1 flex flex-col h-screen">
                <main className={`flex-1 overflow-hidden transition-all duration-300 ${activeMeeting ? 'p-0' : 'p-4 sm:p-6'}`}>
                    <AnimatePresence mode="wait">
                        {activeMeeting ? (
                            <motion.div 
                                key="meeting-view" 
                                className="w-full h-full flex flex-col bg-slate-900 "
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div className="flex-grow w-full h-0 min-h-[75vh]">
                                    <JitsiMeet 
                            domain="meet.in8.com" // Aapka domain
                            roomName={activeMeeting.id} 
                            displayName={activeMeeting.displayName || userName} 
                            password={activeMeeting.password}
                            onMeetingEnd={handleEndMeeting} 
                            onApiReady={handleApiReady}
                            startWithVideoMuted={activeMeeting.startWithVideoMuted}
                            startWithAudioMuted={activeMeeting.startWithAudioMuted}
                            prejoinPageEnabled={activeMeeting.prejoinPageEnabled}
                            // highlight-start
                            // STEP 2: Yahan par naya array [] banane ke bajaye, constant ka use karein
                            toolbarButtons={EMPTY_TOOLBAR} 
                            // highlight-end
                        />
                                </div>
                                
                                {/* --- CHANGE 2: SIMPLIFIED RENDER CONDITION --- */}
                                {/* The controls now render as soon as `jitsiApi` is available. */}
                                {jitsiApi && (
                                    <CustomControls 
                                        jitsiApi={jitsiApi} 
                                        onHangup={handleEndMeeting} 
                                    />
                                )}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="dashboard-view" 
                                className="h-full flex flex-col gap-6 hide-scrollbar overflow-y-auto"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Meeting Dashboard</h1>
                                    <p className="text-slate-400 mt-1">Welcome back, {userName}!</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <StatCard title="Meetings Attended" value="28" icon={Users} color="bg-blue-500" />
                                    <StatCard title="Total Time" value="12h 45m" icon={Clock} color="bg-purple-500" />
                                    <StatCard title="Recordings Saved" value="7" icon={Film} color="bg-green-500" />
                                    <StatCard title="Upcoming" value="3" icon={Calendar} color="bg-orange-500" />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
                                    <div className="lg:col-span-2 h-full">
                                        <CreateMeeting 
                                            onSubmit={handleCreateMeeting} 
                                            isLoading={isLoading} 
                                            initialUserName={userName}
                                        />
                                    </div>
                                    <div className="hidden lg:block lg:col-span-1 h-full">
                                        <InfoPanel onQuickStart={handleQuickStart} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default function MeetingPageContainer() {
    return (
        <div className="relative min-h-screen bg-slate-900 text-white font-sans overflow-hidden">
            <AnimatedBackground />
            <MeetingPage />
        </div>
    );
}