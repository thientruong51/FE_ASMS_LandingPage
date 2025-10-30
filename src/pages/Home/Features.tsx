import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslation } from "react-i18next";

const features = [
  {
    id: 1,
    icon: "📦",
    titleKey: "sub-features.tour.title",
    descKey: "sub-features.tour.desc",
    btnKey: "sub-features.tour.btn",
  },
  {
    id: 2,
    icon: "🚗",
    titleKey: "sub-features.car.title",
    descKey: "sub-features.car.desc",
    btnKey: "sub-features.car.btn",
  },
  {
    id: 3,
    icon: "💬",
    titleKey: "sub-features.support.title",
    descKey: "sub-features.support.desc",
    btnKey: "sub-features.support.btn",
  },
];

export default function Features() {
  const { t } = useTranslation();

  return (
    <Box sx={{ backgroundColor: "#E8F6F0", py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        {/* Tiêu đề */}
        <Typography
          variant="h4"
          align="center"
          fontWeight={700}
          sx={{ color: "primary.main", mb: 1 }}
        >
          {t("sub-features.title")}
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 760, mx: "auto" }}
        >
          {t("sub-features.subtitle")}
        </Typography>

        {/* Thẻ dịch vụ */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 4, md: 3 }}
          justifyContent="center"
          alignItems="stretch"
        >
          {features.map((f) => (
            <Card
              key={f.id}
              elevation={0}
              sx={{
                flex: 1,
                borderRadius: 3,
                backgroundColor: "#F6FBF9",
                border: "1px solid rgba(60,189,150,0.15)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  p: { xs: 4, md: 5 },
                }}
              >
                {/* Icon tròn */}
                <Box
                  sx={{
                    width: 90,
                    height: 90,
                    mx: "auto",
                    mb: 3,
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 42,
                    color: "#3CBD96",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  {f.icon}
                </Box>

                {/* Tiêu đề */}
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: "#125A44", mb: 2 }}
                >
                  {t(f.titleKey)}
                </Typography>

                {/* Mô tả */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 3,
                    px: { xs: 1, md: 2 },
                    lineHeight: 1.7,
                  }}
                >
                  {t(f.descKey)}
                </Typography>

                {/* Nút hành động */}
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    backgroundColor: "#3CBD96",
                    color: "#fff",
                    textTransform: "none",
                    borderRadius: "999px",
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    "&:hover": { backgroundColor: "#34a582" },
                  }}
                >
                  {t(f.btnKey)}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
