import React, { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Video, Calendar, UserCog, Shield, 
    SlidersHorizontal, HardDrive, BellRing, BookText, 
    ChevronDown, LogOut, CircleUserRound, X
} from 'lucide-react';
import MyLogo from '../assets/logo.png'; 

const SidebarLink = ({ icon: Icon, text, active, onClick, to }) => (
    <Link 
        to={to}
        onClick={onClick} 
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors relative text-sm ${ active ? 'bg-blue-600/30 text-white font-medium' : 'text-slate-300 hover:bg-white/10 hover:text-white' }`}
    >
        {active && <motion.div layoutId="active-pill" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />}
        <Icon size={16} />
        <span>{text}</span>
    </Link>
);

const CollapsibleSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                {title}
                <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="pl-4 pr-2 pt-1 space-y-1 overflow-hidden">
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// The core sidebar content, which will be reused for both desktop and mobile.
const SidebarContent = ({ activeLink, setActiveLink, user, onLogout }) => {
    const Logo = MyLogo;
    return (
        <>
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <img src={Logo} alt="IN8 Logo" className="w-16 h-16 object-contain" />
                    <h1 className="text-2xl font-bold text-white">IN8</h1>
                </div>
            </div>
            <nav className="flex-1 space-y-2 mt-4 px-2">
                <SidebarLink 
                    to="/dashboard" 
                    icon={LayoutDashboard} 
                    text="Dashboard" 
                    active={activeLink === 'Dashboard'} 
                    onClick={() => setActiveLink('Dashboard')} 
                />
                <CollapsibleSection title="Workspace">
                    <SidebarLink to="/meeting" icon={Video} text="Meetings" active={activeLink === 'Meetings'} onClick={() => setActiveLink('Meetings')} />
                    <SidebarLink to="/calendar" icon={Calendar} text="Calendar" active={activeLink === 'Calendar'} onClick={() => setActiveLink('Calendar')} />
                </CollapsibleSection>
                <CollapsibleSection title="Admin Tools">
                    <SidebarLink to="/admin/users" icon={UserCog} text="User Management" active={activeLink === 'User Management'} onClick={() => setActiveLink('User Management')} />
                    <SidebarLink to="/admin/security" icon={Shield} text="Security" active={activeLink === 'Security'} onClick={() => setActiveLink('Security')} />
                    <SidebarLink to="/admin/customization" icon={SlidersHorizontal} text="Customization" active={activeLink === 'Customization'} onClick={() => setActiveLink('Customization')} />
                    <SidebarLink to="/admin/status" icon={HardDrive} text="System Status" active={activeLink === 'System Status'} onClick={() => setActiveLink('System Status')} />
                </CollapsibleSection>
                <CollapsibleSection title="Resources">
                    <SidebarLink to="/notifications" icon={BellRing} text="Notifications" active={activeLink === 'Notifications'} onClick={() => setActiveLink('Notifications')} />
                    <SidebarLink to="/docs" icon={BookText} text="Documentation" active={activeLink === 'Documentation'} onClick={() => setActiveLink('Documentation')} />
                </CollapsibleSection>
            </nav>
            <div className="mt-auto p-2 border-t border-slate-700/50">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10">
                    <CircleUserRound size={36} className="text-slate-400" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-white">{user?.firstName || 'User'}</p>
                        <p className="text-xs text-slate-400">{user?.email}</p>
                    </div>
                    <LogOut size={18} className="text-slate-500 hover:text-red-400 cursor-pointer" onClick={onLogout} />
                </div>
            </div>
        </>
    );
}

// The main export is now a responsive wrapper around the sidebar content.
export default function Sidebar({ isOpen, setIsOpen, activeLink, setActiveLink, user, onLogout }) {
    return (
        <>
            {/* --- Desktop Sidebar --- */}
            <aside className="w-64 min-h-screen hidden lg:flex flex-col bg-black/20 backdrop-blur-lg p-4 border-r border-slate-800">
                <SidebarContent 
                    activeLink={activeLink} 
                    setActiveLink={setActiveLink} 
                    user={user} 
                    onLogout={onLogout} 
                />
            </aside>

            {/* --- Mobile Sidebar (with overlay and animation) --- */}
            <AnimatePresence>
                {isOpen && (
                    <div className="lg:hidden">
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40"
                        />
                        {/* Sidebar Panel */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-64 bg-slate-900/90 backdrop-blur-lg p-4 border-r border-slate-800 z-50 flex flex-col"
                        >
                            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                            <SidebarContent 
                                activeLink={activeLink} 
                                setActiveLink={setActiveLink} 
                                user={user} 
                                onLogout={onLogout} 
                            />
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
