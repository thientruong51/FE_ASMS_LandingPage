import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Services from "../pages/Services";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";
import ServicesOverview from "../pages/ServicesOverview";
import SelfStoragePage from "../pages/SelfStorage";
import ShareWarehousePage from "../pages/ShareWarehouse";
import StorageSize from "../pages/StorageSize";
import ProcessPage from "../pages/Process";
import PartnerPage from "../pages/Partner";
import ThreeDTour from "../pages/3DTour";
import Booking from "../pages/Booking";
import LoginPage from "../pages/Auth/LoginPage";
import { ContactPage, DashboardPage, Layout, OrderDetailPage, OrdersPage, SettingsPage, UserInfoPage } from "../pages/Dashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/services/types" element={<ServicesOverview  />} />
      <Route path="/services/self-storage" element={<SelfStoragePage  />} />
      <Route path="/services/shared-storage" element={<ShareWarehousePage  />} />
      <Route path="/services/size-guide" element={<StorageSize  />} />
      <Route path="/services/process" element={<ProcessPage />} />
      <Route path="/partner" element={<PartnerPage />} />
      <Route path="/3d-tour" element={<ThreeDTour />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="userinfo" element={<UserInfoPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>
    </Routes>
    
  );
}
