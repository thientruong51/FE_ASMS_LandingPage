import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const { t } = useTranslation("partner");

  const handleScrollToForm = () => {
    const form = document.getElementById("estimate-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        backgroundImage:
          "url('https://res.cloudinary.com/dkfykdjlm/image/upload/v1762186073/the-beverly-26_un47va.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        textAlign: "right",
        py: { xs: 10, md: 18 },
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.55)" }} />
      <Container sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={3} alignItems="flex-end">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h3" fontWeight={700}>
              {t("hero.title1")} <br />
              <Box component="span" color="#BFE3C6">
                {t("hero.title2")}
              </Box>
            </Typography>
          </motion.div>

          <Button
            variant="contained"
            onClick={handleScrollToForm}
            sx={{
              bgcolor: "#3CBD96",
              color: "#fff",
              px: 4,
              py: 1.5,
              fontWeight: 700,
              borderRadius: 3,
              "&:hover": { bgcolor: "#34aa87" },
            }}
          >
            {t("hero.cta")}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
