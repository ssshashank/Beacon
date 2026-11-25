import Navbar from './navbar';
import Hero from './hero';
import ValueProps from './valueProps';
import FeatureFocus from './featureFocus';
import QuickStart from './quickStart';
import FAQ from './faq';
import Footer from './footer';

export default function LandingPage() {
  return (
    <div class="min-h-screen bg-[#08090c] text-[#f5f5f7] selection:bg-blue-600/30 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <ValueProps />
        <FeatureFocus />
        <QuickStart />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
