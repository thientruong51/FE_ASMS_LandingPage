import Hero from "./Hero";
import OverviewCards from "./OverviewCards";
import Steps from "./Steps";
import StorageCategories from "./StorageCategories";
import Reviews from "../Home/Reviews";
import Header from "../../components/Header";
import FacilityTour from "./FacilityTour";
import Faq from "./Faq";
import Footer from "../Home/Footer";

export default function ServicesOverview() {
  return (
    <>
    <Header/>
      <Hero />
      <OverviewCards />
      <Steps />
      <StorageCategories />
      <Reviews />
      <FacilityTour/>
      <Faq/>
      <Footer/>
    </>
  );
}
