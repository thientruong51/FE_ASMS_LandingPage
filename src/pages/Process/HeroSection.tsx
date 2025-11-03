import { Box, Container, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function HeroSection() {
  const { t } = useTranslation("process");

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: "linear-gradient(180deg, #BFE3C6 0%, #F8FCFA 100%)",
      }}
    >
      <Container>
        <Stack spacing={4} alignItems="center" textAlign="center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" fontWeight={700} color="primary.main">
              {t("hero.title")}
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 700, lineHeight: 1.8 }}
            >
              {t("hero.subtitle")}
            </Typography>
          </motion.div>

        </Stack>
      </Container>
    </Box>
  );
}
