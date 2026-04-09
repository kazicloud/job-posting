"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import { Check, Download, Users, Target, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

// Declare Paystack types
declare global {
  interface Window {
    PaystackPop: any;
  }
}

const services = [
  {
    id: 1,
    title: 'Download Your ATS-Optimized CV',
    price: '$1',
    priceKes: 'KES ~150',
    badge: 'Instant & Affordable',
    bestFor: 'Candidates who want a fast, automated CV ready to apply immediately',
    features: [
      'Automated, ATS-friendly CV',
      'Highlights achievements',
      'Ready to apply immediately',
    ],
    outcome: 'Beat the bots and appear in recruiter searches quickly',
    cta: 'Download Now',
    icon: Download,
    popular: false,
  },
  {
    id: 2,
    title: 'CV Revamp – Premium Upgrade',
    price: 'KSh 3,000',
    priceKes: '',
    badge: 'Human Input for Maximum Impact',
    bestFor: 'Candidates who want a human-curated CV tailored for your top roles',
    features: [
      'Two fully curated CVs for your top 2 target roles',
      'Personalized wording and achievement framing',
      'Optimized for ATS and recruiter review',
    ],
    outcome: 'Maximizes your chances of being shortlisted for your best opportunities',
    cta: 'Upgrade to CV Revamp',
    icon: Star,
    popular: true,
  },
  {
    id: 3,
    title: 'Job Search Support',
    price: 'KSh 5,000',
    priceKes: '/month',
    badge: 'Up to 5 matching jobs',
    bestFor: 'Busy professionals seeking targeted job opportunities',
    features: [
      'Curate roles that match your skills and career goals',
      'Share your CV with our recruiter network',
      'Save time by focusing only on relevant opportunities',
    ],
    outcome: 'Targeted applications that increase your chances of interviews',
    cta: 'Start Job Search Support',
    icon: Target,
    popular: false,
  },
];

const programSessions = [
  {
    number: 1,
    title: 'Self-Assessment & Career Goal Setting',
    description: 'Identify your strengths, skills, and gaps. Clarify short- and long-term career goals.',
  },
  {
    number: 2,
    title: 'Resume & LinkedIn Profile Revamp',
    description: 'Create a tailored, ATS-optimized CV and revamp LinkedIn profile for maximum visibility.',
  },
  {
    number: 3,
    title: 'Interview Preparation',
    description: 'Role-specific mock interviews using STAR/CAR frameworks for confident responses.',
  },
  {
    number: 4,
    title: 'Job Search & Networking Strategies',
    description: 'Strategic networking tactics and advanced job search methods for faster results.',
  },
  {
    number: 5,
    title: 'Salary Negotiation & Promotion Strategy',
    description: 'Market value understanding and negotiation tactics for offers or promotions.',
  },
  {
    number: 6,
    title: 'Job Search Assistance',
    description: 'Identify best matching jobs with application strategy and recruiter engagement.',
  },
];

