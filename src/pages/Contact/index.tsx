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
import { createContact } from "../../api/contactApi";

export default function Contact() {
  const { t } = useTranslation("contact");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        message: form.message,
      };

      // chỉ gắn field nếu có dữ liệu
      if (form.firstName || form.lastName) {
        payload.name = `${form.firstName} ${form.lastName}`.trim();
      }
      if (form.phone) payload.phoneContact = form.phone;
      if (form.email) payload.email = form.email;

      await createContact(payload);

      setSent(true);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });

      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      console.error(err);
      setError(t("form.error"));
    } finally {
      setLoading(false);
    }
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
                desc="asms.dev.service@gmail.com"
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
              <Typography variant="h6" fontWeight={700} color="primary.main" mb={3}>
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
                      value={form.firstName}
                      onChange={handleChange("firstName")}
                    />
                    <TextField
                      label={t("form.lastName")}
                      variant="standard"
                      fullWidth
                      required
                      value={form.lastName}
                      onChange={handleChange("lastName")}
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      label={t("form.email")}
                      variant="standard"
                      fullWidth
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                    />
                    <TextField
                      label={t("form.phone")}
                      variant="standard"
                      fullWidth
                      value={form.phone}
                      onChange={handleChange("phone")}
                    />
                  </Stack>

                  <TextField
                    label={t("form.message")}
                    variant="standard"
                    fullWidth
                    multiline
                    rows={4}
                    required
                    value={form.message}
                    onChange={handleChange("message")}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 2,
                      bgcolor: "primary.main",
                      px: 5,
                      borderRadius: 10,
                      fontWeight: 600,
                      alignSelf: "flex-start",
                      color: "#fff",
                    }}
                  >
                    {loading ? t("form.sending") : t("form.submit")}
                  </Button>

                  {sent && (
                    <Typography mt={2} color="primary.main" fontWeight={500} variant="body2">
                      {t("form.sent")}
                    </Typography>
                  )}

                  {error && (
                    <Typography mt={2} color="error" variant="body2">
                      {error}
                    </Typography>
                  )}

                  <Typography variant="caption" sx={{ mt: 3, color: "text.secondary" }}>
                    {t("form.note")}
                  </Typography>
                </Stack>
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </>
  );
}

/* ===== Component con ===== */
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
      sx={{ p: 1, borderBottom: "1px solid rgba(60,189,150,0.15)" }}
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
