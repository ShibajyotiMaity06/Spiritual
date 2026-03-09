import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#138808] via-white to-[#FF9933] border border-gray-200" />
                        <Link to="/" className="font-serif text-2xl font-bold tracking-tight">DailyFaith</Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/signin" className="px-6 py-2 rounded-full border border-gray-200 text-brand-dark hover:border-gray-300 hover:bg-gray-50 transition-all font-medium">Sign In</Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-brand-dark">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-1 shadow-lg absolute w-full">
                    <div className="pt-2">
                        <Link to="/signin" className="block w-full text-center px-6 py-2 rounded-lg border border-gray-200 text-brand-dark hover:bg-gray-50 font-medium">Sign In</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
