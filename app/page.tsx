import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PopularRestaurants } from "@/components/landing/PopularRestaurants";
import { StudentBenefits } from "@/components/landing/StudentBenefits";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <PopularRestaurants />
      <StudentBenefits />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
