import { useState } from 'react';
import { ArrowRight, ChevronDown, Star } from 'lucide-react';
import Footer from '../components/Footer';
import PricingSection from '../components/PricingSection';

const languages = [
'اردو (Urdu)',
'English',
'हिन्दी (Hindi)'];


export default function QuranLanding() {
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#E8F5EE] font-sans">
            <main className="flex-1">
                {}
                <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="text-center lg:text-left space-y-6">
                                <h4 className="text-brand-green font-bold tracking-[0.2em] text-sm uppercase">
                                    Divine Revelation • Inner Peace
                                </h4>

                                <h1 className="text-5xl md:text-7xl font-serif font-black text-[#1A2520] leading-[1.1] tracking-tight">
                                    Daily <span className="text-brand-green">Quran</span><br />
                                    In Your Language
                                </h1>

                                <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                    Connect with the Divine through daily verses, profound reflections, and the path of true mindfulness, delivered beautifully every day.
                                </p>

                                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                    <div className="bg-white p-2 rounded-2xl shadow-lg border border-green-100 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                        <div className="relative w-full sm:w-auto">
                                            <button
                        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                        className="flex items-center justify-between w-full sm:w-40 px-4 py-3 text-[#1A2520] font-medium bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                        
                                                {selectedLang}
                                                <ChevronDown size={18} className="text-gray-400" />
                                            </button>

                                            {langDropdownOpen &&
                      <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                                    {languages.map((lang) =>
                        <button
                          key={lang}
                          onClick={() => {setSelectedLang(lang);setLangDropdownOpen(false);}}
                          className="w-full text-left px-4 py-2 hover:bg-green-50 text-[#1A2520] transition-colors">
                          
                                                            {lang}
                                                        </button>
                        )}
                                                </div>
                      }
                                        </div>

                                        <button
                      onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:opacity-90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-opacity">
                      
                                            Start Journey <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="relative mt-12 lg:mt-0 flex justify-center lg:justify-end">
                                <div className="bg-[#E8F5EE] p-4 md:p-6 rounded-[2rem] shadow-2xl relative w-full max-w-[480px]">
                                    <img src="/quran-landing.png" alt="Example Daily Quran Verse" className="w-full h-auto rounded-xl shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <div id="pricing" className="bg-[#F4FDF8]">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-serif font-bold text-center text-[#1A2520] mb-8">Choose Your Plan</h2>
                    </div>
                    <PricingSection autoBook="quran" />
                </div>



                {}
                <section className="py-24 bg-white border-y border-green-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1A2520]">Wisdom Meets Beauty</h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-brand-green to-transparent mx-auto mt-6"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0 mt-12 bg-[radial-gradient(ellipse_at_center,rgba(39,174,96,0.05),transparent_70%)] py-12">

                            {}
                            <div className="bg-[#FDFFFE] rounded-2xl border-2 border-green-50 p-8 shadow-sm flex flex-col justify-center items-center text-center transform md:translate-y-8">
                                <span className="text-brand-green font-bold tracking-widest text-xs mb-6 uppercase">Surah Al-Baqarah, Ayat 286</span>
                                <p className="font-serif text-2xl text-[#1A2520] italic leading-relaxed mb-6">
                                    "Allah does not burden a soul beyond that it can bear..."
                                </p>
                                <div className="w-10 h-10 rounded-full border border-green-100 flex items-center justify-center overflow-hidden">
                                    <span className="text-2xl">🌙</span>
                                </div>
                            </div>

                            {}
                            <div className="bg-[#FDFFFE] rounded-2xl border-2 border-brand-green relative p-10 shadow-xl shadow-brand-green/10 flex flex-col justify-center items-center text-center z-10 transform md:-translate-y-4">
                                <span className="text-brand-green font-bold tracking-widest text-sm mb-6 uppercase">Surah Ar-Ra'd, Ayat 28</span>
                                <p className="font-serif text-3xl font-medium text-[#1A2520] leading-snug mb-8">
                                    "اَلَا بِذِكۡرِ اللّٰهِ تَطۡمَٮِٕنُّ الۡقُلُوۡبُؕ"
                                </p>
                                <p className="text-gray-500 italic">
                                    "Unquestionably, by the remembrance of Allah hearts are assured."
                                </p>
                            </div>

                            {}
                            <div className="bg-[#FDFFFE] rounded-2xl border-2 border-green-50 p-8 shadow-sm flex flex-col justify-center items-center text-center transform md:translate-y-8">
                                <span className="text-brand-green font-bold tracking-widest text-xs mb-6 uppercase">Surah Ash-Sharh, Ayat 5</span>
                                <p className="font-serif text-2xl text-[#1A2520] italic leading-relaxed mb-6">
                                    "For indeed, with hardship [will be] ease."
                                </p>
                                <div className="w-10 h-10 rounded-full border border-green-100 flex items-center justify-center overflow-hidden">
                                    <span className="text-2xl">🪴</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {}
                <section className="py-24 bg-[#F4FDF8]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-brand-green">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#27AE60" color="#27AE60" />)}
                                </div>
                                <p className="font-serif text-lg italic text-gray-700 leading-relaxed mb-6 block">
                                    "Starting my day with a beautiful Ayah really sets a peaceful mindset for the rest of my work day."
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">ZA</div>
                                    <div>
                                        <h4 className="font-bold text-[#1A2520]">Zainab Ali</h4>
                                        <p className="text-xs text-gray-400 uppercase tracking-widest">Software Engineer</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-[#27AE60]">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#27AE60" color="#27AE60" />)}
                                </div>
                                <p className="font-serif text-lg italic text-gray-700 leading-relaxed mb-6 block">
                                    "The Arabic typography combined with meaningful English translations helps my family stay connected to our faith daily."
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">OA</div>
                                    <div>
                                        <h4 className="font-bold text-[#1A2520]">Omar Ahmed</h4>
                                        <p className="text-xs text-gray-400 uppercase tracking-widest">Business Owner</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>);

}