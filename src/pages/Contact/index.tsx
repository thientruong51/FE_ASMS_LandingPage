import {
  Alert,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import SectionTitle from "../../components/SectionTitle";

export default function Contact() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <Header />
      <Container sx={{ py: 8 }}>
        <SectionTitle
          overline={t("sections.contact")}
          title={t("contact.title")}
          subtitle={t("contact.lead")}
        />
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          mt={4}
          alignItems="stretch"
        >
          <Paper variant="outlined" sx={{ flex: 1, p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField required label={t("contact.name")} />
                <TextField required label={t("contact.email")} type="email" />
                <TextField
                  required
                  label={t("contact.message")}
                  multiline
                  rows={4}
                />
                <Button type="submit" variant="contained">
                  {t("cta.send")}
                </Button>
                {sent && <Alert severity="success">{t("contact.sent")}</Alert>}
              </Stack>
            </form>
          </Paper>
          <Paper variant="outlined" sx={{ flex: 1, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t("contact.info")}
            </Typography>
            <Typography>📧 contact@asms.vn</Typography>
            <Typography>📍 Ho Chi Minh City, Vietnam</Typography>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
