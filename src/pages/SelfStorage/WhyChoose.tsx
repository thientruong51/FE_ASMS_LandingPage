import { Box, Container, Stack, Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import EmojiPeopleOutlinedIcon from "@mui/icons-material/EmojiPeopleOutlined";

export default function WhyChoose() {
  const { t } = useTranslation("selfStorage");

  const items = [
    {
      icon: <ShieldOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: t("whyChoose.items.0.title"),
      desc: t("whyChoose.items.0.desc"),
    },
    {
      icon: (
        <LocationOnOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />
      ),
      title: t("whyChoose.items.1.title"),
      desc: t("whyChoose.items.1.desc"),
    },
    {
      icon: (
        <AccessTimeOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />
      ),
      title: t("whyChoose.items.2.title"),
      desc: t("whyChoose.items.2.desc"),
    },
    {
      icon: (
        <EmojiPeopleOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />
      ),
      title: t("whyChoose.items.3.title"),
      desc: t("whyChoose.items.3.desc"),
    },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "background.default" }}>
      <Container>
        <Stack spacing={4} alignItems="center">
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {t("whyChoose.title")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            maxWidth={600}
          >
            {t("whyChoose.desc")}
          </Typography>

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
        </Stack>
      </Container>
    </Box>
  );
}
