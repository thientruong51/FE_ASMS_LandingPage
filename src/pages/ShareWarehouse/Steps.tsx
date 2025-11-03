import { Box, Container, Stack, Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";

export default function Steps() {
  const { t } = useTranslation("shareWarehouse");

  const steps = t("steps.items", { returnObjects: true }) as {
    step: string;
    title: string;
    desc: string;
  }[];

  const icons = [
    <LocalShippingOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    <WarehouseOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    <PhoneInTalkOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />, 
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "#F8FCFA" }}>
      <Container>
        <Stack spacing={4} alignItems="center">
          {/* ===== Header ===== */}
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {t("steps.title")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            maxWidth={600}
          >
            {t("steps.desc")}
          </Typography>

          {/* ===== Danh sách các bước ===== */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            justifyContent="center"
            alignItems="stretch"
            sx={{ width: "100%", mt: 4 }}
          >
            {steps.map((step, i) => (
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
                  {/* Icon minh họa */}
                  {icons[i % icons.length]}

                  {/* Tiêu đề và mô tả */}
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ mt: 1 }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1.5 }}
                  >
                    {step.desc}
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
