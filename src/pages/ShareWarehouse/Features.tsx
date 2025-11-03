import { Box, Container, Stack, Typography, Paper } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useTranslation } from "react-i18next";

export default function Features() {
  const { t } = useTranslation("shareWarehouse");

  const items = t("features.items", { returnObjects: true }) as {
    icon: string;
    title: string;
    desc: string;
  }[];

  const icons = [
    <LocalShippingOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />,
    <InventoryOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />,
    <SupportAgentOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />,
    <LockOutlinedIcon sx={{ fontSize: 36, color: "primary.main" }} />,
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "#F8FCFA" }}>
      <Container>
        <Stack spacing={4} alignItems="center">
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {t("features.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={600}>
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
                  flexBasis: { xs: "100%", sm: "45%", md: "20%" },
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
                  {icons[i % icons.length]}
                  <Typography variant="h6" fontWeight={600} color="text.primary">
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
