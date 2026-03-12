import { useState } from 'react';
import { ArrowRight, ChevronDown, Star } from 'lucide-react';
import Footer from '../components/Footer';
import PricingSection from '../components/PricingSection';

const languages = [
    'English'
];

export default function BibleLanding() {
    const [selectedLang, setSelectedLang] = useState(languages[0]);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-[#F4F8FD] font-sans">
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-20 pb-20 text-center px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <h4 className="text-brand-blue font-bold tracking-[0.2em] text-sm uppercase">
                            Faith • Hope • Love
                        </h4>

                        <h1 className="text-5xl md:text-7xl font-serif font-black text-[#1A2025] leading-[1.1] tracking-tight">
                            Daily <span className="text-brand-blue">Scripture</span><br />
                            In Your Hands
                        </h1>

                        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Walk in faith with daily verses, contemplative prayers, and messages of unwavering hope and grace.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 bg-white p-2 rounded-2xl shadow-lg border border-blue-100 max-w-md mx-auto relative">

                            <div className="relative w-full sm:w-auto">
                                <button
                                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                                    className="flex items-center justify-between w-full sm:w-40 px-4 py-3 text-[#1A2025] font-medium bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    {selectedLang}
                                    <ChevronDown size={18} className="text-gray-400" />
                                </button>

                                {langDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                        {languages.map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => { setSelectedLang(lang); setLangDropdownOpen(false); }}
                                                className="w-full text-left px-4 py-2 hover:bg-blue-50 text-[#1A2025] transition-colors"
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#2980B9] to-[#3498DB] hover:opacity-90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-opacity"
                            >
                                Start Journey <ArrowRight size={18} />
                            </button>

                        </div>
                    </div>
                </section>

                {/* Inherit generic PricingSection */}
                <div id="pricing" className="bg-[#F4F8FD]">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-serif font-bold text-center text-[#1A2025] mb-8">Choose Your Plan</h2>
                    </div>
                    <PricingSection autoBook="bible" />
                </div>

                {/* Verse Showcase */}
                <section className="py-24 bg-white border-y border-blue-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1A2025]">Grace in Every Word</h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-brand-blue to-transparent mx-auto mt-6"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0 mt-12 bg-[radial-gradient(ellipse_at_center,rgba(41,128,185,0.05),transparent_70%)] py-12">

                            {/* Card 1 */}
                            <div className="bg-[#FDFEFF] rounded-2xl border-2 border-blue-50 p-8 shadow-sm flex flex-col justify-center items-center text-center transform md:translate-y-8">
                                <span className="text-brand-blue font-bold tracking-widest text-xs mb-6 uppercase">Philippians 4:13</span>
                                <p className="font-serif text-2xl text-[#1A2025] italic leading-relaxed mb-6">
                                    "I can do all things through Christ who strengthens me."
                                </p>
                                <div className="w-10 h-10 rounded-full border border-blue-100 flex items-center justify-center overflow-hidden">
                                    <span className="text-2xl">🕊️</span>
                                </div>
                            </div>

                            {/* Card 2 (Center) */}
                            <div className="bg-[#FDFEFF] rounded-2xl border-2 border-brand-blue relative p-10 shadow-xl shadow-brand-blue/10 flex flex-col justify-center items-center text-center z-10 transform md:-translate-y-4">
                                <span className="text-brand-blue font-bold tracking-widest text-sm mb-6 uppercase">Jeremiah 29:11</span>
                                <p className="font-serif text-3xl font-medium text-[#1A2025] leading-snug mb-8">
                                    "For I know the plans I have for you," declares the LORD...
                                </p>
                                <p className="text-gray-500 italic">
                                    "plans to prosper you and not to harm you, plans to give you hope and a future."
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-[#FDFEFF] rounded-2xl border-2 border-blue-50 p-8 shadow-sm flex flex-col justify-center items-center text-center transform md:translate-y-8">
                                <span className="text-brand-blue font-bold tracking-widest text-xs mb-6 uppercase">Proverbs 3:5</span>
                                <p className="font-serif text-2xl text-[#1A2025] italic leading-relaxed mb-6">
                                    "Trust in the LORD with all your heart, and do not lean on your own understanding."
                                </p>
                                <div className="w-10 h-10 rounded-full border border-blue-100 flex items-center justify-center overflow-hidden">
                                    <span className="text-2xl">🌿</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-24 bg-[#F4F8FD]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-brand-blue">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#2980B9" color="#2980B9" />)}
                                </div>
                                <p className="font-serif text-lg italic text-gray-700 leading-relaxed mb-6 block">
                                    "Receiving a daily scripture beautifully presented has been the anchor to my mornings."
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">SM</div>
                                    <div>
                                        <h4 className="font-bold text-[#1A2025]">Sarah Miller</h4>
                                        <p className="text-xs text-gray-400 uppercase tracking-widest">Teacher</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-[#2980B9]">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#2980B9" color="#2980B9" />)}
                                </div>
                                <p className="font-serif text-lg italic text-gray-700 leading-relaxed mb-6 block">
                                    "The simplicity and elegance of this platform really let the eternal words speak for themselves."
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">JD</div>
                                    <div>
                                        <h4 className="font-bold text-[#1A2025]">John Davis</h4>
                                        <p className="text-xs text-gray-400 uppercase tracking-widest">Architect</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
