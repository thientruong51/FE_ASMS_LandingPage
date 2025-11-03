import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

export default function Hero() {
  const { t } = useTranslation("selfStorage");

  return (
    <Box>
      <Box
        sx={{
          bgcolor: "#3CBD96",
          color: "#fff",
          py: { xs: 6, md: 10 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container>
          <Stack spacing={2} maxWidth={800}>
            <Typography variant="h3" fontWeight={700}>
              {t("heroIntro.title")}
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              {t("heroIntro.desc")}
            </Typography>
          </Stack>

          {/* Icon chìa khóa / biểu tượng trang trí */}
          <Box
            component="img"
            src="https://res.cloudinary.com/dkfykdjlm/image/upload/v1761899999/key-illustration.png"
            alt="key shape"
            sx={{
              position: "absolute",
              right: { xs: -40, md: 60 },
              bottom: { xs: -40, md: -20 },
              width: { xs: 180, md: 260 },
              opacity: 0.25,
            }}
          />
        </Container>
      </Box>

      {/* --- Phần nội dung chính --- */}
      <Box
        sx={{
          bgcolor: "#F8FCFA",
          py: { xs: 6, md: 10 },
        }}
      >
        <Container>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 4, md: 8 }}
            alignItems="center"
          >
            {/* Ảnh bên trái */}
            <Stack spacing={2} sx={{ flex: 1, width: "100%", alignItems: "center" }}>
              <Box
                component="img"
                src="https://res.cloudinary.com/dkfykdjlm/image/upload/v1761893615/unnamed_qdf5zd.jpg"
                alt="medium storage unit"
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  objectFit: "cover",
                }}
              />
            </Stack>

            {/* Nội dung bên phải */}
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Typography variant="h3" color="primary.main" fontWeight={700}>
                {t("hero.title")}
              </Typography>

              <Typography variant="body1" color="text.secondary">
                {t("hero.desc")}
              </Typography>

              <Typography
                variant="h5"
                color="primary.main"
                fontWeight={600}
                sx={{ mt: 2 }}
              >
                {t("hero.sectionTitle")}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {t("hero.sectionDesc")}
              </Typography>

              <Stack component="ul" spacing={1.2} sx={{ pl: 3 }}>
                {(t("hero.bullets", { returnObjects: true }) as string[]).map(
                  (item, i) => (
                    <li key={i}>
                      <Typography variant="body2" color="text.secondary">
                        {item}
                      </Typography>
                    </li>
                  )
                )}
              </Stack>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to="/services/size-guide"
                sx={{
                  borderRadius: 10,
                  px: 4,
                  alignSelf: "flex-start",
                  mt: 2,
                  color:"#fff"
                }}
              >
                {t("hero.cta")}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
