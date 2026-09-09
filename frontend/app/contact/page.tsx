"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] dark:bg-[#0b1120] py-12 sm:py-16 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
            Customer Support
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Get in Touch
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
            Have questions regarding an order, products, or partnerships? We&apos;re here to help 24/7.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Contact Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                    📧
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400">Email Us</h3>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">support@myshop.com</p>
                    <p className="text-xs text-slate-500">Response within 2 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                    📞
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400">Phone Support</h3>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">+855 23 999 888</p>
                    <p className="text-xs text-slate-500">Mon-Fri from 8am to 6pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                    📍
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400">Main Office</h3>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">Phnom Penh, Cambodia</p>
                    <p className="text-xs text-slate-500">Express delivery center</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick FAQ summary */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Looking for your order?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                You can track your package and view status receipts directly in your order history.
              </p>
              <div className="pt-1">
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Go to My Orders &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-sm">
              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-fade-in">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-3xl text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    ✓
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Message Sent!</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                    Thank you for reaching out. Our support specialists will get back to you shortly at <span className="font-bold text-slate-800 dark:text-slate-200">{formData.email}</span>.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: "", email: "", subject: "", message: "" });
                      }}
                      className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 text-xs font-bold hover:opacity-90 transition active:scale-95"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Send Us a Message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-2.5 text-xs font-medium outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-2.5 text-xs font-medium outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Question about order delivery"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-2.5 text-xs font-medium outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Message</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Write your message or inquiry here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 p-4 text-xs font-medium outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 py-3.5 px-6 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all active:scale-98 disabled:opacity-50"
                  >
                    {loading ? "Sending Message..." : "Submit Inquiry →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}