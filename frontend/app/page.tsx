'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Braces,
  Code2,
  FileDown,
  ListChecks,
  Save,
  Sparkles,
  Shield,
  Workflow,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const features: {
  title: string;
  body: string;
  icon: LucideIcon;
  iconClass: string;
}[] = [
  {
    title: 'Conditional logic',
    body: 'Branch on answers with 10 operators. Preview the path before you publish.',
    icon: Workflow,
    iconClass: 'from-violet-500/15 to-violet-600/5 text-violet-600 ring-violet-200/50',
  },
  {
    title: 'Typeform-style filler',
    body: 'One question at a time, progress, back/next, and Enter to continue.',
    icon: ListChecks,
    iconClass: 'from-brand-500/15 to-brand-600/5 text-brand-600 ring-brand-200/50',
  },
  {
    title: 'Draft & resume',
    body: 'Responses save as you go. Return anytime and continue where you left off.',
    icon: Save,
    iconClass: 'from-sky-500/15 to-sky-600/5 text-sky-600 ring-sky-200/50',
  },
  {
    title: 'JSON you own',
    body: 'Schema travels with the form. Version, diff, or import like configuration.',
    icon: Braces,
    iconClass: 'from-amber-500/15 to-amber-600/5 text-amber-700 ring-amber-200/50',
  },
  {
    title: 'CSV exports',
    body: 'Admins download every field as CSV — ready for sheets or a warehouse.',
    icon: FileDown,
    iconClass: 'from-emerald-500/15 to-emerald-600/5 text-emerald-700 ring-emerald-200/50',
  },
  {
    title: 'Modern stack',
    body: 'Next.js 15, React, Tailwind v4, Mongo, JWT — ship and iterate fast.',
    icon: Code2,
    iconClass: 'from-slate-500/20 to-slate-600/5 text-slate-700 ring-slate-200/60',
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto min-w-0 max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
        <div className="min-w-0">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-white/60 px-3.5 py-1 text-sm font-medium text-brand-800 shadow-sm ring-1 ring-slate-200/40 backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden />
            Built for product teams
          </span>
          <h1 className="mt-5 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.6rem]">
            Logic-driven forms,{' '}
            <span className="bg-linear-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              without
            </span>{' '}
            the enterprise tax.
          </h1>
          <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
            Design Typeform-style flows, ship public links, and let respondents save drafts — with a
            clean schema and admin-only exports.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="group inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-linear-to-b from-brand-500 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-xl hover:shadow-indigo-500/30"
            >
              Get started
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 px-6 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200/50 backdrop-blur transition hover:border-slate-300 hover:bg-white"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="relative min-w-0">
          <div
            className="absolute -inset-4 rounded-4xl bg-linear-to-br from-indigo-300/20 via-violet-200/15 to-transparent blur-2xl"
            aria-hidden
          />
          <div
            className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_20px_50px_-12px_rgba(79,70,229,0.2)] ring-1 ring-slate-200/40 backdrop-blur-md sm:p-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="h-1.5 w-full max-w-[38%] overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full w-1/3 rounded-full bg-linear-to-r from-brand-500 to-indigo-500"
                />
              </div>
              <span className="shrink-0 text-xs font-medium text-slate-500">Preview</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Question 2 of 6
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Which role are you applying for?
            </h3>
            <p className="mt-1 text-sm text-slate-500">Your answer decides what we ask next.</p>
            <div className="mt-5 space-y-2.5">
              {['Frontend Engineer', 'Backend Engineer', 'Full-stack Engineer', 'Something else'].map(
                (label, i) => (
                  <div
                    key={label}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors',
                      i === 2
                        ? 'border-brand-400/60 bg-linear-to-b from-brand-50 to-indigo-50/80 text-slate-900 ring-1 ring-brand-200/50'
                        : 'border-slate-200/80 bg-white/60 text-slate-700'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full border',
                        i === 2 ? 'border-brand-500 bg-linear-to-b from-brand-500 to-indigo-600' : 'border-slate-300'
                      )}
                    >
                      {i === 2 && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    {label}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className="mt-20 sm:mt-24"
        aria-labelledby="product-features"
      >
        <div className="mb-8 sm:mb-10">
          <p
            className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
            id="product-features"
          >
            Product
          </p>
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Everything you need to run forms at scale
          </h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <li
              key={f.title}
              className="group rounded-2xl border border-slate-200/70 bg-white/50 p-5 shadow-sm ring-1 ring-slate-200/30 transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/5"
            >
              <span
                className={cn(
                  'inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ring-1',
                  f.iconClass
                )}
                aria-hidden
              >
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20 sm:mt-24">
        <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 text-center shadow-2xl shadow-slate-900/30 ring-1 ring-white/10 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Security</p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Auth, roles, and a clear boundary between admin and respondents.
          </h2>
          <p className="mt-2 max-w-xl mx-auto text-sm leading-relaxed text-slate-400">
            Admins build and export. Users only see what&apos;s published. The public form URL never
            exposes the builder.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 ring-1 ring-white/5 backdrop-blur">
              <Shield className="h-4 w-4 text-emerald-400" aria-hidden />
              JWT sessions · role-based routes
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
