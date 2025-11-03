import Hero from "./Hero";
import Features from "./Features";
import Safety from "./Safety";
import Steps from "./Steps";
import CTA from "./CTA";
import FAQ from "./FAQ";
import Header from "../../components/Header";
import Footer from "../Home/Footer";
import Warehouse3D from "./Warehouse3D";

export default function ShareWarehousePage() {
  return (
    <>
    <Header/>
      <Hero />
      <Features />
      <Safety />
      <Steps />
      <CTA />
      <Warehouse3D />
      <FAQ />
    <Footer/>

    </>
  );
}
