// src/pages/Dashboard/components/Sidebar.tsx
import React from "react";
import {
  Drawer,
  Toolbar,
  Box,
  Avatar,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Button,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import HomeIcon from "@mui/icons-material/Home";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_SM = 220;

type Props = {
  open: boolean;
  onClose: () => void;
};

const Sidebar: React.FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation("dashboard");
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const nav = [
    { to: "/dashboard", label: t("sidebar.dashboard"), icon: <DashboardIcon /> },
    { to: "/dashboard/orders", label: t("sidebar.myOrders"), icon: <Inventory2Icon /> },
    { to: "/dashboard/userinfo", label: t("sidebar.userInfo"), icon: <PersonIcon /> },
    { to: "/dashboard/settings", label: t("sidebar.settings"), icon: <SettingsIcon /> },
    { to: "/dashboard/contact", label: t("sidebar.contactWarehouse"), icon: <ContactPhoneIcon /> },
  ];

  const drawerWidth = isMdUp ? DRAWER_WIDTH : DRAWER_WIDTH_SM;

  const handleGoHome = () => {
    navigate("/");
    if (!isMdUp) onClose();
  };

  return (
    <Drawer
      variant={isMdUp ? "persistent" : "temporary"}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, 
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: 0,
          bgcolor: "background.paper",
        },
      }}
    >
      {/* Header nhỏ trong sidebar */}
      <Toolbar sx={{ px: isMdUp ? 3 : 2, py: isMdUp ? 2 : 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main", color: "#fff" }}>TK</Avatar>
          {isMdUp ? (
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Your Brand
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("sidebar.dashboard")}
              </Typography>
            </Box>
          ) : (
            <Typography variant="subtitle2" fontWeight={700}>
              Your Brand
            </Typography>
          )}
        </Box>
      </Toolbar>

      <Divider />

      {/* Navigation list */}
      <List sx={{ mt: 1 }}>
        {nav.map((n) => {
          const selected = location.pathname === n.to;
          return (
            <ListItemButton
              key={n.to}
              component={RouterLink}
              to={n.to}
              selected={selected}
              onClick={() => {
                if (!isMdUp) onClose();
              }}
              sx={{
                "&.Mui-selected": {
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  borderRadius: 1,
                  mx: 1,
                },
                "&:hover": { bgcolor: "action.hover" },
                my: 0.5,
                px: isMdUp ? 3 : 2,
                py: 1,
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{n.icon}</ListItemIcon>
              <ListItemText
                primary={n.label}
                primaryTypographyProps={{ noWrap: true, fontSize: isMdUp ? 14 : 13 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flex: 1 }} />

      {/* Nút "Về trang chủ" */}
      <Box sx={{ px: isMdUp ? 3 : 2, py: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          startIcon={<HomeIcon />}
          onClick={handleGoHome}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            py: 1,
          }}
        >
          {t("sidebar.goHome") || "Về trang chủ"}
        </Button>
      </Box>

      <Divider />

      <Box sx={{ px: isMdUp ? 3 : 2, py: 2 }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} Your Brand
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
