import { Box } from "@mui/material";
import HeroSection from "./HeroSection";
import StepSection from "./StepSection";
import WhyUs from "./WhyUs";
import ContactCTA from "./ContactCTA";
import SizeGuideSection from "./SizeGuideSection";
import Reviews from "../Home/Reviews";
import Header from "../../components/Header";
import Footer from "../Home/Footer";

export default function ProcessPage() {
  return (
    <>
    <Header/>
    <Box sx={{ bgcolor: "#F8FCFA" }}>
      <HeroSection />
      <StepSection />
       <WhyUs />
      <SizeGuideSection />
      <Reviews />
      <ContactCTA />
    </Box>
    <Footer/>
</>
  );
}
