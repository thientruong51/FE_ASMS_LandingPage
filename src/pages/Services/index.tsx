import { Container, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import SectionTitle from "../../components/SectionTitle";

const list = [
  { name: "services.design", price: "$999+" },
  { name: "services.dev", price: "$1,999+" },
  { name: "services.growth", price: "$799+" },
];

export default function ServicesPage() {
  const { t } = useTranslation();
  return (
    <>
      <Header />
      <Container sx={{ py: 8 }}>
        <SectionTitle
          overline={t("sections.services")}
          title={t("services.title")}
          subtitle={t("services.lead")}
        />
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} mt={4}>
          {list.map((item) => (
            <Paper key={item.name} variant="outlined" sx={{ p: 3, flex: 1 }}>
              <Typography variant="h6">{t(item.name)}</Typography>
              <Typography color="text.secondary" mb={1}>
                {t("services.packageDesc")}
              </Typography>
              <Typography variant="h5">{item.price}</Typography>
            </Paper>
          ))}
        </Stack>
      </Container>
    </>
  );
}
