import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import Footer from "../Home/Footer";

export default function Contact() {
  const { t } = useTranslation("contact");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <>
      <Header />

      {/* ===== BANNER ===== */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "#fff",
          py: { xs: 8, md: 10 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container>
          <Stack spacing={2} maxWidth={800}>
            <Typography variant="overline" sx={{ opacity: 0.8 }}>
              SPACE UP YOUR LIFE
            </Typography>
            <Typography variant="h3" fontWeight={700}>
              {t("title")}
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 700, opacity: 0.9 }}>
              {t("lead")}
            </Typography>
          </Stack>

          <Box
            component="img"
            src="https://res.cloudinary.com/dkfykdjlm/image/upload/v1761756589/1761756460281_oyzou6.png"
            alt="key shape"
            sx={{
              position: "absolute",
              right: { xs: -40, md: 80 },
              bottom: { xs: -40, md: 0 },
              width: { xs: 180, md: 360 },
              opacity: 1,
            }}
          />
        </Container>
      </Box>

      {/* ===== MAIN CONTENT ===== */}
      <Box sx={{ bgcolor: "#F8FCFA", py: { xs: 8, md: 10 } }}>
        <Container>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 6, md: 8 }}
            alignItems="flex-start"
          >
            {/* ==== THÔNG TIN LIÊN HỆ ==== */}
            <Stack spacing={4} flex={1}>
              <ContactItem
                icon={<LocationOnOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />}
                title={t("location.title")}
                desc={t("location.desc")}
              />
              <ContactItem
                icon={<LocalPhoneOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />}
                title={t("hotline.title")}
                desc="028 7771 0118"
              />
              <ContactItem
                icon={<EmailOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />}
                title={t("email.title")}
                desc="hello@asms.vn"
              />
              <ContactItem
                icon={<AccessTimeOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />}
                title={t("hours.title")}
                desc={t("hours.desc")}
              />
            </Stack>

            {/* ==== FORM LIÊN HỆ ==== */}
            <Paper
              sx={{
                flex: 1,
                p: { xs: 3, md: 5 },
                borderRadius: 3,
                boxShadow: "0 8px 25px rgba(60,189,150,0.15)",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                color="primary.main"
                mb={3}
              >
                {t("form.title")}
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      label={t("form.firstName")}
                      variant="standard"
                      fullWidth
                      required
                    />
                    <TextField
                      label={t("form.lastName")}
                      variant="standard"
                      fullWidth
                      required
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      label={t("form.email")}
                      variant="standard"
                      fullWidth
                      type="email"
                      required
                    />
                    <TextField
                      label={t("form.phone")}
                      variant="standard"
                      fullWidth
                      required
                    />
                  </Stack>

                  <TextField
                    label={t("form.message")}
                    variant="standard"
                    fullWidth
                    multiline
                    rows={4}
                    required
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      mt: 2,
                      bgcolor: "primary.main",
                      "&:hover": { bgcolor: "#2EA67E" },
                      px: 5,
                      borderRadius: 10,
                      fontWeight: 600,
                      alignSelf: "flex-start",
                      color:"#fff"
                    }}
                  >
                    {t("form.submit")}
                  </Button>

                  {sent && (
                    <Typography
                      mt={2}
                      color="primary.main"
                      fontWeight={500}
                      variant="body2"
                    >
                      ✅ {t("form.sent")}
                    </Typography>
                  )}

                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 3, color: "text.secondary" }}
                  >
                    {t("form.note")}
                  </Typography>
                </Stack>
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>
      <Footer/>
    </>
  );
}

/* ===== Component con: Thông tin liên hệ ===== */
function ContactItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="flex-start"
      sx={{
        p: 1,
        borderBottom: "1px solid rgba(60,189,150,0.15)",
      }}
    >
      {icon}
      <Stack>
        <Typography variant="subtitle1" fontWeight={600} color="primary.main">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
          {desc}
        </Typography>
      </Stack>
    </Stack>
    
  );
}
