import { useState, useEffect } from 'react';
import { X, Clock, Mail, MessageCircle, Loader2, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const books = [
    { id: 'bhagavad_gita', label: 'Bhagavad Gita', religion: 'hindu', icon: '🙏', color: 'border-orange-300 bg-orange-50' },
    { id: 'quran', label: 'Quran', religion: 'muslim', icon: '☪️', color: 'border-green-300 bg-green-50' },
    { id: 'bible', label: 'Bible', religion: 'christian', icon: '✝️', color: 'border-blue-300 bg-blue-50' },
];

const languages = [
    { id: 'hindi', label: 'Hindi' },
    { id: 'english', label: 'English' },
];

const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = i + 5; // 5 AM to 10 PM
    const label = hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
    return { value: hour, label };
});

export default function SubscribeModal({ isOpen, onClose, plan, autoBook }) {
    const [step, setStep] = useState(1);
    const [selectedBook, setSelectedBook] = useState(autoBook || '');
    const [selectedLang, setSelectedLang] = useState('hindi');
    const [selectedTime, setSelectedTime] = useState(7);
    const [deliveryChannel, setDeliveryChannel] = useState('email');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedBook(autoBook || '');
            setSelectedLang('hindi');
            setSelectedTime(7);
            setDeliveryChannel('email');
            setName('');
            setEmail('');
            setWhatsappNumber('');
            setLoading(false);
            setSuccess(false);
            setError('');

            // If book is auto-selected, skip to step 2
            if (autoBook) {
                setStep(2);
            }
        }
    }, [isOpen, autoBook]);

    if (!isOpen) return null;

    // Plan config
    const isFreeOrBasic = plan?.id === 'free' || plan?.id === 'basic_monthly';
    const canChooseTime = !isFreeOrBasic; // Free & Basic = fixed 7 AM
    const canChooseChannel = !isFreeOrBasic; // Free & Basic = email only

    const getReligionFromBook = (bookId) => {
        const book = books.find(b => b.id === bookId);
        return book ? book.religion : 'hindu';
    };

    const handleSubmit = async () => {
        setError('');

        // Validation
        if (!name.trim()) return setError('Please enter your name');
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email');
        if (!selectedBook) return setError('Please select a book');
        if (deliveryChannel === 'whatsapp' && (!whatsappNumber || whatsappNumber.length < 10)) {
            return setError('Please enter a valid WhatsApp number');
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    book: selectedBook,
                    religion: getReligionFromBook(selectedBook),
                    language: selectedLang,
                    preferredTime: isFreeOrBasic ? 7 : selectedTime,
                    deliveryChannel: isFreeOrBasic ? 'email' : deliveryChannel,
                    whatsappNumber: deliveryChannel === 'whatsapp' ? whatsappNumber : null,
                    planId: plan?.id || 'free',
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Book selection (only if no autoBook)
    const renderBookSelection = () => (
        <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-gray-900 text-center">Choose Your Sacred Text</h3>
            <p className="text-sm text-gray-500 text-center">Select the scripture you'd like to receive daily</p>
            <div className="grid grid-cols-1 gap-3 mt-6">
                {books.map((book) => (
                    <button
                        key={book.id}
                        onClick={() => { setSelectedBook(book.id); setStep(2); }}
                        disabled={book.id !== 'bhagavad_gita'}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedBook === book.id
                            ? 'border-brand-saffron bg-orange-50 shadow-sm'
                            : book.id === 'bhagavad_gita'
                                ? 'border-gray-200 hover:border-gray-300 bg-white'
                                : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            }`}
                    >
                        <span className="text-3xl">{book.icon}</span>
                        <div>
                            <span className="font-semibold text-gray-900">{book.label}</span>
                            {book.id !== 'bhagavad_gita' && (
                                <p className="text-xs text-gray-400 mt-0.5">Coming soon</p>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    // Step 2: Details form
    const renderDetailsForm = () => (
        <div className="space-y-5">
            <h3 className="text-xl font-serif font-bold text-gray-900 text-center">
                {plan?.name || 'Free Trial'} — Setup
            </h3>
            <p className="text-sm text-gray-500 text-center">
                {plan?.id === 'free'
                    ? '3-day free trial · Daily verse at 7:00 AM via Email'
                    : plan?.id === 'basic_monthly'
                        ? '₹49/month · Daily verse at 7:00 AM via Email'
                        : `${plan?.price || '₹0'}${plan?.period || ''} · Choose your preferences`
                }
            </p>

            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron transition-all"
                />
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron transition-all"
                />
            </div>

            {/* Language */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <div className="flex gap-3">
                    {languages.map(lang => (
                        <button
                            key={lang.id}
                            onClick={() => setSelectedLang(lang.id)}
                            className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${selectedLang === lang.id
                                ? 'border-brand-saffron bg-orange-50 text-brand-saffron'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Time Selection (only for ₹99+ plans) */}
            {canChooseTime ? (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Clock size={14} className="inline mr-1" /> Preferred Delivery Time
                    </label>
                    <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron bg-white transition-all"
                    >
                        {timeSlots.map(slot => (
                            <option key={slot.value} value={slot.value}>{slot.label}</option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                    <Clock size={16} className="text-amber-600" />
                    <span className="text-sm text-amber-700">Delivery time is fixed at <strong>7:00 AM IST</strong></span>
                </div>
            )}

            {/* Delivery Channel (only for ₹99+ plans) */}
            {canChooseChannel ? (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method</label>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeliveryChannel('email')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${deliveryChannel === 'email'
                                ? 'border-brand-saffron bg-orange-50 text-brand-saffron'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            <Mail size={16} /> Email
                        </button>
                        <button
                            onClick={() => setDeliveryChannel('whatsapp')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${deliveryChannel === 'whatsapp'
                                ? 'border-green-500 bg-green-50 text-green-600'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            <MessageCircle size={16} /> WhatsApp
                        </button>
                    </div>

                    {deliveryChannel === 'whatsapp' && (
                        <input
                            type="tel"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            placeholder="+91 9876543210"
                            className="w-full mt-3 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                        />
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
                    <Mail size={16} className="text-blue-600" />
                    <span className="text-sm text-blue-700">Delivery via <strong>Email only</strong> on this plan</span>
                </div>
            )}

            {/* Selected Book Display */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-xl">{books.find(b => b.id === selectedBook)?.icon || '📖'}</span>
                <div>
                    <p className="text-sm font-medium text-gray-700">{books.find(b => b.id === selectedBook)?.label || 'Book'}</p>
                    <p className="text-xs text-gray-400">Selected sacred text</p>
                </div>
                {!autoBook && (
                    <button
                        onClick={() => setStep(1)}
                        className="ml-auto text-xs text-brand-saffron hover:underline"
                    >
                        Change
                    </button>
                )}
            </div>

            {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                    {error}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#F39C12] to-[#E67E22] hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" /> Processing...
                    </>
                ) : plan?.id === 'free' ? (
                    'Start Free Trial 🙏'
                ) : plan?.id === 'basic_monthly' ? (
                    'Subscribe for ₹49/month'
                ) : (
                    `Subscribe — ${plan?.price || '₹0'}${plan?.period || ''}`
                )}
            </button>
        </div>
    );

    // Success Screen
    const renderSuccess = () => (
        <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-gray-900">
                {plan?.id === 'free' ? 'Trial Started! 🎉' : 'Subscription Confirmed! 🎉'}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
                {plan?.id === 'free'
                    ? 'Your 3-day free trial has started. Check your email — your first verse is on its way!'
                    : plan?.id === 'basic_monthly'
                        ? 'Thank you! Your subscription request has been received. You will start receiving daily verses at 7:00 AM via email shortly.'
                        : 'Your subscription is being set up. You will receive a confirmation email soon.'
                }
            </p>
            <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all"
            >
                Got it!
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={18} className="text-gray-400" />
                </button>

                {success ? renderSuccess() : step === 1 ? renderBookSelection() : renderDetailsForm()}
            </div>
        </div>
    );
}
