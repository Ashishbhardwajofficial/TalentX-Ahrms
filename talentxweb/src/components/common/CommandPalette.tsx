import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    X,
    Command,
    Users,
    Briefcase,
    DollarSign,
    Calendar,
    Settings,
    ChevronRight,
    TrendingUp,
    FileText,
    Zap,
    Clock,
    ArrowRight
} from 'lucide-react';
import employeeApi from '../../api/employeeApi';
import recruitmentApi from '../../api/recruitmentApi';
import { PaginatedResponse } from '../../types';

interface SearchResult {
    id: string | number;
    title: string;
    subtitle: string;
    type: 'employee' | 'job' | 'payroll' | 'navigation';
    path: string;
    icon: React.ReactNode;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    const staticNavigation: SearchResult[] = [
        { id: 'nav-employees', title: 'Workforce Registry', subtitle: 'Global personnel directory', type: 'navigation', path: '/employees', icon: <Users className="w-4 h-4" /> },
        { id: 'nav-recruitment', title: 'Personnel Strategy', subtitle: 'Job postings and pipeline', type: 'navigation', path: '/recruitment', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'nav-payroll', title: 'Financial Treasury', subtitle: 'Payroll runs and payslips', type: 'navigation', path: '/payroll', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'nav-settings', title: 'Control Center', subtitle: 'System architectural settings', type: 'navigation', path: '/settings', icon: <Settings className="w-4 h-4" /> },
    ];

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults(staticNavigation);
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults(staticNavigation);
            return;
        }

        setLoading(true);
        try {
            const [employees, jobs] = await Promise.all([
                employeeApi.getEmployees({ page: 0, size: 3, search: searchQuery }),
                recruitmentApi.getJobPostings({ page: 0, size: 3, search: searchQuery })
            ]);

            const formattedResults: SearchResult[] = [
                ...(employees?.content || []).map(emp => ({
                    id: `emp-${emp.id}`,
                    title: emp.fullName,
                    subtitle: `${emp.jobTitle || 'Personnel'} • ${emp.departmentName || 'Core'}`,
                    type: 'employee' as const,
                    path: `/employees/${emp.id}`,
                    icon: <div className="w-8 h-8 rounded-lg bg-primary-500/10 center text-primary-500 font-black text-[10px]">{emp.fullName.charAt(0)}</div>
                })),
                ...(jobs?.content || []).map(job => ({
                    id: `job-${job.id}`,
                    title: job.title,
                    subtitle: `${job.department?.name || 'Strategy'} • ${job.status}`,
                    type: 'job' as const,
                    path: `/recruitment`,
                    icon: <Briefcase className="w-4 h-4 text-warning-500" />
                }))
            ];

            setResults(formattedResults.length > 0 ? formattedResults : staticNavigation);
        } catch (error) {
            console.error('Tactical search failure:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => performSearch(query), 300);
        return () => clearTimeout(timeoutId);
    }, [query, performSearch]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (results[selectedIndex]) {
                    navigate(results[selectedIndex]?.path || '/');
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex, navigate, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] center p-4 md:p-12">
            <div className="absolute inset-0 bg-secondary-900/60 backdrop-blur-xl animate-fade-in" onClick={onClose} />

            <div className="w-full max-w-2xl bg-secondary-900 border border-primary-500/30 rounded-[32px] shadow-2xl overflow-hidden relative animate-scale-in">
                <div className="relative border-b border-white/5 p-2">
                    <Search className={`absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${loading ? 'text-primary-500 animate-pulse' : 'text-secondary-400'}`} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Execute Strategic Command..."
                        className="w-full bg-transparent pl-16 pr-20 py-8 text-xl font-black italic tracking-tighter text-white placeholder-secondary-700 outline-none"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {query && <button onClick={() => setQuery('')} className="p-1 px-2 text-[10px] font-black text-secondary-500 hover:text-white uppercase tracking-widest">Clear</button>}
                        <kbd className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-secondary-500 shadow-inner">ESC</kbd>
                    </div>
                </div>

                <div className="max-h-[480px] overflow-y-auto no-scrollbar p-3 space-y-2">
                    {results.length > 0 ? (
                        results.map((result, index) => (
                            <div
                                key={result.id}
                                onMouseEnter={() => setSelectedIndex(index)}
                                onClick={() => { navigate(result.path); onClose(); }}
                                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 group/result ${selectedIndex === index ? 'bg-primary-600 text-white shadow-glow translate-x-1' : 'hover:bg-white/5'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl center transition-all shrink-0 ${selectedIndex === index ? 'bg-white text-primary-600 scale-110' : 'bg-secondary-800 text-secondary-400 group-hover/result:text-primary-500'}`}>
                                    {result.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className={`text-base font-black italic tracking-tight uppercase leading-none transition-colors ${selectedIndex === index ? 'text-white' : 'text-secondary-100'}`}>{result.title}</h4>
                                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded border transition-colors ${selectedIndex === index ? 'bg-white/20 border-white/20 text-white' : 'bg-secondary-800 border-white/5 text-secondary-500'}`}>{result.type}</span>
                                    </div>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 transition-colors ${selectedIndex === index ? 'text-white/70' : 'text-secondary-500'}`}>{result.subtitle}</p>
                                </div>
                                <div className={`transition-all duration-500 ${selectedIndex === index ? 'translate-x-0 opacity-100' : 'translate-x-[10px] opacity-0'}`}>
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 center flex-col gap-4 opacity-30 italic">
                            <Search className="w-12 h-12 mb-2 text-secondary-600" />
                            <p className="text-sm font-black uppercase tracking-[0.2em]">Zero intelligence found</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-600 italic">Modify query parameters</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <kbd className="w-5 h-5 rounded bg-secondary-800 center text-[10px] text-white/50 border border-white/5 shadow-inner">↑</kbd>
                            <kbd className="w-5 h-5 rounded bg-secondary-800 center text-[10px] text-white/50 border border-white/5 shadow-inner">↓</kbd>
                            <span className="text-[9px] font-black uppercase tracking-widest text-secondary-500">Navigate Registry</span>
                        </div>
                        <div className="w-px h-4 bg-white/5" />
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 h-5 rounded bg-secondary-800 center text-[10px] text-white/50 border border-white/5 shadow-inner">↵</kbd>
                            <span className="text-[9px] font-black uppercase tracking-widest text-secondary-500">Execute Access</span>
                        </div>
                    </div>

                    <div className="p-2 rounded-xl bg-secondary-800/50 border border-white/5 flex items-center gap-2 group/tip">
                        <Zap className="w-3 h-3 text-primary-500 animate-pulse" />
                        <span className="text-[9px] font-black tracking-widest text-secondary-400 group-hover:text-primary-500 transition-colors uppercase">Alt+K for global access</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
