// src/pages/Dashboard/UserInfoPage.tsx
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
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function UserInfoPage() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  // Account info state
  const [account, setAccount] = React.useState({
    firstName: "Dennis",
    lastName: "Nzioki",
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

  const handleAccountChange = (key: keyof typeof account) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAccount((s) => ({ ...s, [key]: e.target.value }));

  const handlePasswordChange =
    (key: keyof typeof passwords) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setPasswords((s) => ({ ...s, [key]: e.target.value }));

  const handleAvatarChoose = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarSrc(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleAvatarChoose(f);
  };

  const triggerFile = () => fileInputRef.current?.click();

  const handleSaveAccount = (e?: React.FormEvent) => {
    e?.preventDefault();
    // TODO: call API
    console.log("save account", account);
  };

  const handleChangePassword = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      alert("New password and confirm password do not match");
      return;
    }
    console.log("change password", passwords);
  };

  // Approach A: compute initials safely (string or undefined)
  const initials =
    avatarSrc
      ? undefined
      : `${(account.firstName?.[0] ?? "D")}${(account.lastName?.[0] ?? "N")}`.toUpperCase();

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>
        Account Settings
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
              <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
                <TextField
                  label="First name"
                  size="small"
                  value={account.firstName}
                  onChange={handleAccountChange("firstName")}
                  fullWidth
                />
                <TextField
                  label="Last name"
                  size="small"
                  value={account.lastName}
                  onChange={handleAccountChange("lastName")}
                  fullWidth
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
                <TextField
                  label="Email"
                  size="small"
                  type="email"
                  value={account.email}
                  onChange={handleAccountChange("email")}
                  fullWidth
                />
                <TextField
                  label="Phone Number"
                  size="small"
                  value={account.phone}
                  onChange={handleAccountChange("phone")}
                  fullWidth
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
                <TextField
                  label="Location"
                  size="small"
                  value={account.location}
                  onChange={handleAccountChange("location")}
                  fullWidth
                />
                <TextField
                  label="Postal Code"
                  size="small"
                  value={account.postal}
                  onChange={handleAccountChange("postal")}
                  fullWidth
                />
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
                Save Changes
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
            <Avatar
              src={avatarSrc ?? undefined}
              sx={{
                width: 120,
                height: 120,
                bgcolor: primary,
                fontSize: 36,
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onPickAvatar}
              style={{ display: "none" }}
            />

            <Button
              variant="outlined"
              onClick={triggerFile}
              startIcon={<PhotoCameraIcon />}
              sx={{
                borderColor: primary,
                color: primary,
                textTransform: "none",
                px: 2,
                borderRadius: 3,
              }}
            >
              Choose Image
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Change Password */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Change Password
        </Typography>

        <Box component="form" onSubmit={handleChangePassword} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Current Password"
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
              label="New Password"
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
              label="Confirm Password"
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
                boxShadow: "0 6px 18px rgba(60,189,150,0.12)",
                "&:hover": { bgcolor: primary },
              }}
            >
              Change Password
            </Button>
          </Box>
        </Box>
      </Paper>
    </Stack>
  );
}
