import Hero from "./Hero";
import Services from "./Services";
import Footer from "./Footer";
import Compare from "./Compare";
import Reviews from "./Reviews";
import Features from "./Features";
import Gallery from "./Gallery";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Compare/>
      <Reviews/>
      <Features/>
      <Gallery/>
      <Footer />
    </>
  );
}
