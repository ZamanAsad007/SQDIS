import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import LandingHeader from './LandingHeader'
import HeroSection from './HeroSection'
import MetricsSection from './MetricsSection'
import Feature from './feature'
import HowItWorks from './howitworks'
import Pricing from './pricing'
import FAQSection from './FAQSection'
import CTASection from './CTASection'
import LandingFooter from './LandingFooter'

export default function Home() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const targetId = hash.replace('#', '')
    if (!targetId) return

    const el = document.getElementById(targetId)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200">
      <LandingHeader />
      <main>
        <HeroSection />
        <MetricsSection />
        <Feature id="features" />
        <HowItWorks id="how-it-works" />
        <Pricing id="pricing" />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
