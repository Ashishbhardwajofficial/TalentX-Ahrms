import React, { useState } from 'react';
import {
    ShieldCheck,
    IndianRupee,
    FileText,
    Plus,
    Trash2,
    Save,
    AlertCircle,
    TrendingUp,
    History,
    Info
} from 'lucide-react';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/format';

interface DeclarationItem {
    id: string;
    category: string;
    description: string;
    amount: number;
    maxLimit?: number;
}

const TaxDeclarationPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
    const [declarations, setDeclarations] = useState<DeclarationItem[]>([
        { id: '1', category: 'Section 80C', description: 'Life Insurance Premium', amount: 50000, maxLimit: 150000 },
        { id: '2', category: 'Section 80C', description: 'Public Provident Fund (PPF)', amount: 25000, maxLimit: 150000 },
        { id: '3', category: 'Section 80D', description: 'Medical Insurance (Self/Family)', amount: 15000, maxLimit: 25000 },
    ]);

    const [hraDetails, setHraDetails] = useState({
        monthlyRent: 20000,
        landlordName: '',
        landlordPan: '',
        isMetro: true
    });

    const total80C = declarations
        .filter(d => d.category === 'Section 80C')
        .reduce((sum, d) => sum + d.amount, 0);

    const handleAddDeclaration = () => {
        const newItem: DeclarationItem = {
            id: Math.random().toString(36).substr(2, 9),
            category: 'Section 80C',
            description: '',
            amount: 0
        };
        setDeclarations([...declarations, newItem]);
    };

    const handleRemoveDeclaration = (id: string) => {
        setDeclarations(declarations.filter(d => d.id !== id));
    };

    const handleUpdateAmount = (id: string, amount: number) => {
        setDeclarations(declarations.map(d => d.id === id ? { ...d, amount } : d));
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-secondary-900 tracking-tight flex items-center gap-3">
                        <ShieldCheck className="w-10 h-10 text-primary-600" />
                        Tax Declaration
                    </h1>
                    <p className="text-secondary-500 font-medium">Financial Year 2025-26 (Assessment Year 2026-27)</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl shadow-soft border border-secondary-100">
                    <button
                        onClick={() => setActiveTab('current')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'current' ? 'bg-primary-600 text-white shadow-lg' : 'text-secondary-500 hover:text-primary-600'
                            }`}
                    >
                        <History className="w-4 h-4 inline-block mr-2" />
                        Current Declaration
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'history' ? 'bg-primary-600 text-white shadow-lg' : 'text-secondary-500 hover:text-primary-600'
                            }`}
                    >
                        <History className="w-4 h-4 inline-block mr-2" />
                        Previous Submissions
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* 80C Section */}
                    <div className="premium-card p-6 md:p-8 group shadow-xl">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 center shadow-soft group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-secondary-900 tracking-tight">Section 80C Investments</h3>
                                    <p className="text-xs font-black uppercase tracking-widest text-secondary-400">Deduction up to ₹1,50,000</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                icon={<Plus className="w-4 h-4" />}
                                onClick={handleAddDeclaration}
                            >
                                Add Item
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {declarations.filter(d => d.category === 'Section 80C').map((item) => (
                                <div key={item.id} className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-xl border border-secondary-100 group/item hover:border-primary-200 transition-all">
                                    <div className="flex-1 w-full">
                                        <input
                                            type="text"
                                            placeholder="e.g., PPF, LIC, ELSS"
                                            defaultValue={item.description}
                                            className="w-full bg-transparent border-none focus:ring-0 font-bold text-secondary-700 placeholder:text-secondary-300"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                                            <input
                                                type="number"
                                                value={item.amount}
                                                onChange={(e) => handleUpdateAmount(item.id, Number(e.target.value))}
                                                className="pl-9 pr-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-bold text-secondary-700 w-32"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleRemoveDeclaration(item.id)}
                                            className="p-2 text-secondary-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Subtotal 80C */}
                        <div className="mt-8 flex justify-between items-center p-4 bg-primary-50/50 rounded-xl border border-primary-100">
                            <span className="font-bold text-primary-900 uppercase tracking-wider text-sm">Total 80C Declared</span>
                            <div className="text-right">
                                <span className={`text-2xl font-black ${total80C > 150000 ? 'text-red-500' : 'text-primary-600'}`}>
                                    {formatCurrency(total80C, 'INR')}
                                </span>
                                {total80C > 150000 && (
                                    <p className="text-[10px] text-red-500 font-bold uppercase mt-1">Exceeds Limit of ₹1,50,000</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* HRA Section */}
                    <div className="premium-card p-6 md:p-8 group shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 center shadow-soft group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-secondary-900 tracking-tight">House Rent Allowance (HRA)</h3>
                                <p className="text-xs font-black uppercase tracking-widest text-secondary-400">Rent Paid Details</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-secondary-600 uppercase tracking-wider">Monthly Rent</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                                    <input
                                        type="number"
                                        value={hraDetails.monthlyRent}
                                        onChange={(e) => setHraDetails({ ...hraDetails, monthlyRent: Number(e.target.value) })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-bold text-secondary-700"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-secondary-600 uppercase tracking-wider">City Type</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-bold text-secondary-700"
                                    value={hraDetails.isMetro ? 'metro' : 'non-metro'}
                                    onChange={(e) => setHraDetails({ ...hraDetails, isMetro: e.target.value === 'metro' })}
                                >
                                    <option value="metro">Metro (Delhi, Mumbai, Kolkata, Chennai)</option>
                                    <option value="non-metro">Non-Metro City</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-secondary-600 uppercase tracking-wider">Landlord Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-bold text-secondary-700"
                                    placeholder="As per rent agreement"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-secondary-600 uppercase tracking-wider">Landlord PAN</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-bold text-secondary-700"
                                    placeholder="Required if annual rent > ₹1 Lakh"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-8">
                    <div className="premium-card p-6 border-primary-500 bg-primary-600 text-white shadow-primary-200 shadow-2xl">
                        <h4 className="text-lg font-black uppercase tracking-widest mb-6 border-b border-primary-400/50 pb-4">Tax Summary</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center opacity-80">
                                <span className="font-bold">Total Investments</span>
                                <span className="font-black">{formatCurrency(total80C, 'INR')}</span>
                            </div>
                            <div className="flex justify-between items-center opacity-80 border-b border-primary-400/30 pb-4">
                                <span className="font-bold">HRA (Est. Deduction)</span>
                                <span className="font-black">₹45,000</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xl font-black uppercase tracking-tighter">Total Benefit</span>
                                <span className="text-2xl font-black">{formatCurrency(total80C + 45000, 'INR')}</span>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full mt-8 bg-white text-primary-600 border-none hover:bg-slate-50 py-4 text-lg"
                            icon={<Save className="w-5 h-5" />}
                        >
                            Submit Declaration
                        </Button>
                        <p className="text-[10px] mt-4 opacity-60 text-center font-bold">LATEST UPDATED ON {new Date().toLocaleDateString('en-IN')}</p>
                    </div>

                    <div className="premium-card p-6 bg-white shadow-xl">
                        <div className="flex items-center gap-3 mb-4 text-amber-600">
                            <AlertCircle className="w-5 h-5 font-black" />
                            <h4 className="font-black uppercase tracking-wider text-sm">Important Note</h4>
                        </div>
                        <p className="text-sm text-secondary-500 font-medium leading-relaxed">
                            Please ensure all declared investments are supported by valid documents.
                            Proof submission window will open from Jan 1st to Feb 15th, 2026.
                        </p>
                        <div className="mt-6 flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-secondary-100 italic font-medium text-xs text-secondary-400">
                            <Info className="w-4 h-4 shrink-0 text-primary-500" />
                            Declaration helps in reducing monthly TDS (Tax Deducted at Source).
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxDeclarationPage;
