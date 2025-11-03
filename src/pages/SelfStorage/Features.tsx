import { Box, Container, Stack, Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";

export default function Features() {
  const { t } = useTranslation("selfStorage");

  const items = [
    {
      icon: <CameraAltOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />,
      title: t("features.items.0.title"),
      desc: t("features.items.0.desc"),
    },
    {
      icon: <LockOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />,
      title: t("features.items.1.title"),
      desc: t("features.items.1.desc"),
    },
    {
      icon: <AccessTimeOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />,
      title: t("features.items.2.title"),
      desc: t("features.items.2.desc"),
    },
    {
      icon: <LocalShippingOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />,
      title: t("features.items.3.title"),
      desc: t("features.items.3.desc"),
    },
    {
      icon: <CreditCardOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />,
      title: t("features.items.4.title"),
      desc: t("features.items.4.desc"),
    },
    {
      icon: <ThumbUpAltOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />,
      title: t("features.items.5.title"),
      desc: t("features.items.5.desc"),
    },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "#F8FCFA" }}>
      <Container>
        <Stack spacing={4} alignItems="center">
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {t("features.title")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            maxWidth={600}
          >
            {t("features.desc")}
          </Typography>

          <Stack
            direction={{ xs: "column", md: "row" }}
            flexWrap="wrap"
            justifyContent="center"
            alignItems="stretch"
            spacing={3}
            sx={{ width: "100%", mt: 4 }}
          >
            {items.map((item, i) => (
              <Paper
                key={i}
                sx={{
                  flexBasis: { xs: "100%", sm: "45%", md: "30%" },
                  p: 3,
                  borderRadius: 3,
                  textAlign: "center",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Stack spacing={2} alignItems="center">
                  {item.icon}
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="text.primary"
                    textAlign="center"
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                  >
                    {item.desc}
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
