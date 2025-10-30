import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Paper,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

export default function Compare() {
  const { t } = useTranslation();

  const features = [
    { key: "f1" },
    { key: "f2" },
    { key: "f3" },
    { key: "f4" },
    { key: "f5" },
    { key: "f6" },
  ];

  const shared = [true, true, true, true, false, true];
  const privateS = [true, true, true, false, true, false];

  return (
    <Box sx={{ backgroundColor: "#F0FAF7", py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight={700}
          sx={{ color: "primary.main", mb: 1 }}
        >
          {t("compare.title")}
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          {t("compare.subtitle")}
        </Typography>

        {/* --- Bảng so sánh --- */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          {/* Cột text bên trái */}
          <Paper
            sx={{
              flex: 1.5,
              backgroundColor: "#E8F6F0",
              boxShadow: "none",
              borderRadius: 2,
              mt:8.3,
              p: { xs: 2, md: 3 },
            }}
          >
            <Stack spacing={2.5}>
              {features.map((item) => (
                <Typography
                  key={item.key}
                  sx={{
                    color: "#125A44",
                    fontWeight: 500,
                  }}
                >
                  {t(`compare.features.${item.key}`)}
                </Typography>
              ))}
            </Stack>
          </Paper>

          {/* Hai cột dịch vụ */}
          {[shared, privateS].map((col, index) => (
            <Paper
              key={index}
              elevation={3}
              sx={{
                flex: 1,
                borderRadius: 3,
                p: { xs: 2, md: 3 },
                textAlign: "center",
                backgroundColor: "#fff",
                minWidth: 200,
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#3CBD96",
                  color: "#fff",
                  px: 3,
                  py: 1,
                  borderRadius: "12px",
                  fontWeight: 600,
                  display: "inline-block",
                  mb: 3,
                }}
              >
                {index === 0
                  ? t("compare.columns.shared")
                  : t("compare.columns.private")}
              </Box>

              <Stack spacing={2.5} alignItems="center">
                {col.map((val, i) =>
                  val ? (
                    <CheckIcon
                      key={i}
                      sx={{ color: "#0074B7", fontSize: 28 }}
                    />
                  ) : (
                    <CloseIcon
                      key={i}
                      sx={{ color: "#FF8B3D", fontSize: 28 }}
                    />
                  )
                )}
              </Stack>
            </Paper>
          ))}
        </Box>

        {/* --- Nút dưới cùng --- */}
        <Stack alignItems="center" mt={6}>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            component={RouterLink}
            to="/services"
            sx={{
              backgroundColor: "primary.main",
              color:"#fff",
              borderRadius: "999px",
              textTransform: "none",
              px: 4,
              py: 1.2,
              fontWeight: 600,
              "&:hover": { backgroundColor: "#34a582" },
            }}
          >
            {t("cta.readMore")}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
