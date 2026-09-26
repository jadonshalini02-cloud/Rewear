import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Repeat,
  Leaf,
  ShieldCheck,
  Scale,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Calculator,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Droplet,
  Trees,
} from 'lucide-react';
import { SwapValueCalculatorModal } from '../../components/SwapValueCalculatorModal';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'How does clothing swapping work without money?',
    a: 'ReWear operates on a pure 1-to-1 barter exchange. You list items from your wardrobe that you no longer wear. When you find an item you like, you propose an exchange offering one of your available items. If the owner accepts, you coordinate delivery or an in-person meetup to exchange.',
  },
  {
    q: 'How is the Fair Swap Value calculated?',
    a: 'Our transparent rule-based algorithm looks at the original retail price (or category benchmark), brand tier, age, and verified garment condition (Like New, Excellent, Good, Fair). This provides an equitable rupee valuation benchmark so both swappers can see if an exchange is fair.',
  },
  {
    q: 'What if one item is worth more than the other?',
    a: 'You can still propose swaps even if there is a slight value difference. You can use the built-in negotiation chat to discuss the pieces, accept the trade as a mutual agreement, or offer an accessory to balance the value.',
  },
  {
    q: 'How should clothes be prepared before sending?',
    a: 'All garments must be freshly laundered/dry-cleaned, free of stains or odors, inspected for missing buttons/tears, and packaged securely. Transparent honesty builds community trust.',
  },
  {
    q: 'How does shipping or handover work?',
    a: 'Swappers choose between local in-person meetups (e.g., at public cafes or metro stations) or peer-to-peer couriers (e.g., Porter, Dunzo, India Post, Shiprocket). Each user covers the shipping for their outgoing parcel.',
  },
];

export const HowItWorksPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  return (
    <div className="space-y-16 pb-20">
      {/* Header */}
      <section className="bg-[#F7F4ED] py-16 border-b border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F1E8] text-[#315C3A] text-xs font-bold uppercase tracking-wider">
            <Repeat className="w-3.5 h-3.5" />
            <span>Sustainable Wardrobe Guide</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
            How ReWear Swapping Works
          </h1>
          <p className="text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about trading quality garments, calculating fair values, and reducing your personal textile footprint.
          </p>
        </div>
      </section>

      {/* The 4 Principles of ReWear */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F1E8] text-[#315C3A] flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">Zero Cash, Pure Barter</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              No subscription fees, no buyer premiums, and no seller cuts. Clothes are exchanged directly between conscious individuals who appreciate quality fashion.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">Fair Value Benchmark</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Avoid awkward pricing debates. Our transparent algorithm evaluates clothing brand prestige, age, and condition to provide an objective swap reference.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">Safe & Authentic</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Community ratings, verified swap counters, and built-in reporting tools ensure that members uphold honesty and respectful garment condition standards.
            </p>
          </div>
        </div>
      </section>

      {/* Condition Standards Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 shadow-xs space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#315C3A]">Quality Standards</span>
            <h2 className="font-serif text-3xl font-extrabold text-stone-900">Garment Condition Guide</h2>
            <p className="text-xs sm:text-sm text-stone-600">
              To keep our swap ecosystem authentic and transparent, classify all clothing using these strict criteria:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Like New
              </span>
              <h4 className="font-bold text-sm text-stone-900">Never Worn / With Tags</h4>
              <p className="text-xs text-stone-600">
                Pristine garment with no signs of wear, washed once or new with original retail tags. 100% color vibrancy.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                Excellent
              </span>
              <h4 className="font-bold text-sm text-stone-900">Gently Worn (1-3 times)</h4>
              <p className="text-xs text-stone-600">
                Flawless condition with no stains, pulls, stretching, fading, or missing hardware. Looks fresh off the rack.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Good
              </span>
              <h4 className="font-bold text-sm text-stone-900">Minor Normal Wear</h4>
              <p className="text-xs text-stone-600">
                Light, normal signs of wear or slight wash softening. No holes, tears, or noticeable blemishes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-100 border border-stone-200 space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-200 text-stone-800">
                Fair
              </span>
              <h4 className="font-bold text-sm text-stone-900">Visible Character / Vintage</h4>
              <p className="text-xs text-stone-600">
                Worn frequently, slight fading or vintage distress. All flaws must be clearly photographed and disclosed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Valuation Trigger */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#171717] text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-[#D6A756] text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Transparent Formula Engine</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold">
              Test Our Fair Swap Value Calculator
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Want to see what your jacket, dress, or vintage denim is valued at before listing? Run our interactive estimation simulator.
            </p>
          </div>

          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="px-7 py-3.5 rounded-full bg-[#315C3A] text-white text-xs sm:text-sm font-bold hover:bg-[#25472c] transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Sparkles className="w-4 h-4 text-[#D6A756]" />
            <span>Open Value Calculator</span>
          </button>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#315C3A]">Got Questions?</span>
          <h2 className="font-serif text-3xl font-extrabold text-stone-900">Frequently Asked Questions</h2>
        </div>

        <div className="divide-y divide-stone-200 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-sm font-bold text-stone-900 hover:text-[#315C3A] transition-colors cursor-pointer py-1"
                >
                  <span className="font-serif text-base">{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#315C3A]" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <SwapValueCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
};
