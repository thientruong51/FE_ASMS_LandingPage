import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const { t } = useTranslation("servicesOverview");

  return (
    <Box
      sx={{
        backgroundColor: "#3CBD96",
        color: "white",
        py: { xs: 8, md: 12 },
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Icon minh họa */}
      <Box
        component="img"
        src="/assets/icon-keyhole.svg"
        alt="Keyhole"
        sx={{
          position: "absolute",
          right: { xs: "-80px", md: "-120px" },
          bottom: { xs: "-60px", md: "-100px" },
          width: { xs: 180, md: 280 },
          opacity: 0.15,
        }}
      />

      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h3" fontWeight={700} mb={2}>
            {t("hero.title")}
          </Typography>

          <Typography variant="h6" fontWeight={400} lineHeight={1.6}>
            {t("hero.subtitle")}
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
}
