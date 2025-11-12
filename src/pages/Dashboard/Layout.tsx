// src/pages/Dashboard/Layout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

const Layout: React.FC = () => {
  const [open, setOpen] = React.useState(true);

  return (
    <>
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar onMenu={() => setOpen((s) => !s)} />
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 4 }, transition: "padding .2s" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
    </>
  );
};

export default Layout;
