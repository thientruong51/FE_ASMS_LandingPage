import { Container, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import SectionTitle from "../../components/SectionTitle";

export default function About() {
  const { t } = useTranslation();
  return (
    <>
      <Header />
      <Container sx={{ py: 8 }}>
        <SectionTitle
          overline={t("sections.about")}
          title={t("about.title")}
          subtitle={t("about.lead")}
          align="left"
        />
        <Stack spacing={2} mt={3}>
          <Typography>{t("about.p1")}</Typography>
          <Typography>{t("about.p2")}</Typography>
        </Stack>
      </Container>
    </>
  );
}
