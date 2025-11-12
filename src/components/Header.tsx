// src/components/Header.tsx
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useScrollTrigger,
  ClickAwayListener,
  useMediaQuery,
  InputAdornment,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PhoneIcon from "@mui/icons-material/Phone";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AnimatedList from "./AnimatedList";
import { useTheme } from "@mui/material/styles";

export default function Header() {
  const { t, i18n } = useTranslation("common");
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const trigger = useScrollTrigger({ threshold: 10 });

  // language menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const currentLang = i18n.language || "vi";

  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const handleMenuOpenLang = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuCloseLang = () => setAnchorEl(null);
  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
    setAnchorEl(null);
  };

  // services dropdown (desktop)
  const [openService, setOpenService] = useState(false);
  const handleServiceEnter = () => setOpenService(true);
  const handleServiceLeave = () => setOpenService(false);
  const handleSelectService = (_item: string, index: number) => {
    const target = serviceItems[index];
    if (target) {
      navigate(target.path);
      setOpenService(false);
    }
  };

  const serviceItems = [
    { label: t("servicesDropdown.type"), path: "/services/types" },
    { label: t("servicesDropdown.selfStorage"), path: "/services/self-storage" },
    { label: t("servicesDropdown.sharedStorage"), path: "/services/shared-storage" },
    { label: t("servicesDropdown.size"), path: "/services/size-guide" },
    { label: t("servicesDropdown.process"), path: "/services/process" },
  ];

  const navItems = [
    { label: t("nav.about"), to: "/about" },
    { label: t("nav.services"), to: "/services", isDropdown: true },
    { label: t("nav.3D"), to: "/3d-tour" },
    { label: t("nav.partner"), to: "/partner" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  // Mobile menu (hamburger)
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null);
  const handleMobileMenuOpen = (e: React.MouseEvent<HTMLElement>) => setMobileAnchor(e.currentTarget);
  const handleMobileMenuClose = () => setMobileAnchor(null);
  const handleMobileNavigate = (to: string) => {
    navigate(to);
    handleMobileMenuClose();
  };

  // Topbar height responsive
  const appbarHeight = isMdUp ? 90 : 64;

  return (
    <Box sx={{ position: "relative", width: "100%", overflow: "hidden" }}>
      {/* decorative curved background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: isMdUp ? 250 : 140,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <svg
          viewBox={isMdUp ? "700 30 540 200" : "0 0 1440 220"}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "110%",
          }}
        >
          <path
            fill="#BFE3C6"
            d={isMdUp ? "M0,0 C300,120 600,40 720,80 C850,120 1100,40 1440,100 L1440,0 L0,0 Z" : "M0,0 C200,80 400,40 720,60 C1040,80 1240,40 1440,80 L1440,0 L0,0 Z"}
          />
        </svg>
      </Box>

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 10, // ensure header above sidebar
          backgroundColor: trigger ? "rgba(255,255,255,0.95)" : "transparent",
          boxShadow: trigger ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
          backdropFilter: trigger ? "blur(6px)" : "none",
          transition: "all 0.24s ease",
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            justifyContent: "space-between",
            px: { xs: 2, md: 5 },
            height: appbarHeight,
            alignItems: "center",
          }}
        >
          {/* Left: logo + (on mobile show hamburger) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {!isMdUp && (
              <IconButton
                edge="start"
                aria-label="open menu"
                onClick={handleMobileMenuOpen}
                size="large"
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                zIndex: 2,
              }}
            >
              <Box
                component="img"
                src="/assets/LOGO-remove.png"
                alt="ASMS Logo"
                sx={{
                  height: isMdUp ? 55 : 42,
                  objectFit: "contain",
                }}
              />
            </Box>
          </Box>

          {/* Center nav (desktop only) */}
          {isMdUp && (
            <Stack direction="row" spacing={4} alignItems="center" sx={{ zIndex: 2 }}>
              {navItems.map((item) =>
                item.isDropdown ? (
                  <Box
                    key={item.to}
                    onMouseEnter={handleServiceEnter}
                    sx={{ position: "relative", display: "flex", alignItems: "center" }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography
                        sx={{
                          color:
                            location.pathname.startsWith(item.to) || openService
                              ? "#3CBD96"
                              : "#125A44",
                          fontWeight: 600,
                          fontSize: 15,
                          cursor: "pointer",
                          transition: "color 0.2s",
                          "&:hover": { color: "#3CBD96" },
                        }}
                      >
                        {item.label}
                      </Typography>
                      <KeyboardArrowDownIcon
                        sx={{
                          fontSize: 20,
                          color:
                            location.pathname.startsWith(item.to) || openService
                              ? "#3CBD96"
                              : "#125A44",
                          transition: "color 0.2s",
                          transform: openService ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </Stack>

                    {openService && (
                      <ClickAwayListener onClickAway={handleServiceLeave}>
                        <Paper
                          onMouseEnter={handleServiceEnter}
                          onMouseLeave={handleServiceLeave}
                          elevation={3}
                          sx={{
                            position: "absolute",
                            left: 0,
                            mt: 42,
                            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                            backgroundColor: "#fff",
                            minWidth: 260,
                            overflow: "hidden",
                            zIndex: (theme) => theme.zIndex.drawer + 20,
                          }}
                        >
                          <AnimatedList
                            items={serviceItems.map((s) => s.label)}
                            onItemSelect={handleSelectService}
                            showGradients
                            enableArrowNavigation
                            displayScrollbar
                          />
                        </Paper>
                      </ClickAwayListener>
                    )}
                  </Box>
                ) : (
                  <Typography
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    sx={{
                      color: location.pathname === item.to ? "#3CBD96" : "#125A44",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: 15,
                      transition: "color 0.2s",
                      "&:hover": { color: "#3CBD96" },
                    }}
                  >
                    {item.label}
                  </Typography>
                )
              )}
            </Stack>
          )}

          {/* Right: phone, CTA, language, avatar */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ zIndex: 2 }}>
            {/* phone */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ display: { xs: "none", sm: "flex" } }}>
              <PhoneIcon sx={{ color: "#3CBD96", fontSize: 20 }} />
              <Typography sx={{ color: "#222", fontWeight: 600 }}>028 7771 0118</Typography>
            </Stack>

            {/* CTA */}
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#3CBD96",
                color: "white",
                borderRadius: "999px",
                px: 3,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#35a982" },
                fontSize: { xs: 13, md: 15 },
                minWidth: { xs: 0, md: 120 },
              }}
              onClick={() => navigate("/booking")}
            >
              {isMdUp ? t("nav.rentOnline") : t("nav.rentOnline")}
            </Button>

            {/* language */}
            <Box>
              <IconButton
                onClick={handleMenuOpenLang}
                sx={{ p: 0, display: "flex", alignItems: "center" }}
                aria-label="language"
              >
                <Box
                  component="img"
                  src={currentLang === "vi" ? "https://flagcdn.com/w20/vn.png" : "https://flagcdn.com/w20/gb.png"}
                  alt="flag"
                  sx={{ width: 24, height: 16, borderRadius: "2px" }}
                />
                <ArrowDropDownIcon sx={{ color: "#333", ml: 0.3 }} />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuCloseLang}
                PaperProps={{ sx: { mt: 1, minWidth: 120, borderRadius: "8px" } }}
              >
                {currentLang !== "vi" && (
                  <MenuItem onClick={() => handleLanguageChange("vi")}>
                    <Box component="img" src="https://flagcdn.com/w20/vn.png" alt="Vietnamese" sx={{ width: 24, height: 16, mr: 1 }} />
                    Tiếng Việt
                  </MenuItem>
                )}
                {currentLang !== "en" && (
                  <MenuItem onClick={() => handleLanguageChange("en")}>
                    <Box component="img" src="https://flagcdn.com/w20/gb.png" alt="English" sx={{ width: 24, height: 16, mr: 1 }} />
                    English
                  </MenuItem>
                )}
              </Menu>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* spacer so content below header isn't hidden */}
      <Box sx={{ height: appbarHeight }} />

      {/* Mobile menu popover */}
      <Menu
        anchorEl={mobileAnchor}
        open={Boolean(mobileAnchor)}
        onClose={handleMobileMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ sx: { width: "90%", maxWidth: 360, mt: 1 } }}
      >
        {/* search row */}
        <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
          <Box component="input" placeholder={t("ordersPage.searchOrder")} style={{ flex: 1, border: "none", outline: "none" }} />
        </Box>

        {navItems.map((n) =>
          n.isDropdown ? (
            <Box key={n.to}>
              <MenuItem
                onClick={() => {
                  // open a small submenu: map services as items
                  // For mobile, navigate to services index page (and user can choose inside)
                  handleMobileNavigate(n.to);
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>{n.label}</Typography>
              </MenuItem>

              {/* Show services as subitems */}
              {serviceItems.map((s) => (
                <MenuItem
                  key={s.path}
                  sx={{ pl: 4 }}
                  onClick={() => {
                    navigate(s.path);
                    handleMobileMenuClose();
                  }}
                >
                  {s.label}
                </MenuItem>
              ))}
            </Box>
          ) : (
            <MenuItem key={n.to} onClick={() => handleMobileNavigate(n.to)}>
              {n.label}
            </MenuItem>
          )
        )}
      </Menu>
    </Box>
  );
}
