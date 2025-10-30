import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Services from "../pages/Services";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";
import ServicesOverview from "../pages/ServicesOverview";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/services/types" element={<ServicesOverview  />} />
    </Routes>
  );
}
