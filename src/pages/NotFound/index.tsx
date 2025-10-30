import { Button, Container, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <>
      <Header />
      <Container sx={{ py: 10 }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h2">404</Typography>
          <Typography color="text.secondary">{t("notFound.text")}</Typography>
          <Button variant="contained" component={RouterLink} to="/">
            {t("cta.backHome")}
          </Button>
        </Stack>
      </Container>
    </>
  );
}
