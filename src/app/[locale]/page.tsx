import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Activities from "@/components/Activities";
import Location from "@/components/Location";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#eee8dc] text-[#1c1917] font-sans selection:bg-stone-300">
        <NavBar />
        <Hero />
        <About />
        <Activities />
        <Location />
        <Footer />
        <ScrollToTop />
    </main>
  );
}
