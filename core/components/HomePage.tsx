import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import HeroSection from "./home/HeroSection";
import TrustStrip from "./home/TrustStrip";
import CategoryGrid from "./home/CategoryGrid";
import FeaturedProducts from "./home/FeaturedProducts";
import HowItWorks from "./home/HowItWorks";
import PromoSection from "./home/PromoSection";
import TestimonialsSection from "./home/TestimonialsSection";
import NewsletterSection from "./home/NewsletterSection";
import "../styles/HomePage.css";
import "../styles/NewHomePage.css";

const HomePage: React.FC = () => {
  return (
    <>
      <Header />
      <main className="home-page">
        <HeroSection />
        <TrustStrip />
        <CategoryGrid />
        <FeaturedProducts />
        <HowItWorks />
        <PromoSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
