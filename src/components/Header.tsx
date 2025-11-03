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
} from "@mui/material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PhoneIcon from "@mui/icons-material/Phone";
import AnimatedList from "./AnimatedList";

export default function Header() {
  const { t, i18n } = useTranslation("common");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openService, setOpenService] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const trigger = useScrollTrigger({ threshold: 10 });

  // 🟢 Lấy ngôn ngữ từ localStorage khi load
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const currentLang = i18n.language || "vi";

  // Ngôn ngữ
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng); 
    setAnchorEl(null);
  };

  // Dropdown Dịch vụ
  const handleServiceEnter = () => setOpenService(true);
  const handleServiceLeave = () => setOpenService(false);

  // Danh sách dịch vụ (song ngữ)
  const serviceItems = [
    { label: t("servicesDropdown.type"), path: "/services/types" },
    { label: t("servicesDropdown.selfStorage"), path: "/services/self-storage" },
    { label: t("servicesDropdown.sharedStorage"), path: "/services/shared-storage" },
    { label: t("servicesDropdown.size"), path: "/services/size-guide" },
    { label: t("servicesDropdown.process"), path: "/services/process" },
  ];

  const navItems = [
    { label: t("nav.services"), to: "/services", isDropdown: true },
    { label: t("nav.partner"), to: "/partner" },
    { label: t("nav.about"), to: "/about" },
    { label: "Blog", to: "/blog" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  const handleSelectService = (_item: string, index: number) => {
    const target = serviceItems[index];
    if (target) {
      navigate(target.path);
      setOpenService(false);
    }
  };

  return (
    <Box sx={{ position: "relative", width: "100%", overflow: "hidden" }}>
      {/* NỀN CONG */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 250,
          zIndex: 0,
        }}
      >
        <svg
          viewBox="700 30 540 200"
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
            d="M0,0 C300,120 600,40 720,80 C850,120 1100,40 1440,100 L1440,0 L0,0 Z"
          />
        </svg>
      </Box>

      {/* HEADER */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: trigger ? "rgba(255,255,255,0.95)" : "transparent",
          boxShadow: trigger ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
          backdropFilter: trigger ? "blur(6px)" : "none",
          transition: "all 0.3s ease",
          zIndex: 20,
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            justifyContent: "space-between",
            px: 5,
            height: 90,
          }}
        >
          {/* LOGO */}
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
                height: 55,
                objectFit: "contain",
              }}
            />
          </Box>

          {/* NAVIGATION */}
          <Stack direction="row" spacing={4} alignItems="center">
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
                        transition: "color 0.3s",
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
                        transition: "color 0.3s",
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
                          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                          backgroundColor: "#fff",
                          minWidth: 250,
                          overflow: "hidden",
                          zIndex: 30,
                        }}
                      >
                        <AnimatedList
                          items={serviceItems.map((s) => s.label)}
                          onItemSelect={handleSelectService}
                          showGradients={true}
                          enableArrowNavigation={true}
                          displayScrollbar={true}
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
                    transition: "color 0.3s",
                    "&:hover": { color: "#3CBD96" },
                  }}
                >
                  {item.label}
                </Typography>
              )
            )}
          </Stack>

          {/* PHONE + CTA + NGÔN NGỮ */}
          <Stack direction="row" spacing={3} alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1}>
              <PhoneIcon sx={{ color: "#3CBD96", fontSize: 20 }} />
              <Typography sx={{ color: "#222", fontWeight: 600 }}>
                028 7771 0118
              </Typography>
            </Stack>

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
              }}
            >
              {t("nav.rentOnline")}
            </Button>

            {/* NGÔN NGỮ */}
            <Box>
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  p: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box
                  component="img"
                  src={
                    currentLang === "vi"
                      ? "https://flagcdn.com/w20/vn.png"
                      : "https://flagcdn.com/w20/gb.png"
                  }
                  alt="flag"
                  sx={{ width: 24, height: 16, borderRadius: "2px" }}
                />
                <ArrowDropDownIcon sx={{ color: "#333", ml: 0.3 }} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 100,
                    borderRadius: "8px",
                  },
                }}
              >
                {currentLang !== "vi" && (
                  <MenuItem onClick={() => handleLanguageChange("vi")}>
                    <Box
                      component="img"
                      src="https://flagcdn.com/w20/vn.png"
                      alt="Vietnamese"
                      sx={{ width: 24, height: 16, mr: 1 }}
                    />
                    Tiếng Việt
                  </MenuItem>
                )}
                {currentLang !== "en" && (
                  <MenuItem onClick={() => handleLanguageChange("en")}>
                    <Box
                      component="img"
                      src="https://flagcdn.com/w20/gb.png"
                      alt="English"
                      sx={{ width: 24, height: 16, mr: 1 }}
                    />
                    English
                  </MenuItem>
                )}
              </Menu>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ height: 90 }} />
    </Box>
  );
}
