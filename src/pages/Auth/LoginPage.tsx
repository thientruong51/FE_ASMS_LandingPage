import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Link,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../Home/Footer";

const WaveBg =
  "https://res.cloudinary.com/dkfykdjlm/image/upload/v1762962577/wave-haikei_skn4to.svg";

export default function Login() {
  const { t } = useTranslation("auth");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500); 
  };

  const leftVariant = {
    hidden: { opacity: 0, x: -40 },
    show: { opacity: 1, x: 0, transition: { duration: 0.8 } },
  };
  const rightVariant = {
    hidden: { opacity: 0, x: 40 },
    show: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.2 } },
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            borderRadius: 5,
            overflow: "hidden",
            width: "100%",
            maxWidth: 1000,
            position: "relative", 
            bgcolor: "transparent",
          }}
        >
          {/* === SVG placed absolute on the right (controls the curve) === */}
          <Box
            component="img"
            src={WaveBg}
            alt="wave"
            sx={{
              position: "absolute",
              right: { xs: -40, md: -10 }, 
              top: 0,
              height: "100%", 
              width: "auto",
              objectFit: "cover",
              zIndex: 1,
              pointerEvents: "none",
              display: { xs: "none", md: "block" }, 
            }}
          />

          {/* ==== LEFT IMAGE SECTION ==== */}
          <Box
            component={motion.div}
            variants={leftVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 2,
              p: "2rem",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 24,
                left: 24,
                display: "flex",
                alignItems: "center",
                gap: 1,
                zIndex: 3,
              }}
            >
              <Box
                component="img"
                src="https://res.cloudinary.com/dkfykdjlm/image/upload/v1762190185/LOGO-remove_1_o1wgk2.png"
                alt="Logo"
                sx={{ width: 80 }}
              />
             
            </Box>

            <Box
              component="img"
              src="https://res.cloudinary.com/dkfykdjlm/image/upload/v1762884106/download_btrzmx.png"
              alt="Login Illustration"
              sx={{
                width: { xs: "80%", md: "85%" },
                maxWidth: 400,
              }}
            />

            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                bottom: 12,
                left: 24,
                color: "#3CBD96",
                zIndex: 3,
              }}
            >
              © 2025 {t("company")}
            </Typography>
          </Box>

          {/* ==== RIGHT LOGIN FORM ==== */}
          <Box
            component={motion.div}
            variants={rightVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            sx={{
              flex: 1,
              position: "relative",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: { xs: 420, md: "auto" },
            }}
          >
            {/* RIGHT panel background color — đặt dưới nội dung nhưng trên Paper bg */}
            <Box
              sx={{
                position: "absolute",
                right: 0,
                top: 0,
                height: "100%",
              }}
            />

            {/* Nội dung form — phải có zIndex cao hơn để nằm trên svg */}
            <Box
              sx={{
                position: "relative",
                zIndex: 3,
                width: "100%",
                maxWidth: 360,
                p: { xs: 4, md: 6 },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Stack spacing={3} sx={{ width: "100%" }}>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  color="#fff"
                  textAlign="center"
                >
                  {t("login")}
                </Typography>

                <Typography variant="body2" color="#E0F2EF" textAlign="center">
                  {t("subtitle")}
                </Typography>

                {/* Username */}
                <TextField
                  fullWidth
                  label={t("username")}
                  variant="outlined"
                  InputLabelProps={{
                    sx: {
                      color: "#5a5a5a",
                      transition: "all 0.18s ease",
                      "&.MuiInputLabel-shrink": {
                        transform: "translate(14px, -20px) scale(0.85)",
                        color: "#ffffff",
                      },
                    },
                  }}
                  InputProps={{
                    sx: {
                      borderRadius: 3,
                      bgcolor: "#E8F5F0",
                      input: { padding: "14px 16px" },
                      // outline xử lý
                      "& fieldset": { borderColor: "transparent" },
                      "&:hover fieldset": { borderColor: "#3CBD96" },
                      "&.Mui-focused fieldset": { borderColor: "#3CBD96" },
                    },
                  }}
                />

                {/* Password */}
                <TextField
                  fullWidth
                  label={t("password")}
                  type="password"
                  variant="outlined"
                  InputLabelProps={{
                    sx: {
                      color: "#5a5a5a",
                      transition: "all 0.18s ease",
                      "&.MuiInputLabel-shrink": {
                        transform: "translate(14px, -20px) scale(0.85)",
                        color: "#ffffff",
                      },
                    },
                  }}
                  InputProps={{
                    sx: {
                      borderRadius: 3,
                      bgcolor: "#E8F5F0",
                      input: { padding: "14px 16px" },
                      "& fieldset": { borderColor: "transparent" },
                      "&:hover fieldset": { borderColor: "#3CBD96" },
                      "&.Mui-focused fieldset": { borderColor: "#3CBD96" },
                    },
                  }}
                />


                <Box width="100%" display="flex" justifyContent="flex-end" sx={{ mt: -1 }}>
                  <Link href="#" underline="hover" color="#fff">
                    {t("forgot")}
                  </Link>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleLogin}
                  disabled={loading}
                  sx={{
                    py: 1.2,
                    borderRadius: 3,
                    bgcolor: "#3CBD96",
                    "&:hover": {
                      bgcolor: "#2E9E7C",
                    },
                    color: "#fff",
                    fontWeight: 600,
                    boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  {loading ? t("loading") : t("loginButton")}
                </Button>

                <Typography variant="body2" color="#E0F2EF" textAlign="center">
                  {t("noAccount")}{" "}
                  <Link href="#" underline="hover" color="#BFE3C6">
                    {t("register")}
                  </Link>
                </Typography>

                <Link href="#" underline="hover" color="#E0F2EF" sx={{ fontSize: "0.875rem", textAlign: "center" }}>
                  {t("terms")}
                </Link>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
