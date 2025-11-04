import Hero from "./Hero";
import Services from "./Services";
import Footer from "./Footer";
import Compare from "./Compare";
import Reviews from "./Reviews";
import Features from "./Features";
import Gallery from "./Gallery";
import Header from "../../components/Header";

export default function Home() {
  return (
    <>
      <Header/>
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
