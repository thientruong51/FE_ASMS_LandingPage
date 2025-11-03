import { Box, Container, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import TruckLoadCard from "../../components/TruckLoadCard";

export default function Warehouse3D() {
  const { t } = useTranslation("shareWarehouse");

  return (
    <Box sx={{ bgcolor: "#F8FCFA", py: { xs: 8, md: 12 } }}>
      <Container>
        <Stack spacing={4} alignItems="center" textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight={700} color="primary.main">
            {t("facility.title")}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 700 }}
          >
            {t("facility.desc")}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              maxWidth: 1000,
              width: "100%",
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              bgcolor: "#fff",
            }}
          >
            <TruckLoadCard />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
