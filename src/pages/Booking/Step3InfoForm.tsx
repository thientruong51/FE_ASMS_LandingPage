import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  initial?: { name: string; phone: string; email?: string; note?: string };
  onBack: () => void;
  onNext: (info: { name: string; phone: string; email?: string; note?: string }) => void;
};

export default function Step3InfoForm({ initial, onBack, onNext }: Props) {
  const { t } = useTranslation("booking");

  const [form, setForm] = useState(
    initial || { name: "", phone: "", email: "", note: "" }
  );
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 🔹 Kiểm tra bắt buộc
    if (!form.name.trim() || !form.phone.trim()) {
      setError(t("infoForm.error.required"));
      return;
    }

    // 🔹 Validate email cơ bản
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError(t("infoForm.error.email"));
      return;
    }

    // ✅ Nếu hợp lệ
    setError(null);
    onNext(form);
  };

  return (
    <Box sx={{ bgcolor: "#F9FAFB", py: { xs: 6, md: 10 } }}>
      <Container maxWidth="sm">
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {t("infoForm.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("infoForm.desc")}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: "100%" }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <Stack spacing={2}>
                <TextField
                  name="name"
                  label={t("infoForm.name")}
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  name="phone"
                  label={t("infoForm.phone")}
                  value={form.phone}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  name="email"
                  label={t("infoForm.email")}
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name="note"
                  label={t("infoForm.note")}
                  value={form.note}
                  onChange={handleChange}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Stack>

              <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
                <Button variant="outlined" onClick={onBack}>
                  {t("actions.back")}
                </Button>
                <Button variant="contained" type="submit">
                  {t("actions.next")}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
