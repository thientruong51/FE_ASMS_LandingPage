import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function SizeGuide() {
  const { t } = useTranslation("selfStorage");

  const units = [
    {
      image:
        "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761894013/small-unit-with-boxes-v2-768x468.jpg_xvpxjw.webp",
      title: t("sizeGuide.units.0.title"),
      size: t("sizeGuide.units.0.size"),
      desc: t("sizeGuide.units.0.desc"),
    },
    {
      image:
        "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761894030/Medium-unit-with-boxes-v2-768x468.jpg_lp3igv.webp",
      title: t("sizeGuide.units.1.title"),
      size: t("sizeGuide.units.1.size"),
      desc: t("sizeGuide.units.1.desc"),
    },
    {
      image:
        "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761894033/Large-Unit-with-Boxes-copy-768x455.jpg_l1umuh.webp",
      title: t("sizeGuide.units.2.title"),
      size: t("sizeGuide.units.2.size"),
      desc: t("sizeGuide.units.2.desc"),
    },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "background.default" }}>
      <Container>
        <Stack spacing={4} alignItems="center">
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {t("sizeGuide.title")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            maxWidth={600}
          >
            {t("sizeGuide.desc")}
          </Typography>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            justifyContent="center"
            alignItems="stretch"
            sx={{ width: "100%", mt: 4 }}
          >
            {units.map((u, i) => (
              <Paper
                key={i}
                elevation={3}
                sx={{
                  flex: 1,
                  borderRadius: 4,
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={u.image}
                  alt={u.title}
                  sx={{
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                  }}
                />
                <Stack spacing={1.2} sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    {u.title}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="primary.main"
                    fontWeight={600}
                  >
                    {u.size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {u.desc}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
