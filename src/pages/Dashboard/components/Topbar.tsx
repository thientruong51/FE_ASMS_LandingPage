// src/pages/Dashboard/components/Topbar.tsx
import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  InputBase,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Button,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

type Props = {
  onMenu: () => void;
  onNewOrder?: () => void;
  searchPlaceholder?: string;
};

const Topbar: React.FC<Props> = ({ onMenu, onNewOrder, searchPlaceholder }) => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{ backdropFilter: "saturate(120%) blur(6px)", mb: 2 }}
    >
      <Toolbar
        sx={{
          display: "flex",
          gap: 2,
          px: { xs: 1, md: 3 },
          py: { xs: 1, md: 1.25 },
          alignItems: "center",
        }}
      >
        <IconButton onClick={onMenu} edge="start" size={isSmUp ? "medium" : "small"}>
          <MenuIcon />
        </IconButton>

        <Paper
          component="form"
          elevation={0}
          onSubmit={(e) => e.preventDefault()}
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1,
            py: 0.5,
            width: { xs: "100%", sm: 320, md: 420 },
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>

          <InputBase
            placeholder={searchPlaceholder ?? t("ordersPage.searchOrder")}
            sx={{ ml: 1, flex: 1, fontSize: { xs: 13, sm: 14 } }}
            inputProps={{ "aria-label": "search orders" }}
          />
        </Paper>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton size={isSmUp ? "medium" : "small"}>
              <NotificationsNoneIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onNewOrder}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: "#fff",
              textTransform: "none",
              px: { xs: 1.25, sm: 2 },
              py: { xs: 0.6, sm: 0.7 },
              fontSize: { xs: 13, sm: 14 },
              boxShadow: "0 8px 20px rgba(60,189,150,0.14)",
            }}
          >
            {isSmUp ? t("dashboardPage.newOrder") : "New"}
          </Button>

          <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, color: "#fff", width: 40, height: 40 }}>TK</Avatar>
          </IconButton>

          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem>{t("userInfo.profile")}</MenuItem>
            <MenuItem>{t("settings.title")}</MenuItem>
            <MenuItem>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
