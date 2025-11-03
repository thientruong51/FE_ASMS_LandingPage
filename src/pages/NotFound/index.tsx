import { Button, Container, Stack, Typography, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <Container
        maxWidth="md"
        sx={{
          py: { xs: 10, md: 14 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Icon + số 404 */}
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              backgroundColor: "rgba(60,189,150,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 64, color: "#3CBD96" }} />
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "3rem", md: "4.5rem" },
              color: "#125A44",
              letterSpacing: 2,
            }}
          >
            404
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 500,
              lineHeight: 1.6,
            }}
          >
            {t("notFound.text") ||
              "Oops! The page you’re looking for doesn’t exist or has been moved."}
          </Typography>

          <Button
            variant="contained"
            component={RouterLink}
            to="/"
            sx={{
              mt: 3,
              px: 4,
              py: 1.2,
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#3CBD96",
              "&:hover": { backgroundColor: "#34a582" },
            }}
          >
            {t("cta.backHome") || "Back to Home"}
          </Button>
        </Stack>

        {/* Nền hoặc hiệu ứng trang trí nhẹ */}
        <Box
          sx={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 600,
            height: 180,
            background:
              "radial-gradient(circle at center, rgba(60,189,150,0.12), transparent 70%)",
            zIndex: -1,
          }}
        />
      </Container>
    </>
  );
}
