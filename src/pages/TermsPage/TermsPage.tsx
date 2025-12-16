import { Box } from "@mui/material";
import Header from "../../components/Header";
import Footer from "../Home/Footer";
import TermsHero from "./TermsHero";
import TermsContent from "./TermsContent";

export default function TermsPage() {
  return (
    <>
      <Header />
      <Box sx={{ bgcolor: "#F8FCFA" }}>
        <TermsHero />
        <TermsContent />
      </Box>
      <Footer />
    </>
  );
}
