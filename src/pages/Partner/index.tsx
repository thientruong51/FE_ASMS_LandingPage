import Hero from "./Hero";
import WhyPartner from "./WhyPartner";
import Projects from "./Projects";
import Process from "./Process";
import EstimateForm from "./EstimateForm";
import Faq from "./Faq";
import Header from "../../components/Header";
import Footer from "../Home/Footer";

export default function PartnerPage() {
  return (
    <>
    <Header/>
      <Hero />
      <WhyPartner />
      <Projects />
      <Process />
      <EstimateForm />
      <Faq />
      <Footer/>
    </>
  );
}
