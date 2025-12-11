import React, { useState, useRef, useEffect } from 'react';
import { ActivityLog } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  activities: ActivityLog[];
}

const NavItem = ({ icon, label, id, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
      active 
        ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20 translate-x-1' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
    }`}
  >
    <i className={`fas ${icon} w-5 text-center transition-transform group-hover:scale-110`}></i>
    <span className="font-medium">{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, activities }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-64 bg-slate-900 flex flex-col border-r border-slate-800 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <i className="fas fa-bolt text-white text-sm"></i>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">AdPulse AI</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem 
            id="dashboard" 
            icon="fa-chart-pie" 
            label="Overview" 
            active={activeTab === 'dashboard'} 
            onClick={(id: string) => { onTabChange(id); setIsMobileMenuOpen(false); }} 
          />
          <NavItem 
            id="campaigns" 
            icon="fa-wand-magic-sparkles" 
            label="Campaign Wizard" 
            active={activeTab === 'campaigns'} 
            onClick={(id: string) => { onTabChange(id); setIsMobileMenuOpen(false); }} 
          />
          <NavItem 
            id="creatives" 
            icon="fa-palette" 
            label="Creative Studio" 
            active={activeTab === 'creatives'} 
            onClick={(id: string) => { onTabChange(id); setIsMobileMenuOpen(false); }} 
          />
          <NavItem 
            id="workflow" 
            icon="fa-list-check" 
            label="Approvals" 
            active={activeTab === 'workflow'} 
            onClick={(id: string) => { onTabChange(id); setIsMobileMenuOpen(false); }} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-850/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
              <i className="fas fa-user text-xs text-slate-300"></i>
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">Demo User</p>
              <p className="text-slate-500 text-xs">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
        {/* Header */}
        <header className="h-16 bg-white/80 glass border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-slate-500 hover:text-slate-700"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <h2 className="text-lg font-bold text-slate-800 capitalize tracking-tight">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 relative transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <i className="fas fa-bell"></i>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 animate-fade-in origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-semibold text-sm text-slate-700">Notifications</h3>
                    <span className="text-xs text-brand-600 font-medium">Mark all read</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {activities.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                         <i className="far fa-bell-slash text-xl opacity-50"></i>
                         No new notifications
                      </div>
                    ) : (
                      activities.slice(0, 10).map((activity) => (
                        <div key={activity.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors cursor-pointer group">
                          <div className="flex gap-3">
                             <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                activity.type === 'success' ? 'bg-green-500' : 
                                activity.type === 'warning' ? 'bg-orange-500' : 'bg-brand-500'
                             }`}></div>
                             <div>
                                <p className="text-sm text-slate-700 leading-snug group-hover:text-slate-900">{activity.text}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {activity.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                             </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
           {/* Animated Page Transition Wrapper */}
           <div key={activeTab} className="animate-fade-in max-w-7xl mx-auto space-y-8">
              {children}
           </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;