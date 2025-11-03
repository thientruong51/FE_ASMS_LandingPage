import { Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function EstimateForm() {
  const { t } = useTranslation("partner");
  const f = t("estimate.fields", { returnObjects: true }) as Record<string, string>;

  return (
    <Box id="estimate-form" sx={{ bgcolor: "#BFE3C6", py: { xs: 8, md: 12 } }}>
      <Container>
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={2} color="#204945">
          {t("estimate.title")}
        </Typography>
        <Typography
          textAlign="center"
          color="#204945"
          sx={{ opacity: 0.85, maxWidth: 800, mx: "auto", mb: 5 }}
        >
          {t("estimate.desc")}
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          alignItems="center"
        >
          <Box
            component="img"
            src="https://glints.com/vn/blog/wp-content/uploads/2022/12/Ky%CC%83-na%CC%86ng-to%CC%82%CC%81-cha%CC%82%CC%81t-cu%CC%89a-ngu%CC%9Bo%CC%9B%CC%80i-tu%CC%9B-va%CC%82%CC%81n-gio%CC%89i--1024x674.jpg"
            alt="Estimate"
            sx={{
              borderRadius: 4,
              width: { xs: "100%", md: "45%" },
              height: 420,
              objectFit: "cover",
              boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
            }}
          />
          <Paper sx={{ flex: 1, p: { xs: 3, md: 4 }, borderRadius: 3 }} elevation={0}>
            <Stack spacing={2} component="form">
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField fullWidth label={f.firstName} />
                <TextField fullWidth label={f.lastName} />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField fullWidth label={f.email} />
                <TextField fullWidth label={f.phone} />
              </Stack>
              <TextField fullWidth label={f.address} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField fullWidth label={f.district} />
                <TextField fullWidth label={f.area} />
              </Stack>
              <TextField fullWidth label={f.note} multiline rows={3} />
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#3CBD96",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 2.5,
                  py: 1.5,
                  "&:hover": { bgcolor: "#34aa87" },
                }}
              >
                {t("estimate.cta")}
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
