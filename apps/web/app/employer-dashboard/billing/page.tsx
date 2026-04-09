"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { EmployerDashboardLayout } from "../../../components/employer-dashboard/employer-dashboard-layout";

export default function BillingPage() {
  const profile = useQuery(api.profile.getCurrentUserProfile)
  const subscription = useQuery(api.billing.getCurrentSubscription)
  const billingHistory = useQuery(api.billing.getBillingHistory)
  const createTransaction = useMutation(api.billing.createTransaction)
  const verifyPayment = useAction(api.billing.verifyAndUpdateSubscription)
  
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'growth' | 'enterprise' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [visibleTransactions, setVisibleTransactions] = useState(2)

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleHistoryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    
    if (scrollBottom < 10 && billingHistory && visibleTransactions < billingHistory.length) {
      setVisibleTransactions(prev => Math.min(prev + 2, billingHistory.length));
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Starter (Free Trial)',
      price: 0,
      period: '',
      description: 'Test the platform before committing',
      tagline: 'Best for: Testing the platform before committing',
      subtitle: 'Start hiring in minutes and experience how Kazicloud helps you identify top candidates instantly—without manual screening.',
      features: [
        '2 job postings (free)',
        '14-day listing duration per job',
        'Candidate ranking (see top candidates first)',
        'Custom screening questions (filter applicants automatically)',
        'Candidate analysis (quick insights on every applicant)',
        'Job shared on social media platforms',
        'Job shared on WhatsApp job channels',
      ],
      whyItWorks: [
        'Instantly see qualified candidates without sorting through hundreds of CVs',
        'Experience faster hiring before upgrading',
        'Test the system without financial commitment',
      ],
      limitations: [
        'Limited to 2 total job posts',
        'No reposting or additional credits',
        'No featured placement',
      ],
      cta: 'Test the platform. See results.',
    },
    {
      id: 'basic',
      name: 'Basic (Pay As You Hire)',
      price: 3500,
      period: '/job',
      description: 'Ideal for urgent or competitive roles',
      tagline: 'Ideal for urgent or competitive roles',
      subtitle: 'Post a job and let our system automatically rank and highlight your best candidates—so you don\'t waste time reviewing irrelevant applications.',
      features: [
        '1 job posting (30 days)',
        'Candidate ranking',
        'Custom screening questions',
        'Candidate analysis',
        'Job shared on social media platforms',
        'Job shared on WhatsApp job channels',
      ],
      whyItWorks: [
        'No subscription commitment',
        'Pay only when you need to hire',
        'Upscale based on demand',
        'Quickly identify top candidates without manual effort',
      ],
      cta: 'Post a job and Instantly Identify top candidates',
    },
    {
      id: 'growth',
      name: 'Growth (Save More As You Scale)',
      price: 7500,
      period: '/month',
      description: 'Up to 5 Jobs',
      tagline: 'Best for: SMEs and growing teams with consistent hiring',
      subtitle: 'Hire smarter every month while saving over 40% compared to Basic job postings.',
      features: [
        'Up to 5 job postings per month',
        '30-day listing duration per job',
        'Candidate ranking',
        'Custom screening questions',
        'Candidate analysis',
        'Job shared on social media platforms',
        'Job shared on WhatsApp job channels',
      ],
      whyItWorks: [
        'Lower cost per job',
        'Consistent hiring without paying per post',
        'Spend less time filtering candidates',
      ],
      cta: 'Consistent hiring at lower cost',
    },
    {
      id: 'enterprise',
      name: 'Enterprise (Hire Without Limits)',
      price: 15000,
      period: '/month',
      description: 'Unlimited Jobs',
      tagline: 'Best for: High-volume hiring, recruitment agencies, and fast-growing companies',
      subtitle: 'Post as many jobs as you need while our system helps you focus only on the most qualified candidates.',
      features: [
        'Unlimited job postings per month',
        '30-day listing duration per job',
        'Priority listing visibility (above free users)',
        'Candidate ranking',
        'Custom screening questions',
        'Candidate analysis',
        'Job shared on social media platforms',
        'Job shared on WhatsApp job channels',
      ],
      whyItWorks: [
        'No limits on hiring',
        'Predictable monthly cost',
        'Faster hiring cycles with better candidate filtering',
      ],
      cta: 'Unlimited hiring with speed and efficiency',
    },
  ]

  const handleUpgrade = async (planId: string, amount: number) => {
    if (amount === 0 || !profile?.email) return

    setIsProcessing(true)
    setSelectedPlan(planId as any)

    try {
      const reference = `${planId}_${Date.now()}`
      
      // Create transaction record
      await createTransaction({
        reference,
        plan: planId,
        amount,
        currency: 'KES',
      })

      // Initialize Paystack
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_xxx',
        email: profile.email,
        amount: amount * 100,
        currency: 'KES',
        ref: reference,
        metadata: {
          plan: planId,
          userId: profile._id,
        },
        callback: function(response: any) {
          verifyPayment({ reference: response.reference })
            .then((result) => {
              if (result.success) {
                alert('Payment successful! Your plan has been upgraded.')
                window.location.reload()
              } else {
                alert('Payment verification failed: ' + result.message)
              }
            })
            .catch((error) => {
              console.error('Verification error:', error)
              alert('Payment verification failed. Please contact support.')
            })
            .finally(() => {
              setIsProcessing(false)
              setSelectedPlan(null)
            })
        },
        onClose: function () {
          setIsProcessing(false)
          setSelectedPlan(null)
        },
      })

      handler.openIframe()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment initialization failed. Please try again.')
      setIsProcessing(false)
      setSelectedPlan(null)
    }
  }

  const currentPlan = subscription?.plan || 'free'

  return (
    <EmployerDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-text mb-2">Billing & Plans</h1>
          <p className="text-neutral-text-secondary">Manage your subscription and billing</p>
        </div>

        {/* Current Plan */}
        <div className="bg-white border border-neutral-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-text mb-4">Current Plan</h3>
          <div className="flex items-center justify-between p-4 bg-neutral-bg-secondary rounded-lg">
            <div>
              <p className="font-semibold text-neutral-text capitalize">{currentPlan} Plan</p>
              <p className="text-sm text-neutral-text-secondary">
                {subscription?.jobPostingsRemaining === -1
                  ? 'Unlimited job postings'
                  : `${subscription?.jobPostingsRemaining || 2} job posting${
                      subscription?.jobPostingsRemaining === 1 ? '' : 's'
                    } remaining`}
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              {subscription?.status || 'Active'}
            </span>
          </div>
        </div>

        {/* Available Plans */}
        <div className="bg-white border border-neutral-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-text mb-6">Choose Your Plan</h3>
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-6 flex flex-col h-full ${
                  currentPlan === plan.id
                    ? 'border-brand-orange bg-brand-orange/5'
                    : 'border-neutral-border hover:border-brand-orange/50 transition-colors'
                }`}
              >
                <div className="flex-1">
                  <div className="mb-4">
                  <h4 className="font-bold text-lg text-neutral-text mb-1">{plan.name}</h4>
                  {plan.tagline && (
                    <p className="text-xs text-neutral-text-secondary mb-3">{plan.tagline}</p>
                  )}
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-neutral-text">
                      KES {plan.price.toLocaleString()}
                    </span>
                    <span className="text-neutral-text-secondary text-sm ml-1">{plan.period}</span>
                  </div>
                  {plan.description && (
                    <p className="text-xs font-medium text-brand-orange mt-2">{plan.description}</p>
                  )}
                </div>

                {plan.subtitle && (
                  <p className="text-xs text-neutral-text-secondary mb-4 leading-relaxed">{plan.subtitle}</p>
                )}

                <div className="mb-4">
                  <p className="text-xs font-semibold text-neutral-text mb-3">What's included:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-neutral-text-secondary">
                        <svg
                          className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.whyItWorks && plan.whyItWorks.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-neutral-text mb-2">Why it works:</p>
                    <ul className="space-y-1.5">
                      {plan.whyItWorks.map((reason, index) => (
                        <li key={index} className="text-xs text-neutral-text-secondary flex items-start gap-2">
                          <span className="text-brand-orange">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {plan.limitations && plan.limitations.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs font-semibold text-neutral-text mb-2">Limitations:</p>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="text-xs text-neutral-text-secondary flex items-start gap-2">
                          <span>•</span>
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id, plan.price)}
                  disabled={currentPlan === plan.id || isProcessing}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors text-sm mt-auto ${
                    currentPlan === plan.id
                      ? 'bg-neutral-bg-secondary text-neutral-text-secondary cursor-not-allowed'
                      : isProcessing && selectedPlan === plan.id
                      ? 'bg-brand-orange/50 text-white cursor-wait'
                      : 'bg-brand-orange text-white hover:bg-brand-orange/90'
                  }`}
                >
                  {currentPlan === plan.id
                    ? '✓ Current Plan'
                    : isProcessing && selectedPlan === plan.id
                    ? 'Processing...'
                    : plan.cta || (plan.price === 0 ? 'Start Free' : 'Choose Plan')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white border border-neutral-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-text mb-6">Billing History</h3>
          {billingHistory && billingHistory.length > 0 ? (
            <div 
              className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              onScroll={handleHistoryScroll}
            >
              {billingHistory.slice(0, visibleTransactions).map((transaction) => (
                <div key={transaction._id} className="bg-neutral-bg-secondary rounded-lg p-4 border border-neutral-border">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-neutral-text capitalize">{transaction.plan} Plan</p>
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            transaction.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-neutral-text-secondary">
                        <span>{new Date(transaction.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}</span>
                        <span className="font-semibold text-neutral-text">
                          {transaction.currency} {transaction.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {visibleTransactions < billingHistory.length && (
                <div className="text-center py-2 text-sm text-neutral-text-secondary">
                  Scroll for more...
                </div>
              )}
            </div>
          ) : (
            <p className="text-neutral-text-secondary text-center py-8">No billing history yet</p>
          )}
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}
