import HeroSection from "@/components/sections/HeroSection"
import HowItWorks from "@/components/sections/HowItWorks"
import FeaturesSection from "@/components/sections/FeaturesSection"
import AudienceSection from "@/components/sections/AudienceSection"
import FinalCTA from "@/components/sections/FinalCTA"
import Footer from "@/components/sections/Footer"


export default function Home() {
  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <AudienceSection />
      <FinalCTA />
      <Footer />
    </main>
  )
}
