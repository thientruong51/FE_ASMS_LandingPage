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
  const [err, setErr] = useState("");

 const handleLogin = async () => {
  setErr("");
  if (!email || !password) {
    setErr(t("pleaseFill") ?? "Vui lòng nhập email và mật khẩu");
    return;
  }

  try {
    setLoading(true);
    const res = await customerLogin({ email, password });

    if (res.success) {

      if (res.data?.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
      }
      if (res.data?.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }
      if (res.data?.userId) {
        localStorage.setItem("userId", res.data.userId);
      }

      if (onSuccess) onSuccess();

      onClose();
      navigate("/dashboard");

    } else {
      setErr(res.errorMessage ?? (t("loginFailed") ?? "Đăng nhập thất bại"));
    }
  } catch {
    setErr(t("loginError") ?? "Lỗi kết nối");
  } finally {
    setLoading(false);
  }
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
    >
      {/* Close */}
      <IconButton
        onClick={onClose}
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
          {/* LEFT: Illustration + logo pushed left */}
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

          {/* RIGHT: Form — glass overlay so form reads clearly over wave */}
          <Box
            sx={{
              position: "relative",
              p: { xs: 3, md: 6 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",

            }}
          >
            {/* glass overlay background (covers entire form area) */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: 2,
                zIndex: 1,
              }}
            />

            <Box sx={{ width: "100%", maxWidth: 360, position: "relative", zIndex: 2, ml:10 }}>
              <Stack spacing={2.5} sx={{ color: "#fff" }}>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  textAlign="center"
                  sx={{ color: "#fff" }}   
                >
                  {t("login") ?? "Đăng nhập"}
                </Typography>

                <Typography
                  variant="body2"
                  textAlign="center"
                  sx={{ color: "rgba(255,255,255,0.85)" }}   
                >
                  {t("subtitle") ?? "Nhập thông tin tài khoản để truy cập hệ thống."}
                </Typography>

                {/* --- USERNAME --- */}
                <TextField
                  fullWidth
                  label={t("username") ?? "Số điện thoại"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
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
                      backgroundColor: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(4px)",
                      "& input": { color: "#fff" },
                      "& fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                      "&:hover fieldset": { borderColor: "#fff" },
                      "&.Mui-focused fieldset": { borderColor: "#fff" },
                    },
                  }}
                />

                {/* --- PASSWORD --- */}
                <TextField
                  fullWidth
                  label={t("password") ?? "Mật khẩu"}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  InputLabelProps={{
                    sx: {
                      color: "rgba(255,255,255,0.85)",
                      "&.Mui-focused": { color: "#fff" },
                    },
                  }}
                  InputProps={{
                    sx: {
                      borderRadius: 2,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(4px)",
                      color: "#fff",
                      "& input": { color: "#fff" },
                      "& fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                      "&:hover fieldset": { borderColor: "#fff" },
                      "&.Mui-focused fieldset": { borderColor: "#fff" },
                    },
                  }}
                />

                {err && (
                  <Typography sx={{ color: "#ffb3b3" }} variant="body2">
                    {err}
                  </Typography>
                )}

                {/* BUTTON */}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleLogin}
                  disabled={loading}
                  sx={{
                    py: 1.2,
                    borderRadius: 3,
                    bgcolor: "#3CBD96",
                    "&:hover": { bgcolor: "#2E9E7C" },
                    fontWeight: 700,
                    color: "#fff",  
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : (t("loginButton") ?? "Đăng nhập")}
                </Button>

                {/* LINKS + FOOTER */}
                <Box display="flex" justifyContent="space-between" sx={{ color: "#fff" }}>
                  <Link underline="hover" sx={{ color: "#fff" }}>
                    {t("forgot") ?? "Quên mật khẩu?"}
                  </Link>
                  <Link underline="hover" sx={{ color: "#fff" }}>
                    {t("register") ?? "Đăng ký"}
                  </Link>
                </Box>

                <Typography
                  variant="caption"
                  textAlign="center"
                  sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}
                >
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
