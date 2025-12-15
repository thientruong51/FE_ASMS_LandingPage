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
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getAccessToken, logoutApi, clearTokens } from "../../../api/auth"; 

type Props = {
  onMenu: () => void;
  onNewOrder?: () => void;
  searchPlaceholder?: string;
};

type UserInfo = {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
};

const parseJwtPayload = (token: string | null): any | null => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const makeInitials = (name?: string | null, email?: string | null) => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
};

const Topbar: React.FC<Props> = ({ onMenu, searchPlaceholder }) => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const navigate = useNavigate();

  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const [user, setUser] = React.useState<UserInfo | null>(null);
  const [loadingLogout, setLoadingLogout] = React.useState(false);

  React.useEffect(() => {
    const token = getAccessToken();
    const payload = parseJwtPayload(token);
    if (payload) {
      const name =
        payload.name ??
        payload.fullname ??
        payload.preferred_username ??
        payload.preferredName ??
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
        null;

      const email =
        payload.email ??
        payload.upn ??
        payload.preferred_username ??
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ??
        null;

      const picture =
        payload.picture ??
        payload.avatar ??
        payload.photo ??
        payload.profile_picture ??
        null;

      setUser({
        name: typeof name === "string" ? name : null,
        email: typeof email === "string" ? email : null,
        picture: typeof picture === "string" ? picture : null,
      });
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await logoutApi();
    } catch (err) {
      console.error("logoutApi error:", err);
    } finally {
      clearTokens();
      setLoadingLogout(false);
      navigate("/");
    }
  };

  const handleProfile = () => {
    setAnchor(null);
    navigate("/dashboard/userinfo");
  };

  const handleSettings = () => {
    setAnchor(null);
    navigate("/dashboard/settings");
  };

  const initials = makeInitials(user?.name, user?.email);

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
            inputProps={{ "aria-label": t("ordersPage.searchAria") }}
          />
        </Paper>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title={t("notifications.tooltip")}>
            <IconButton size={isSmUp ? "medium" : "small"} aria-label={t("notifications.aria")}>
              <NotificationsNoneIcon />
            </IconButton>
          </Tooltip>

         

          <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label={t("userMenu.open")}>
            {user?.picture ? (
              <Avatar src={user.picture} alt={user.name ?? user.email ?? "User"} sx={{ width: 40, height: 40 }} />
            ) : (
              <Avatar sx={{ bgcolor: theme.palette.primary.main, color: "#fff", width: 40, height: 40 }}>
                {initials}
              </Avatar>
            )}
          </IconButton>

          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleProfile}>{user?.name ?? user?.email ?? t("userMenu.profile")}</MenuItem>
            <MenuItem onClick={handleSettings}>{t("settings.title")}</MenuItem>
            <MenuItem
              onClick={() => {
                setAnchor(null);
                handleLogout();
              }}
              disabled={loadingLogout}
            >
              {t("userMenu.logout")}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
