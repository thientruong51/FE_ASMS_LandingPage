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
  Badge,
  Divider,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getAccessToken, logoutApi, clearTokens } from "../../../api/auth";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../store";
import { markAsRead, markAllAsRead } from "../../../store/notificationSlice";

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
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const makeInitials = (name?: string | null, email?: string | null) => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
};

const Topbar: React.FC<Props> = ({ onMenu, searchPlaceholder }) => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

  const [notiAnchor, setNotiAnchor] = React.useState<null | HTMLElement>(null);

  const [user, setUser] = React.useState<UserInfo | null>(null);
  const [loadingLogout, setLoadingLogout] = React.useState(false);

  const notifications = useSelector(
    (state: RootState) => state.notification.items
  );
  const unreadCount = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    const payload = parseJwtPayload(getAccessToken());
    if (!payload) return;

    setUser({
      name: payload.name ?? payload.fullname ?? null,
      email: payload.email ?? payload.upn ?? null,
      picture: payload.picture ?? null,
    });
  }, []);

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await logoutApi();
    } finally {
      clearTokens();
      setLoadingLogout(false);
      navigate("/");
    }
  };

  const initials = makeInitials(user?.name, user?.email);

  return (
    <AppBar position="sticky" color="transparent" elevation={0}>
      <Toolbar sx={{ display: "flex", gap: 2 }}>
        <IconButton onClick={onMenu}>
          <MenuIcon />
        </IconButton>

        <Paper sx={{ display: "flex", alignItems: "center", px: 1 }}>
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
          <InputBase
            placeholder={searchPlaceholder ?? t("ordersPage.searchOrder")}
            sx={{ ml: 1 }}
          />
        </Paper>

        <Box sx={{ flex: 1 }} />

        {/* 🔔 NOTIFICATION */}
        <Tooltip title={t("notifications.tooltip")}>
          <IconButton
            onClick={(e) => {
              setNotiAnchor(e.currentTarget);
              dispatch(markAllAsRead());
            }}
          >
            <Badge color="error" variant="dot" invisible={unreadCount === 0}>
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={notiAnchor}
          open={Boolean(notiAnchor)}
          onClose={() => setNotiAnchor(null)}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          PaperProps={{ sx: { width: 360, maxHeight: 400 } }}
        >
          <Typography sx={{ px: 2, py: 1, fontWeight: 600 }}>
            {t("notifications.title")}
          </Typography>

          <Divider />

          {notifications.length === 0 ? (
            <MenuItem disabled>
              {t("notifications.empty")}
            </MenuItem>
          ) : (
            notifications.map(n => (
              <MenuItem
                key={n.id}
                onClick={() => {
                  dispatch(markAsRead(n.id));
                  setNotiAnchor(null);
                  navigate(`/dashboard/orders`);
                }}
                sx={{
                  alignItems: "flex-start",
                  whiteSpace: "normal",
                  bgcolor: n.read ? "transparent" : "action.hover",
                }}
              >
                <Box>
                  <Typography fontWeight={600}>{n.title}</Typography>
                  <Typography fontSize={13} color="text.secondary">
                    {n.message}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Menu>

        {/* 👤 USER */}
        <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
          {user?.picture ? (
            <Avatar src={user.picture} />
          ) : (
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              {initials}
            </Avatar>
          )}
        </IconButton>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
        >
          <MenuItem onClick={() => navigate("/dashboard/userinfo")}>
            {user?.name ?? user?.email}
          </MenuItem>
          <MenuItem onClick={() => navigate("/dashboard/settings")}>
            {t("settings.title")}
          </MenuItem>
          <MenuItem onClick={handleLogout} disabled={loadingLogout}>
            {t("userMenu.logout")}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
