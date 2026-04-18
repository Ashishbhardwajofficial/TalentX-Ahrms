import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import {
    User,
    Shield,
    Key,
    Mail,
    User as UserIcon,
    Clock,
    CheckCircle,
    AlertTriangle,
    Activity,
    Lock,
    Eye,
    EyeOff,
    ChevronRight,
    MapPin,
    Building2,
    Calendar,
    BadgeCheck
} from 'lucide-react';
import Button from '../../components/common/Button';

const ProfilePage: React.FC = () => {
    const { user } = useAuthContext();
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
    const [showPassword, setShowPassword] = useState(false);

    // Safe accessors
    const userEmail = user?.email || 'N/A';
    const userName = user?.username || userEmail.split('@')[0];
    const userRole = user?.roles?.[0]?.name || 'Personnel';
    const lastLogin = user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never';
    const accountCreated = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header / Hero Section */}
            <div className="relative overflow-hidden rounded-[32px] bg-secondary-900 border border-white/5 p-8 lg:p-12 shadow-premium group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 blur-[100px] rounded-full group-hover:bg-primary-600/20 transition-all duration-1000" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-400/5 blur-[80px] rounded-full" />

                <div className="relative flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar Circle */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-primary-600 to-primary-800 center shadow-glow transform group-hover:scale-105 transition-transform duration-500 overflow-hidden border-4 border-white/10">
                            <span className="text-4xl font-black text-white italic tracking-tighter">
                                {userEmail.charAt(0).toUpperCase()}
                            </span>
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-success-500 rounded-2xl border-4 border-secondary-900 center shadow-lg">
                            <BadgeCheck className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
                                {userName}
                            </h1>
                            <span className="px-3 py-1 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[10px] font-black uppercase tracking-widest center gap-2">
                                <Activity className="w-3 h-3 animate-pulse" /> Strategic Asset
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-secondary-400 font-bold text-sm tracking-tight italic">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary-500" /> {userEmail}
                            </div>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary-500" /> {user?.organizationName || 'Global Operations'}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4 p-2 bg-white/5 rounded-3xl border border-white/5">
                        <div className="px-6 py-4 rounded-2xl bg-secondary-900/50 center flex-col min-w-[100px]">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500 mb-1">Security Score</span>
                            <span className="text-2xl font-black text-success-500 italic tracking-tighter">98.4</span>
                        </div>
                        <div className="px-6 py-4 rounded-2xl bg-secondary-900/50 center flex-col min-w-[100px]">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500 mb-1">Access Level</span>
                            <span className="text-2xl font-black text-primary-500 italic tracking-tighter uppercase">{userRole.charAt(0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Strategic Overview */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personnel Matrix */}
                    <div className="glass-card p-8 group">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 center text-primary-500 border border-primary-500/20 shadow-inner group-hover:rotate-12 transition-transform">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black italic tracking-tighter text-white uppercase leading-none">Strategic Overview</h3>
                                    <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest mt-1">Core personnel metadata</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary-500/30 transition-all group/item">
                                    <Mail className="w-5 h-5 text-secondary-500 group-hover/item:text-primary-500" />
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-secondary-500">Authenticated Email</p>
                                        <p className="font-bold text-white text-sm">{userEmail}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary-500/30 transition-all group/item">
                                    <UserIcon className="w-5 h-5 text-secondary-500 group-hover/item:text-primary-500" />
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-secondary-500">Asset Identity</p>
                                        <p className="font-bold text-white text-sm">{userName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary-500/30 transition-all group/item">
                                    <Shield className="w-5 h-5 text-secondary-500 group-hover/item:text-primary-500" />
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-secondary-500">Operational Role</p>
                                        <p className="font-bold text-white text-sm">{userRole}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary-500/30 transition-all group/item">
                                    <Clock className="w-5 h-5 text-secondary-500 group-hover/item:text-primary-500" />
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-secondary-500">Last Session Entry</p>
                                        <p className="font-bold text-white text-sm">{lastLogin}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary-500/30 transition-all group/item">
                                    <Calendar className="w-5 h-5 text-secondary-500 group-hover/item:text-primary-500" />
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-secondary-500">Registry Activation</p>
                                        <p className="font-bold text-white text-sm">{accountCreated}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary-500/30 transition-all group/item">
                                    <CheckCircle className="w-5 h-5 text-success-500" />
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-secondary-500">Asset Status</p>
                                        <p className="font-bold text-success-500 text-sm">ACTIVE • VERIFIED</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Hierarchy & Permissions */}
                    <div className="glass-card p-8 group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 blur-[80px] rounded-full" />
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-warning-500/10 center text-warning-500 border border-warning-500/20 shadow-inner group-hover:scale-110 transition-transform">
                                <Key className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black italic tracking-tighter text-white uppercase leading-none">Permission Cluster</h3>
                                <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest mt-1">Assigned access vectors</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {user?.roles?.map((role, idx) => (
                                <div key={role.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group/role hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                                        <div>
                                            <p className="text-sm font-black text-white italic uppercase tracking-tight">{role.name}</p>
                                            <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest mt-0.5">{role.description || 'System access level'}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="text-[9px] py-1 h-8">View Policies</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Security Protocol */}
                <div className="space-y-8">
                    <div className="glass-card p-8 border-primary-500/30 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-primary-500 center text-primary-500 bg-opacity-10 shadow-glow group-hover:rotate-[-12deg] transition-transform">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black italic tracking-tighter text-white uppercase leading-none">Security Protocol</h3>
                                <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest mt-1">Access & integrity controls</p>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {/* 2FA Toggle */}
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-4 h-4 text-primary-500" />
                                        <span className="text-sm font-black text-white uppercase tracking-tight">Two-Factor Auth</span>
                                    </div>
                                    <button
                                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                        className={`w-12 h-6 rounded-full transition-all duration-500 relative ${twoFactorEnabled ? 'bg-primary-500' : 'bg-secondary-800'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${twoFactorEnabled ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                                <p className="text-[10px] font-bold text-secondary-500 leading-relaxed uppercase tracking-widest">
                                    Adds a tactical layer of protection to your account beyond standard identification.
                                </p>
                            </div>

                            {/* Password Update Entry */}
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Key className="w-4 h-4 text-warning-500" />
                                    <span className="text-sm font-black text-white uppercase tracking-tight">Authentication Override</span>
                                </div>
                                <Button variant="primary" fullWidth size="sm" className="text-[10px] py-1 px-4 h-10 font-black uppercase tracking-widest">
                                    Initiate Password Reset
                                </Button>
                                <p className="text-[10px] font-bold text-secondary-500 leading-relaxed uppercase tracking-widest text-center">
                                    Last changed: 42 days ago
                                </p>
                            </div>

                            {/* Verification Badge */}
                            <div className="p-6 rounded-2xl bg-success-500/10 border border-success-500/20 center flex-col text-center">
                                <BadgeCheck className="w-12 h-12 text-success-500 mb-2" />
                                <h4 className="text-xs font-black text-success-500 uppercase tracking-widest mb-1">Authenticated Asset</h4>
                                <p className="text-[9px] font-bold text-success-500/70 uppercase tracking-widest">Global Registry Confirmed</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Security Events */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-4 h-4 text-secondary-500" />
                            <h4 className="text-xs font-black italic text-white uppercase tracking-widest">Tactical Audit Log</h4>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3 text-[10px] group/audit">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500/30 group-hover/audit:bg-primary-500 transition-colors" />
                                    <div className="flex-1">
                                        <p className="font-black text-secondary-400 group-hover/audit:text-white transition-colors uppercase tracking-tight">Session Entry via Web Hub</p>
                                        <p className="font-bold text-secondary-600 mt-0.5 whitespace-nowrap">Jan 07, 2026 • 09:12:44</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
