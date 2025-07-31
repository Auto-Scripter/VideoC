// components/InfoPanel.js (or similar path)

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Calendar, Clock, Users, MicOff } from 'lucide-react';

// LiveClock sub-component remains the same
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

// ToggleSwitch should be here if not defined globally
const ToggleSwitch = ({ label, enabled, setEnabled, icon: Icon }) => (
    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
        <div className="flex items-center gap-3">
            <Icon className="text-slate-400" size={18} />
            <span className="text-slate-300 text-sm font-medium">{label}</span>
        </div>
        <button onClick={() => setEnabled(!enabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 ${enabled ? 'bg-blue-500' : 'bg-slate-600'}`}>
            <motion.span animate={{ x: enabled ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }} className="inline-block h-5 w-5 transform rounded-full bg-white" />
        </button>
    </div>
);


export const InfoPanel = ({ onQuickStart, options, onOptionChange }) => {
    const upcomingMeetings = [
        { id: 1, name: 'Project Phoenix Sync', time: 'Tomorrow at 10:00 AM' },
        { id: 2, name: 'Marketing Stand-up', time: 'July 31, 2025 at 2:30 PM' },
    ];
    
    return (
        <motion.div 
            initial={{opacity: 0, x: 20}} 
            animate={{opacity: 1, x: 0}} 
            transition={{duration: 0.5, delay: 0.2}} 
            className="flex flex-col space-y-6 h-full"
        >
            <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-white">Dashboard</h3>
                 <LiveClock />
            </div>
           
            <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                 <motion.button 
                    onClick={onQuickStart}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg bg-slate-700/70 border border-slate-600 font-semibold text-white transition-all hover:bg-slate-700 hover:border-blue-500"
                >
                    <Video size={20} className="text-blue-400" />
                    <span>Start Instant Meeting</span>
                </motion.button>
            </div>

            {/* --- NEW MEETING OPTIONS CARD --- */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Meeting Options</h3>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 space-y-2">
                    <ToggleSwitch label="Enable waiting room" enabled={options.enableWaitingRoom} setEnabled={() => onOptionChange('enableWaitingRoom', !options.enableWaitingRoom)} icon={Users} />
                    <ToggleSwitch label="Mute on entry" enabled={options.muteOnEntry} setEnabled={() => onOptionChange('muteOnEntry', !options.muteOnEntry)} icon={MicOff} />
                    <ToggleSwitch label="Join anytime" enabled={options.allowJoinAnytime} setEnabled={() => onOptionChange('allowJoinAnytime', !options.allowJoinAnytime)} icon={Clock} />
                </div>
            </div>

            <div className="space-y-4 flex-grow flex flex-col min-h-0">
                <h3 className="text-lg font-semibold text-white">Upcoming Meetings</h3>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3 flex-grow overflow-y-auto">
                    {upcomingMeetings.length > 0 ? (
                        upcomingMeetings.map(meeting => (
                            <div key={meeting.id} className="flex items-center gap-3">
                                <div className="p-2 bg-slate-700 rounded-full"><Calendar size={18} className="text-slate-400" /></div>
                                <div>
                                    <p className="font-medium text-slate-200 text-sm">{meeting.name}</p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1.5"><Clock size={12} /> {meeting.time}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                         <p className="text-slate-400 text-center py-4">No upcoming meetings.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};