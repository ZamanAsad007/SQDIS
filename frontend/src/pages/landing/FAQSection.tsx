import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const faqs = [
    {
      q: 'How is the Software Quality Score (SQS) calculated?',
      a: 'SQS uses machine learning models trained on millions of open-source and commercial commits. It analyzes cyclomatic complexity, cognitive load, coupling, test coverage density, architectural anti-patterns, and historical defect rates to generate a calibrated 0–100 score.',
    },
    {
      q: 'Does SQDIS store or train models on our proprietary source code?',
      a: 'No. SQDIS never stores your proprietary code files on permanent storage. All AST parsing and complexity calculations occur ephemerally in-memory. Only sanitized metadata (AST metrics, cyclomatic scores, commit hashes) are persisted with AES-256 encryption.',
    },
    {
      q: 'How does the GitHub / GitLab integration work?',
      a: 'You can connect in under 60 seconds using a GitHub Personal Access Token or OAuth GitHub App. SQDIS automatically registers secure HMAC-SHA256 webhooks for push, pull request, and review events so commits are analyzed in real time.',
    },
    {
      q: 'Can SQDIS block pull requests or fail CI/CD builds if SQS drops below a target?',
      a: 'Yes. You can configure Quality Gate thresholds per repository or organization. If a pull request introduces severe technical debt or drops coverage below your threshold, SQDIS can flag the PR or report status to your CI/CD pipeline.',
    },
    {
      q: 'Can we self-host SQDIS on our private cloud or Kubernetes cluster?',
      a: 'Yes! Our Enterprise tier provides complete Docker Compose and Kubernetes Helm chart deployments for air-gapped or VPC-isolated environments with SAML/SSO integration.',
    },
  ]

  return (
    <section id="faq" className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 py-20 lg:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 uppercase tracking-wider">
            Got Questions?
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Everything you need to know about SQDIS software intelligence and security.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
