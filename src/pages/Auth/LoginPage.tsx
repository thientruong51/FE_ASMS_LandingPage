import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
  Link,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { customerLogin } from "../../api/auth";
import { motion } from "framer-motion";
import ForgotPasswordDialog from "./ForgotPasswordDialog";

const BG_WAVE =
  "https://res.cloudinary.com/dkfykdjlm/image/upload/v1762962577/wave-haikei_skn4to.svg";
const ILLUSTRATION =
  "https://res.cloudinary.com/dkfykdjlm/image/upload/v1762884106/download_btrzmx.png";
const LOGO = "https://res.cloudinary.com/dkfykdjlm/image/upload/v1762190185/LOGO-remove_1_o1wgk2.png";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function LoginDialog({ open, onClose, onSuccess }: Props) {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);
  const [err, setErr] = useState("");

  const [emailErr, setEmailErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const resetErrors = () => {
    setErr("");
    setEmailErr("");
    setPasswordErr("");
  };

  const validateFields = (): boolean => {
    let hasError = false;
    setEmailErr("");
    setPasswordErr("");
    setErr("");

    const value = email.trim();

    if (!value) {
      setEmailErr(t("errorEmptyEmail") ?? "Vui lòng nhập email hoặc số điện thoại");
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{9,11}$/;
      if (!emailRegex.test(value) && !phoneRegex.test(value)) {
        setEmailErr(t("errorInvalidEmail") ?? "Email hoặc số điện thoại không hợp lệ");
        hasError = true;
      }
    }

    if (!password.trim()) {
      setPasswordErr(t("errorEmptyPassword") ?? "Vui lòng nhập mật khẩu");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordErr(t("errorPasswordShort") ?? "Mật khẩu phải có ít nhất 6 kí tự");
      hasError = true;
    }

    return !hasError;
  };

  const handleLogin = async () => {
    resetErrors();

    if (!validateFields()) {
      return;
    }

    try {
      setLoading(true);
      const res: any = await customerLogin({ email, password });

      if (res?.success) {
        if (res.data?.accessToken) {
          localStorage.setItem("accessToken", res.data.accessToken);
        }
        if (res.data?.refreshToken) {
          localStorage.setItem("refreshToken", res.data.refreshToken);
        }
        if (res.data?.userId) {
          localStorage.setItem("userId", res.data.userId);
        }

        onSuccess?.();
        onClose();
        navigate("/dashboard");
      } else {
        setErr(t("loginFailed") ?? "Đăng nhập thất bại");
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        setErr(t("wrongCredentials") ?? "Sai tài khoản hoặc mật khẩu");
      } else if (status === 403) {
        setErr(t("accountLocked") ?? "Tài khoản bị khóa hoặc không được phép");
      } else if (status >= 500) {
        setErr(t("serverError") ?? "Lỗi máy chủ, vui lòng thử lại sau");
      } else {
        setErr(t("loginError") ?? "Lỗi kết nối");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          overflow: "visible",
          borderRadius: 3,
          background: "transparent",
          boxShadow: "none",
          m: { xs: 1, md: 6 },
        },
      }}
      aria-labelledby="login-dialog-title"
    >
      <IconButton
        onClick={() => {
          resetErrors();
          onClose();
        }}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          zIndex: 40,
          bgcolor: "rgba(255,255,255,0.9)",
        }}
        aria-label="close"
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0 }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.28 }}
          sx={{
            width: "100%",
            maxWidth: 980,
            mx: "auto",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 18px 50px rgba(4,40,20,0.12)",
            display: "grid",
            gridTemplateColumns: isSm ? "1fr" : "440px 1fr",
            minHeight: { xs: 420, md: 480 },
            backgroundImage: `url(${BG_WAVE})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* LEFT: Illustration + logo */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: { xs: 4, md: 6 },
              py: { xs: 4, md: 6 },
              minHeight: { xs: 220, md: 480 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: isSm ? "center" : "flex-start",
                alignItems: "center",
                mb: { xs: 2, md: 3 },
              }}
            >
              <Box
                component="img"
                src={LOGO}
                alt="Logo"
                sx={{
                  width: { xs: 72, md: 92 },
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: isSm ? "center" : "flex-start",
                alignItems: "center",
                mt: { xs: 0, md: 1 },
              }}
            >
              <Box
                component="img"
                src={ILLUSTRATION}
                alt="illustration"
                sx={{
                  width: { xs: "78%", md: 360 },
                  maxWidth: "100%",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            </Box>
          </Box>

          {/* RIGHT: Form */}
          <Box
            sx={{
              position: "relative",
              p: { xs: 3, md: 6 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* glass overlay background */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: 2,
                zIndex: 1,
              }}
            />

            <Box sx={{ width: "100%", maxWidth: 360, position: "relative", zIndex: 2, ml: 10 }}>
              <Stack spacing={2.5} sx={{ color: "#fff" }}>
                <Typography
                  id="login-dialog-title"
                  variant="h5"
                  fontWeight={700}
                  textAlign="center"
                  sx={{ color: "#fff" }}
                >
                  {t("login") ?? "Đăng nhập"}
                </Typography>

                <Typography variant="body2" textAlign="center" sx={{ color: "rgba(255,255,255,0.85)" }}>
                  {t("subtitle") ?? "Nhập thông tin tài khoản để truy cập hệ thống."}
                </Typography>

                {/* Form - sử dụng form để bắt Enter */}
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label={t("username") ?? "Số điện thoại hoặc Email"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      error={Boolean(emailErr)}
                      helperText={emailErr || " "}
                      FormHelperTextProps={{
                        sx: { color: "#ffb3b3", mt: -1, mb: 0.5 },
                      }}
                      InputLabelProps={{
                        sx: {
                          color: "rgba(255,255,255,0.85)",
                          "&.Mui-focused": { color: "#fff" },
                        },
                      }}
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          color: "#fff",
                          backgroundColor: "rgba(255,255,255,0.12)",
                          backdropFilter: "blur(4px)",
                          "& input": { color: "#fff" },
                          "& fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                          "&:hover fieldset": { borderColor: "#fff" },
                          "&.Mui-focused fieldset": { borderColor: "#fff" },
                          "&.Mui-error fieldset": { borderColor: "#ff8080 !important" },
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label={t("password") ?? "Mật khẩu"}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      error={Boolean(passwordErr)}
                      helperText={passwordErr || " "}
                      FormHelperTextProps={{
                        sx: { color: "#ffb3b3", mt: -1, mb: 0.5 },
                      }}
                      InputLabelProps={{
                        sx: {
                          color: "rgba(255,255,255,0.85)",
                          "&.Mui-focused": { color: "#fff" },
                        },
                      }}
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          backgroundColor: "rgba(255,255,255,0.12)",
                          backdropFilter: "blur(4px)",
                          color: "#fff",
                          "& input": { color: "#fff" },
                          "& fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                          "&:hover fieldset": { borderColor: "#fff" },
                          "&.Mui-focused fieldset": { borderColor: "#fff" },
                          "&.Mui-error fieldset": { borderColor: "#ff8080 !important" },
                        },
                      }}
                    />

                    {/* Display API / global error */}
                    {err && (
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: 2,
                          bgcolor: "rgba(255,80,80,0.12)",
                          border: "1px solid rgba(255,80,80,0.3)",
                          color: "#ffbebe",
                          fontSize: 14,
                          textAlign: "center",
                        }}
                      >
                        {err}
                      </Box>
                    )}

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        py: 1.2,
                        borderRadius: 3,
                        bgcolor: "#3CBD96",
                        "&:hover": { bgcolor: "#2E9E7C" },
                        fontWeight: 700,
                        color: "#fff",
                        mt: 0.5,
                      }}
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : t("loginButton") ?? "Đăng nhập"}
                    </Button>
                  </Stack>
                </Box>

                {/* Links + footer */}
                <Box display="flex" justifyContent="space-between" sx={{ color: "#fff" }}>
                  <Link
                    underline="hover"
                    sx={{ color: "#fff", cursor: "pointer" }}
                    onClick={() => setOpenForgot(true)}
                  >
                    {t("forgot") ?? "Quên mật khẩu?"}
                  </Link>
                  <ForgotPasswordDialog
                    open={openForgot}
                    onClose={() => setOpenForgot(false)}
                  />
                </Box>

                <Typography variant="caption" textAlign="center" sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}>
                  © 2025 ASMS
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
