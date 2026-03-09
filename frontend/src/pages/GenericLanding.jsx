import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Moon, Cross } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PricingSection from '../components/PricingSection';

export default function GenericLanding() {
    return (
        <div className="min-h-screen flex flex-col bg-brand-light font-sans">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-20 pb-24 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/15 via-white to-[#138808]/15" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mask-image:linear-gradient(to_bottom,white,transparent)"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center pt-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-800 text-xs font-bold uppercase tracking-widest mb-8">
                            <span className="w-2 h-2 rounded-full bg-[#FF9933]"></span>
                            Harmonizing Souls
                            <span className="w-2 h-2 rounded-full bg-[#138808]"></span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-serif font-medium text-gray-900 tracking-tight leading-tight mb-6">
                            Start Your Daily <br /><span className="italic text-brand-dark font-serif font-light">Spiritual Journey</span>
                        </h1>

                        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            A sanctuary for the soul. Explore wisdom, find inner peace, and connect with your faith through our curated daily practices tailored for your path.
                        </p>
                    </div>
                </section>

                {/* Path Selection Section */}
                <section className="py-12 pb-24 relative z-10 -mt-10">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Hinduism Card */}
                        <div className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-2xl bg-brand-saffron-light flex items-center justify-center mb-6 text-brand-saffron group-hover:scale-110 transition-transform duration-300">
                                <BookOpen size={40} className="stroke-1" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Hinduism</h3>
                            <p className="text-gray-500 mb-8 flex-1 leading-relaxed">
                                Embrace the timeless wisdom of the Vedas and find your Dharma through daily meditation and mantras.
                            </p>
                            <Link to="/gita" className="w-full py-4 text-brand-dark bg-gray-50 group-hover:bg-brand-saffron group-hover:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                                Explore Path <ArrowRight size={18} />
                            </Link>
                        </div>

                        {/* Islam Card */}
                        <div className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-2xl bg-brand-green-light flex items-center justify-center mb-6 text-brand-green group-hover:scale-110 transition-transform duration-300">
                                <Moon size={40} className="stroke-1" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Islam</h3>
                            <p className="text-gray-500 mb-8 flex-1 leading-relaxed">
                                Connect with the Divine through daily prayers, Quranic reflections, and the path of mindfulness.
                            </p>
                            <Link to="/quran" className="w-full py-4 text-brand-dark bg-gray-50 group-hover:bg-brand-green group-hover:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                                Explore Path <ArrowRight size={18} />
                            </Link>
                        </div>

                        {/* Christianity Card */}
                        <div className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-2xl bg-brand-blue-light flex items-center justify-center mb-6 text-brand-blue group-hover:scale-110 transition-transform duration-300">
                                <Cross size={40} className="stroke-1" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Christianity</h3>
                            <p className="text-gray-500 mb-8 flex-1 leading-relaxed">
                                Walk in faith with daily scriptures, contemplative prayers, and messages of hope and grace.
                            </p>
                            <Link to="/bible" className="w-full py-4 text-brand-dark bg-gray-50 group-hover:bg-brand-blue group-hover:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                                Explore Path <ArrowRight size={18} />
                            </Link>
                        </div>

                    </div>
                </section>

                {/* Pricing Section */}
                <PricingSection />
            </main>

            <Footer />
        </div>
    );
}
