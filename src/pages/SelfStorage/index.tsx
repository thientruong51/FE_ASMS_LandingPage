import { Box } from "@mui/material";
import Hero from "./Hero";
import WhyChoose from "./WhyChoose";
import Features from "./Features";
import SizeGuide from "./SizeGuide";
import Location from "./Location";
import FAQ from "./FAQ";
import Header from "../../components/Header";
import Footer from "../Home/Footer";
import FacilityTour from "../ServicesOverview/FacilityTour";

export default function SelfStoragePage() {
  return (
    <Box component="main" sx={{ bgcolor: "background.default" }}>
        <Header/>
      <Hero />
      <WhyChoose />
      <Features />
      <SizeGuide />
      <Location />
      <FacilityTour/>
      <FAQ />
      <Footer/>
    </Box>
  );
}