export default function CareerHelpPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedService, setSelectedService] = useState<{type: string, amount: number, currency: string} | null>(null);
  const [requirements, setRequirements] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const { user } = useUser();
  const createServiceOrder = useMutation(api.serviceOrders.create);
  const generateUploadUrl = useMutation(api.serviceOrders.generateUploadUrl);

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleServiceClick = (serviceType: string, amount: number, currency: string) => {
    setSelectedService({ type: serviceType, amount, currency });
    setShowOrderModal(true);
    setRequirements("");
    setUploadedFile(null);
  };

  const handleProceedToPayment = async () => {
    if (!selectedService) return;
    
    setLoading(selectedService.type);
    setShowOrderModal(false);
    
    try {
      // Check if Paystack is loaded
      if (!window.PaystackPop) {
        alert('Payment system is loading. Please try again in a moment.');
        setLoading(null);
        return;
      }

      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: 'pk_test_f34970dbb35679727cf5d1e4386c06cbb797cc75',
        email: user?.primaryEmailAddress?.emailAddress || 'user@example.com',
        amount: selectedService.amount * 100, // Convert to kobo (all amounts are now in KES)
        currency: 'KES',
        ref: `service_${selectedService.type}_${Date.now()}`,
        metadata: {
          serviceType: selectedService.type,
          originalAmount: selectedService.amount,
          originalCurrency: selectedService.currency,
        },
        callback: function(response: any) {
          // Upload file if provided
          let uploadPromise: Promise<{ storageId: any; fileName: string; } | null> = Promise.resolve(null);
          
          if (uploadedFile) {
            uploadPromise = generateUploadUrl()
              .then(async (uploadUrl) => {
                const result = await fetch(uploadUrl, {
                  method: "POST",
                  headers: { "Content-Type": uploadedFile.type },
                  body: uploadedFile,
                });
                const { storageId } = await result.json();
                return { storageId, fileName: uploadedFile.name };
              });
          }

          uploadPromise
            .then((fileData) => {
              // Create service order in Convex - always store as KES
              return createServiceOrder({
                serviceType: selectedService.type as any,
                amount: selectedService.amount,
                currency: "KES",
                paymentReference: response.reference,
                requirements: requirements || undefined,
                uploadedFileStorageId: fileData?.storageId,
                uploadedFileName: fileData?.fileName,
              });
            })
            .then((orderId) => {
              // Send admin notification
              return fetch('/api/services/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  serviceType: selectedService.type,
                  amount: selectedService.amount,
                  currency: selectedService.currency,
                  paymentReference: response.reference,
                  customerName: user?.fullName || 'Customer',
                  customerEmail: user?.primaryEmailAddress?.emailAddress || '',
                  orderId,
                }),
              });
            })
            .then(() => {
              alert('Payment successful! Service order created. You will be contacted shortly.');
              setLoading(null);
            })
            .catch((error) => {
              console.error('Failed to create order:', error);
              alert('Payment successful but failed to create order. Please contact support with reference: ' + response.reference);
              setLoading(null);
            });
        },
        onClose: function() {
          setLoading(null);
        }
      });
      
      handler.openIframe();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error initiating payment. Please try again.');
      setLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-neutral-text mb-4">
              Take Control of Your Career—
              <br />
              <span className="text-brand-orange">Fast, Smart, and Effective</span>
            </h1>
            <p className="text-lg text-neutral-text-secondary max-w-3xl mx-auto">
              From a quick CV download to our premium Career Success Program, our services are designed to get you noticed, prepared, and hired for the roles you want.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {services.map((service) => {
              const IconComponent = service.icon
              return (
                <div
                  key={service.id}
                  className={`bg-white rounded-lg border p-6 relative ${
                    service.popular ? 'border-brand-orange shadow-lg' : 'border-neutral-border'
                  }`}
                >
                  {service.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-orange text-white text-xs font-medium">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div className="text-xs font-medium text-brand-orange">{service.badge}</div>
                  </div>

                  <h3 className="text-lg font-bold text-neutral-text mb-2">{service.title}</h3>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-neutral-text">{service.price}</span>
                    {service.priceKes && (
                      <span className="text-neutral-text-secondary text-sm ml-1">{service.priceKes}</span>
                    )}
                  </div>

                  <p className="text-sm text-neutral-text-secondary mb-4">
                    <strong>Best for:</strong> {service.bestFor}
                  </p>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-neutral-text mb-2">What you get:</p>
                    <ul className="space-y-1">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-neutral-text-secondary">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4 p-3 bg-neutral-bg-secondary rounded-lg">
                    <p className="text-xs font-medium text-neutral-text mb-1">Outcome:</p>
                    <p className="text-sm text-neutral-text-secondary">{service.outcome}</p>
                  </div>

                  <button 
                    onClick={() => {
                      const serviceMap = {
                        1: { type: 'ats_cv', amount: 150, currency: 'KES' },
                        2: { type: 'cv_revamp', amount: 3000, currency: 'KES' },
                        3: { type: 'job_search_support', amount: 5000, currency: 'KES' },
                      };
                      const serviceData = serviceMap[service.id as keyof typeof serviceMap];
                      if (serviceData) {
                        handleServiceClick(serviceData.type, serviceData.amount, serviceData.currency);
                      }
                    }}
                    disabled={loading !== null}
                    className="w-full py-2.5 rounded-lg bg-brand-orange text-white font-medium hover:bg-neutral-text transition-colors text-sm disabled:opacity-50"
                  >
                    {loading === `service_${service.id}` ? 'Processing...' : service.cta}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Career Success Program */}
          <div className="bg-white rounded-lg border border-neutral-border p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-orange/10 text-brand-orange text-sm font-medium mb-3">
                <TrendingUp className="w-4 h-4" />
                Premium Engagement
              </div>
              <h2 className="text-3xl font-bold text-neutral-text mb-3">
                Career Success Program
              </h2>
              <div className="text-xl font-bold text-brand-orange mb-2">
                KSh 3,000 per session (1 hour, scaleable)
              </div>
              <p className="text-neutral-text-secondary mb-4">
                Minimum: 3 sessions (choose as needed)
              </p>
              <p className="text-neutral-text-secondary">
                <strong>Best for:</strong> Candidates who want to secure a new job, get a promotion, or negotiate a higher salary
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-neutral-bg-secondary rounded-lg p-4">
                <h3 className="font-bold text-neutral-text mb-3">Why this program works</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-neutral-text-secondary">
                    <Check className="w-4 h-4 text-green-600" />
                    Modular, outcome-focused, hands-on
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-text-secondary">
                    <Check className="w-4 h-4 text-green-600" />
                    Covers all critical steps from self-assessment to offer negotiation
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-text-secondary">
                    <Check className="w-4 h-4 text-green-600" />
                    Each session is practical, actionable, and career-result driven
                  </li>
                </ul>
              </div>

              <div className="bg-brand-orange/5 rounded-lg p-4 border border-brand-orange/20">
                <h3 className="font-bold text-neutral-text mb-3">Program Outcomes</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-neutral-text-secondary">
                    <Check className="w-4 h-4 text-brand-orange" />
                    Professionally optimized CV + LinkedIn profile
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-text-secondary">
                    <Check className="w-4 h-4 text-brand-orange" />
                    Clear career direction and strategy
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-text-secondary">
                    <Check className="w-4 h-4 text-brand-orange" />
                    Confidence to succeed in interviews and negotiations
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-text-secondary">
                    <Check className="w-4 h-4 text-brand-orange" />
                    Increased chances of landing a job, promotion, or salary increase
                  </li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-neutral-text mb-6 text-center">
                Program Structure – 6 Core Sessions
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {programSessions.map((session) => (
                  <div key={session.number} className="flex gap-3 p-4 border border-neutral-border rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {session.number}
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-text text-sm mb-1">{session.title}</h4>
                      <p className="text-xs text-neutral-text-secondary">{session.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center bg-neutral-bg-secondary rounded-lg p-6">
              <h3 className="text-xl font-bold text-neutral-text mb-4">How it Works</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="font-bold text-brand-orange mb-1">Pick Sessions</div>
                  <p className="text-sm text-neutral-text-secondary">Fully modular and flexible</p>
                </div>
                <div>
                  <div className="font-bold text-brand-orange mb-1">KSh 3,000</div>
                  <p className="text-sm text-neutral-text-secondary">Per session</p>
                </div>
                <div>
                  <div className="font-bold text-brand-orange mb-1">KSh 18,000</div>
                  <p className="text-sm text-neutral-text-secondary">Complete 6-session program</p>
                </div>
              </div>
              <p className="text-neutral-text-secondary mb-4 text-sm">Flexible scheduling to fit your pace</p>
              <button 
                onClick={() => handleServiceClick('career_coaching', 3000, 'KES')}
                disabled={loading !== null}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-orange text-white font-bold hover:bg-neutral-text transition-colors disabled:opacity-50"
              >
                {loading === 'career_coaching' ? 'Processing...' : 'Start Your Career Success Journey'}
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-neutral-text-secondary mt-3">
                Start with min 3 sessions or commit to the full program<br />
                Focused entirely on results: job offers, salary growth, and promotions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-neutral-text mb-4">Complete Your Order</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-text mb-2">
                Additional Information
                <span className="text-neutral-text-secondary font-normal ml-1">(Optional)</span>
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Tell us about your career goals, target roles, or any specific requirements..."
                className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                rows={4}
              />
            </div>

            {(selectedService.type === 'ats_cv' || selectedService.type === 'cv_revamp' || selectedService.type === 'job_search_support') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Upload Your Current CV
                  <span className="text-neutral-text-secondary font-normal ml-1">(PDF or DOCX)</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                />
                {uploadedFile && (
                  <p className="text-sm text-green-600 mt-1">✓ {uploadedFile.name}</p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 px-4 py-2.5 border border-neutral-border rounded-lg text-neutral-text hover:bg-neutral-bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToPayment}
                className="flex-1 px-4 py-2.5 bg-brand-orange text-white rounded-lg hover:bg-neutral-text transition-colors font-medium"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
