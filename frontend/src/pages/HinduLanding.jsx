import { useState } from 'react';
import { ArrowRight, ChevronDown, Star } from 'lucide-react';
import GitaNavbar from '../components/GitaNavbar';
import Footer from '../components/Footer';
import PricingSection from '../components/PricingSection';

const languages = [
    'हिन्दी (Hindi)',
    'English',
    'தமிழ் (Tamil)',
    'తెలుగు (Telugu)',
    'മലയാളം (Malayalam)',
    'বাংলা (Bengali)'
];

export default function HinduLanding() {
    const [selectedLang, setSelectedLang] = useState(languages[0]);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-[#FCF8F2] font-sans">
            <GitaNavbar />

            <main className="flex-1 pt-24">
                {/* Hero Section */}
                <section className="relative pt-20 pb-20 text-center px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <h4 className="text-brand-saffron font-bold tracking-[0.2em] text-sm uppercase">
                            Ancient Wisdom • Modern Life
                        </h4>

                        <h1 className="text-5xl md:text-7xl font-serif font-black text-[#2A231C] leading-[1.1] tracking-tight">
                            Daily <span className="text-[#C69C6D]">Bhagavad Gita</span><br />
                            In Your Language
                        </h1>

                        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Embark on a spiritual journey with the timeless teachings of Lord Krishna, delivered to your screen daily in exquisite aesthetic cards.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 bg-white p-2 rounded-2xl shadow-lg border border-orange-100 max-w-md mx-auto relative">

                            <div className="relative w-full sm:w-auto">
                                <button
                                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                                    className="flex items-center justify-between w-full sm:w-40 px-4 py-3 text-[#2A231C] font-medium bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
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
                                                className="w-full text-left px-4 py-2 hover:bg-orange-50 text-[#2A231C] transition-colors"
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#F39C12] to-[#E67E22] hover:opacity-90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-opacity">
                                Start Journey <ArrowRight size={18} />
                            </button>

                        </div>
                    </div>
                </section>

                {/* Verse Showcase */}
                <section className="py-24 bg-white border-y border-orange-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2A231C]">Elegance Meets Divinity</h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-brand-saffron to-transparent mx-auto mt-6"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0 mt-12 bg-[radial-gradient(ellipse_at_center,rgba(243,156,18,0.05),transparent_70%)] py-12">

                            {/* Card 1 */}
                            <div className="bg-[#FFFDF9] rounded-2xl border-2 border-orange-50 p-8 shadow-sm flex flex-col justify-center items-center text-center transform md:translate-y-8">
                                <span className="text-brand-saffron font-bold tracking-widest text-xs mb-6 uppercase">Chapter 2, Verse 47</span>
                                <p className="font-serif text-2xl text-[#2A231C] italic leading-relaxed mb-6">
                                    "Your right is to work only, but never to its fruits..."
                                </p>
                                <p className="text-sm text-gray-400 mb-8 max-w-[200px]">
                                    Karmanye vadhikaraste ma phaleshu kadachana...
                                </p>
                                <div className="w-10 h-10 rounded-full border border-orange-100 flex items-center justify-center overflow-hidden">
                                    <span className="text-2xl">🦚</span>
                                </div>
                            </div>

                            {/* Card 2 (Center) */}
                            <div className="bg-[#FFFDF9] rounded-2xl border-2 border-brand-saffron relative p-10 shadow-xl shadow-brand-saffron/10 flex flex-col justify-center items-center text-center z-10 transform md:-translate-y-4">
                                <span className="text-brand-saffron font-bold tracking-widest text-sm mb-6 uppercase">अध्याय 18, श्लोक 66</span>
                                <p className="font-serif text-3xl font-medium text-[#2A231C] leading-snug mb-8">
                                    "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज..."
                                </p>
                                <p className="text-gray-500 italic">
                                    "Abandon all varieties of religion and just surrender unto Me."
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-[#FFFDF9] rounded-2xl border-2 border-orange-50 p-8 shadow-sm flex flex-col justify-center items-center text-center transform md:translate-y-8">
                                <span className="text-brand-saffron font-bold tracking-widest text-xs mb-6 uppercase">Chapter 9, Verse 22</span>
                                <p className="font-serif text-2xl text-[#2A231C] italic leading-relaxed mb-6">
                                    "To those who are constantly devoted and worship Me with love..."
                                </p>
                                <p className="text-sm text-gray-400 mb-8 max-w-[200px]">
                                    Ananyas chintayanto mam ye janah paryupasate...
                                </p>
                                <div className="w-10 h-10 rounded-full border border-orange-100 flex items-center justify-center overflow-hidden">
                                    <span className="text-2xl">🪷</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-24 bg-[#FCF8F2]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-brand-saffron">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#F39C12" color="#F39C12" />)}
                                </div>
                                <p className="font-serif text-lg italic text-gray-700 leading-relaxed mb-6 block">
                                    "The aesthetic of the cards is so calming. Starting my day with a verse in Hindi helps me stay grounded throughout my corporate meetings."
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">AS</div>
                                    <div>
                                        <h4 className="font-bold text-[#2A231C]">Anjali Sharma</h4>
                                        <p className="text-xs text-gray-400 uppercase tracking-widest">Marketing Director</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-[#C69C6D]">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#F39C12" color="#F39C12" />)}
                                </div>
                                <p className="font-serif text-lg italic text-gray-700 leading-relaxed mb-6 block">
                                    "I've tried many apps, but none capture the premium feel and spiritual depth like Daily Gita. The translation is pure and the visuals are divine."
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">RV</div>
                                    <div>
                                        <h4 className="font-bold text-[#2A231C]">Rajesh Varma</h4>
                                        <p className="text-xs text-gray-400 uppercase tracking-widest">Yoga Practitioner</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Newsletter / Opt-in */}
                <section className="py-12 bg-[#FCF8F2]">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-[#2A231C] rounded-[3rem] p-12 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4A3E31] rounded-bl-full opacity-50"></div>

                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-4xl font-serif text-brand-saffron mb-4">Join the Soulful Circle</h2>
                                <p className="text-gray-300 max-w-lg mx-auto mb-8">
                                    Receive one verse every morning at Brahma Muhurta. No ads, just wisdom.
                                </p>

                                <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                                    <input
                                        type="email"
                                        placeholder="Your email address or WhatsApp #"
                                        className="flex-1 px-6 py-4 rounded-xl bg-[#3D332A] text-white border border-[#4A3E31] focus:outline-none focus:border-brand-saffron placeholder-gray-500"
                                    />
                                    <button className="px-8 py-4 bg-brand-saffron text-white hover:bg-[#E67E22] font-bold rounded-xl transition-colors">
                                        Notify Me
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Inherit generic PricingSection */}
                <div className="bg-[#FCF8F2]">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-serif font-bold text-center text-[#2A231C] mb-8">Begin Your Practice</h2>
                    </div>
                    <PricingSection autoBook="bhagavad_gita" />
                </div>
            </main>

            <Footer />
        </div>
    );
}
