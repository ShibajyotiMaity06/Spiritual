import { Check } from 'lucide-react';

const plans = [
    {
        name: '7-Day Free Trial',
        price: '₹0',
        period: 'for 7 days',
        description: 'Experience the premium journey for 7 days before deciding.',
        features: [
            'Daily verse via WhatsApp',
            'Full audio explanations',
            'Daily email with beautiful template',
            'No credit card required'
        ],
        buttonText: 'Start Free Trial',
        buttonVariant: 'outline'
    },
    {
        name: 'Basic',
        price: '₹49',
        period: '/month',
        description: 'Guaranteed auto-delivery of daily verses and reflections.',
        features: [
            'AUTO-DELIVERY at chosen time',
            'Daily email with beautiful template',
            'Weekend reflection questions',
            'Streak counter & gamification'
        ],
        buttonText: 'Subscribe Basic',
        buttonVariant: 'secondary'
    },
    {
        name: 'Premium Monthly',
        price: '₹149',
        period: '/month',
        description: 'Deep dive into scriptures with auto-delivery and audio.',
        features: [
            'Everything in Basic',
            'Daily audio explanation (60-90 sec)',
            'Chapter-wise deep dives (weekly)',
            'PDF downloads of full chapters',
            'Ad-free experience'
        ],
        buttonText: 'Subscribe Monthly',
        buttonVariant: 'secondary',
    },
    {
        name: 'Premium Yearly',
        price: '₹1599',
        period: '/year',
        description: 'Uninterrupted spiritual journey for a full year with savings.',
        features: [
            'Everything in Monthly',
            'Save over ₹180 annually',
            'Priority support',
            'Early access to new features',
            'Exclusive community access'
        ],
        buttonText: 'Subscribe Yearly',
        buttonVariant: 'primary',
        popular: true
    }
];

export default function PricingSection() {
    return (
        <section className="py-24 bg-white" id="pricing">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-serif font-bold text-gray-900 sm:text-4xl mb-4">Simple, transparent pricing</h2>
                    <p className="text-lg text-gray-600">Choose the plan that best supports your spiritual journey. Note: Free trials end after 7 days.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col p-8 rounded-3xl border ${plan.popular ? 'border-[#FF9933] shadow-xl shadow-[#FF9933]/10 ring-1 ring-[#FF9933]' : 'border-gray-200'} bg-white`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                                    <span className="bg-[#FF9933] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        Best Value
                                    </span>
                                </div>
                            )}
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                <p className="mt-2 text-sm text-gray-500 min-h-[40px]">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                                <span className="text-gray-500 font-medium">{plan.period}</span>
                            </div>

                            <ul className="mb-8 flex-1 space-y-4">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-gray-600">
                                        <Check className="h-5 w-5 text-[#138808] shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${plan.buttonVariant === 'primary'
                                    ? 'bg-[#FF9933] text-white hover:bg-[#E68A2E] shadow-md hover:shadow-lg'
                                    : plan.buttonVariant === 'secondary'
                                        ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-md'
                                        : 'bg-white text-brand-dark border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
