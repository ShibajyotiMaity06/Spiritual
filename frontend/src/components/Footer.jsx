import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white py-12 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-saffron via-brand-green to-brand-blue" />
                    <span className="font-serif text-xl font-bold tracking-tight">DailyFaith</span>
                </div>

                <div className="flex items-center space-x-6">
                    <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Terms of Service</Link>
                    <Link to="/contact" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact Us</Link>
                </div>
            </div>
        </footer>);

}