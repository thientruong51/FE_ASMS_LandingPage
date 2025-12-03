import React from "react";
import {
  Box,
  Stack,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import { useTranslation } from "react-i18next";

/** Safe JWT decode: base64url -> base64 + UTF-8 */
function parseJwt(token: string | null): Record<string, any> | null {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1] ?? "";
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    const binary = atob(padded);
    const jsonPayload = decodeURIComponent(
      binary
        .split("")
        .map((c) => {
          const hex = c.charCodeAt(0).toString(16).padStart(2, "0");
          return "%" + hex;
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/** axios instance (use your env var) */
const BASE = (import.meta.env.VITE_API_BASE_URL ?? "") as string;
const api = axios.create({
  baseURL: BASE,
});

export default function UserInfoPage() {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  // Account info state
  const [account, setAccount] = React.useState({
    id: "", // used in URL
    customerCode: "", // required by API body
    name: "Dennis",
    email: "dennisnzioki@gmail.com",
    phone: "254 555-0123",
    location: "Nairobi, Kenya",
    postal: "20033",
  });

  // Password state
  const [passwords, setPasswords] = React.useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [show, setShow] = React.useState({ current: false, newPass: false, confirm: false });

  // Avatar upload preview
  const [avatarSrc, setAvatarSrc] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Snackbar state
  const [snack, setSnack] = React.useState<{ open: boolean; severity: "success" | "error" | "info"; message: string }>({
    open: false,
    severity: "info",
    message: "",
  });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const handleAccountChange = (key: keyof typeof account) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAccount((s) => ({ ...s, [key]: e.target.value }));

  const handlePasswordChange =
    (key: keyof typeof passwords) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setPasswords((s) => ({ ...s, [key]: e.target.value }));

  const handleAvatarChoose = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarSrc(String(reader.result));
    reader.readAsDataURL(file);
  };

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleAvatarChoose(f);
  };
  const triggerFile = () => fileInputRef.current?.click();

  // Hydrate form from token on mount (map token claims to our state)
  React.useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const payload = parseJwt(token);
    if (!payload) return;

    setAccount((prev) => ({
      id: payload.Id ?? prev.id,
      customerCode: payload.CustomerCode ?? prev.customerCode ?? "",
      name: payload.Name ?? payload.name ?? prev.name,
      email: payload.Email ?? payload.email ?? prev.email,
      phone: payload.Phone ?? payload.phone ?? prev.phone,
      location: payload.Address ?? payload.address ?? prev.location,
      postal: prev.postal,
    }));

    const avatarClaim = payload.Avatar ?? payload.avatarUrl ?? payload.avatar ?? null;
    if (typeof avatarClaim === "string" && avatarClaim) setAvatarSrc(avatarClaim);
  }, []);

  // Build Authorization headers if token present
  const buildAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Save account
  const handleSaveAccount = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!account.id) {
      setSnack({ open: true, severity: "error", message: t("userInfo.errors.missingCustomerId") });
      return;
    }

    const token = localStorage.getItem("accessToken");
    const tokenPayload = parseJwt(token);

    let isActiveVal: boolean | undefined = undefined;
    if (tokenPayload) {
      const raw = tokenPayload.IsActive ?? tokenPayload.isActive ?? tokenPayload.IsActiveString ?? null;
      if (raw !== null && raw !== undefined) {
        if (typeof raw === "boolean") isActiveVal = raw;
        else if (typeof raw === "string") isActiveVal = raw.toLowerCase() === "true";
      }
    }

    const payload: Record<string, any> = {
      customerCode: account.customerCode ?? "",
      name: account.name ?? "",
      address: account.location ?? "",
      phone: account.phone ?? "",
    };

    if (tokenPayload?.Email || account.email) payload.email = tokenPayload?.Email ?? account.email;
    if (typeof isActiveVal === "boolean") payload.isActive = isActiveVal;

    try {
      const res = await api.put(`/api/Customer/${encodeURIComponent(String(account.id))}`, payload, {
        headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
      });

      console.log("PUT /api/Customer success:", res.data);
      setSnack({ open: true, severity: "success", message: t("userInfo.messages.updateSuccess") });
    } catch (err: any) {
      console.error("Update customer failed", err);
      const resp = err?.response?.data;
      let message = t("userInfo.messages.updateFailed");

      if (resp) {
        if (resp.errors && typeof resp.errors === "object") {
          const msgs: string[] = [];
          for (const k of Object.keys(resp.errors)) {
            const v = resp.errors[k];
            if (Array.isArray(v)) msgs.push(`${k}: ${v.join(", ")}`);
            else msgs.push(`${k}: ${String(v)}`);
          }
          message = t("userInfo.messages.updateFailedWithDetails", { details: msgs.join(" ; ") });
        } else if (resp.title || resp.message) {
          message = resp.title ? `${resp.title} ${resp.message ?? ""}` : resp.message;
        } else {
          message = `${t("userInfo.messages.serverReturned")}: ${JSON.stringify(resp)}`;
        }
      } else if (err?.response) {
        message = `${t("userInfo.messages.serverError")}: ${err.response.status} ${err.response.statusText}`;
      } else if (err?.message) {
        message = err.message;
      }

      setSnack({ open: true, severity: "error", message });
    }
  };

  // Change password
  const handleChangePassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!passwords.current || !passwords.newPass) {
      setSnack({ open: true, severity: "error", message: t("userInfo.messages.fillPasswords") });
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setSnack({ open: true, severity: "error", message: t("userInfo.messages.passwordMismatch") });
      return;
    }

    try {
      const body = {
        email: account.email,
        oldPassword: passwords.current,
        newPassword: passwords.newPass,
        isEmployee: false,
      };

      await api.post("/api/Password/change-password", body, {
        headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
      });

      setSnack({ open: true, severity: "success", message: t("userInfo.messages.changePasswordSuccess") });
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err: any) {
      console.error("Change password failed", err);
      const resp = err?.response?.data;
      let message = t("userInfo.messages.changePasswordFailed");
      if (resp?.message) message = `${t("userInfo.messages.changePasswordFailed")}: ${resp.message}`;
      setSnack({ open: true, severity: "error", message });
    }
  };

  // Compute initials from name
  const initials =
    avatarSrc
      ? undefined
      : `${(account.name?.split(/\s+/)[0]?.[0] ?? "U")}${(account.name?.split(/\s+/).slice(-1)[0]?.[0] ?? "")}`
          .toUpperCase()
          .slice(0, 2);

  return (
    <>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          {t("userInfo.title")}
        </Typography>

        {/* Account Settings Card */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Box
            component="form"
            onSubmit={handleSaveAccount}
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column", md: "row" },
              alignItems: "flex-start",
            }}
          >
            {/* left: inputs */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack spacing={2}>
                <TextField label={t("userInfo.fields.name")} size="small" value={account.name} onChange={handleAccountChange("name")} fullWidth />

                <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
                  <TextField label={t("userInfo.fields.email")} size="small" type="email" value={account.email} disabled fullWidth />
                  <TextField label={t("userInfo.fields.phone")} size="small" value={account.phone} onChange={handleAccountChange("phone")} fullWidth />
                </Box>

                <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
                  <TextField label={t("userInfo.fields.location")} size="small" value={account.location} onChange={handleAccountChange("location")} fullWidth />
                  <TextField label={t("userInfo.fields.customerCode")} size="small" value={account.customerCode} disabled fullWidth />
                </Box>
              </Stack>

              <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: primary,
                    color: "#fff",
                    px: 4,
                    py: 1,
                    borderRadius: 3,
                    textTransform: "none",
                    boxShadow: "0 6px 18px rgba(60,189,150,0.14)",
                    "&:hover": { bgcolor: primary },
                  }}
                >
                  {t("userInfo.actions.save")}
                </Button>
              </Box>
            </Box>

            {/* right: avatar */}
            <Box
              sx={{
                width: { xs: "100%", md: 260 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                mt: { xs: 2, md: 0 },
              }}
            >
              <Avatar src={avatarSrc ?? undefined} sx={{ width: 120, height: 120, bgcolor: primary, fontSize: 36, fontWeight: 700 }}>
                {initials}
              </Avatar>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickAvatar} style={{ display: "none" }} />

              <Button variant="outlined" onClick={triggerFile} startIcon={<PhotoCameraIcon />} sx={{ borderColor: primary, color: primary, textTransform: "none", px: 2, borderRadius: 3 }}>
                {t("userInfo.actions.chooseImage")}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Change Password */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            {t("userInfo.changePassword.title")}
          </Typography>

          <Box component="form" onSubmit={handleChangePassword} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label={t("userInfo.changePassword.current")}
              size="small"
              type={show.current ? "text" : "password"}
              value={passwords.current}
              onChange={handlePasswordChange("current")}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShow((s) => ({ ...s, current: !s.current }))}>
                      {show.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
              <TextField
                label={t("userInfo.changePassword.new")}
                size="small"
                type={show.newPass ? "text" : "password"}
                value={passwords.newPass}
                onChange={handlePasswordChange("newPass")}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShow((s) => ({ ...s, newPass: !s.newPass }))}>
                        {show.newPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label={t("userInfo.changePassword.confirm")}
                size="small"
                type={show.confirm ? "text" : "password"}
                value={passwords.confirm}
                onChange={handlePasswordChange("confirm")}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}>
                        {show.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 1 }}>
              <Button type="submit" variant="contained" sx={{ bgcolor: primary, color: "#fff", px: 4, py: 1, borderRadius: 3, textTransform: "none", boxShadow: "0 6px 18px rgba(60,189,150,0.12)", "&:hover": { bgcolor: primary } }}>
                {t("userInfo.changePassword.action")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Stack>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={6000} onClose={closeSnack}>
        <Alert onClose={closeSnack} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
