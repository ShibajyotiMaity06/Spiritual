import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function GitaNavbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="absolute top-0 w-full z-50 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-24">
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-saffron flex items-center justify-center text-white font-bold text-xl pb-1">
                            ॐ
                        </div>
                        <Link to="/gita" className="font-serif text-2xl font-bold tracking-tight text-gray-900">DailyGita</Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/gita/wisdom" className="text-gray-800 hover:text-brand-saffron font-medium uppercase tracking-wider text-sm transition-colors">Wisdom</Link>
                        <Link to="/gita/features" className="text-gray-800 hover:text-brand-saffron font-medium uppercase tracking-wider text-sm transition-colors">Features</Link>
                        <Link to="/gita/community" className="text-gray-800 hover:text-brand-saffron font-medium uppercase tracking-wider text-sm transition-colors">Community</Link>
                        <Link to="#pricing" className="px-8 py-3 rounded-full bg-[#2A231C] text-white hover:bg-black transition-all font-medium text-sm">Subscribe</Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800 hover:text-brand-saffron">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-[#FFF9F5] border-b border-gray-200 px-4 pt-2 pb-6 space-y-2 shadow-xl absolute w-full">
                    <Link to="/gita/wisdom" className="block px-4 py-3 text-base font-medium text-gray-800 hover:text-brand-saffron hover:bg-orange-50 rounded-lg">Wisdom</Link>
                    <Link to="/gita/features" className="block px-4 py-3 text-base font-medium text-gray-800 hover:text-brand-saffron hover:bg-orange-50 rounded-lg">Features</Link>
                    <Link to="/gita/community" className="block px-4 py-3 text-base font-medium text-gray-800 hover:text-brand-saffron hover:bg-orange-50 rounded-lg">Community</Link>
                    <div className="pt-4">
                        <Link to="#pricing" className="block w-full text-center px-6 py-3 rounded-xl bg-[#2A231C] text-white hover:bg-black font-medium">Subscribe</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
