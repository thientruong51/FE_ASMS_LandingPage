import { Box, Container, Stack, Typography, Paper, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import { Link as RouterLink } from "react-router-dom";

export default function CTA() {
  const { t } = useTranslation("shareWarehouse");

  const items = [
    {
      icon: <StoreOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: t("cta.items.0.title"),
      desc: t("cta.items.0.desc"),
    },
    {
      icon: <PeopleAltOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: t("cta.items.1.title"),
      desc: t("cta.items.1.desc"),
    },
    {
      icon: <HandshakeOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: t("cta.items.2.title"),
      desc: t("cta.items.2.desc"),
    },
    {
      icon: <MonetizationOnOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: t("cta.items.3.title"),
      desc: t("cta.items.3.desc"),
    },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "background.default" }}>
      <Container>
        <Stack spacing={4} alignItems="center">
          {/* ===== Header ===== */}
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {t("cta.title")}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            maxWidth={600}
          >
            {t("cta.desc")}
          </Typography>

          {/* ===== Danh sách các lợi ích CTA ===== */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            justifyContent="center"
            alignItems="stretch"
            sx={{ width: "100%", mt: 4 }}
          >
            {items.map((item, i) => (
              <Paper
                key={i}
                elevation={3}
                sx={{
                  flex: 1,
                  p: 4,
                  borderRadius: 4,
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Stack spacing={2} alignItems="center">
                  {item.icon}
                  <Typography variant="h6" color="text.primary" fontWeight={600}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.desc}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>

          {/* ===== Nút hành động ===== */}
          <Button
          component={RouterLink}
          to="/contact"
            variant="contained"
            color="primary"
            size="large"
            sx={{
              borderRadius: 10,
              px: 4,
              mt: 4,
              color:"#fff"
            }}
          >
            {t("common.contact")}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
