import { useState } from 'react';
import { Check } from 'lucide-react';
import SubscribeModal from './SubscribeModal';

const plans = [
{
  id: 'free',
  name: 'Free Trial',
  price: '₹0',
  period: '(3 days)',
  description: 'Try daily verses free for 3 days via email.',
  deliveryChannel: 'Email only',
  audio: false,
  features: [
  'Daily verse via Email',
  '3-day free trial',
  'Fixed delivery at 7 AM',
  'No credit card required'],

  buttonText: 'Start Free Trial',
  buttonVariant: 'outline'
},
{
  id: 'basic_monthly',
  name: 'Basic',
  price: '₹49',
  period: '/mo',
  description: 'Daily verses with auto-delivery via email.',
  deliveryChannel: 'Email only',
  audio: false,
  features: [
  'Daily verse via Email',
  'Auto-delivery at 7 AM',
  'Beautiful HTML template',
  'Streak counter'],

  buttonText: 'Subscribe Basic',
  buttonVariant: 'secondary'
},
{
  id: 'standard_monthly',
  name: 'Standard',
  price: '₹99',
  period: '/mo',
  description: 'Choose WhatsApp or Email with audio.',
  deliveryChannel: 'WhatsApp or Email',
  audio: true,
  features: [
  'WhatsApp OR Email',
  'Pick your delivery time',
  'Daily audio explanation',
  'Streak & gamification'],

  buttonText: 'Subscribe Standard',
  buttonVariant: 'secondary'
},
{
  id: 'premium_monthly',
  name: 'Premium',
  price: '₹149',
  period: '/mo',
  description: 'Full experience with deep dives & audio.',
  deliveryChannel: 'WhatsApp or Email',
  audio: true,
  features: [
  'Everything in Standard',
  'Chapter-wise deep dives',
  'Daily life application',
  'Priority support'],

  buttonText: 'Subscribe Premium',
  buttonVariant: 'secondary'
},
{
  id: 'premium_yearly',
  name: 'Yearly',
  price: '₹1,599',
  period: '/yr',
  description: 'Best value — full year of spiritual growth.',
  deliveryChannel: 'WhatsApp or Email',
  audio: true,
  features: [
  'Everything in Premium',
  'Save ₹180+ annually',
  'Exclusive community',
  'Priority support'],

  buttonText: 'Subscribe Yearly',
  buttonVariant: 'primary',
  popular: true
}];


export default function PricingSection({ autoBook }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePlanClick = (plan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <>
            <section className="py-24 bg-white" id="pricing">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 sm:text-4xl mb-4">Simple, transparent pricing</h2>
                        <p className="text-lg text-gray-600">Choose the plan that best supports your spiritual journey.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch">
                        {plans.map((plan) =>
            <div
              key={plan.id}
              className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${plan.popular ?
              'border-[#FF9933] shadow-xl shadow-[#FF9933]/10 ring-1 ring-[#FF9933]' :
              'border-gray-200'} bg-white`
              }>
              
                                {plan.popular &&
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                                        <span className="bg-[#FF9933] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                            Best Value
                                        </span>
                                    </div>
              }
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                                    <p className="mt-1 text-xs text-gray-500 min-h-[32px]">{plan.description}</p>
                                </div>

                                <div className="mb-3">
                                    <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                                    <span className="text-gray-500 font-medium text-sm">{plan.period}</span>
                                </div>

                                {}
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                                        📧 {plan.deliveryChannel}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${plan.audio && autoBook !== 'bible' ?
                'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-400'}`
                }>
                                        {plan.audio && autoBook !== 'bible' ? '🔊 Audio' : '🔇 No Audio'}
                                    </span>
                                </div>

                                <ul className="mb-6 flex-1 space-y-3">
                                    {plan.features.map((feature, idx) =>
                <li key={idx} className="flex gap-2 text-xs text-gray-600">
                                            <Check className="h-4 w-4 text-[#138808] shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                )}
                                </ul>

                                <button
                onClick={() => handlePlanClick(plan)}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all text-sm ${plan.buttonVariant === 'primary' ?
                'bg-[#FF9933] text-white hover:bg-[#E68A2E] shadow-md hover:shadow-lg' :
                plan.buttonVariant === 'secondary' ?
                'bg-gray-900 text-white hover:bg-gray-800 shadow-md' :
                'bg-white text-brand-dark border border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
                }>
                
                                    {plan.buttonText}
                                </button>
                            </div>
            )}
                    </div>
                </div>
            </section>

            <SubscribeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        plan={selectedPlan}
        autoBook={autoBook || null} />
      
        </>);

}