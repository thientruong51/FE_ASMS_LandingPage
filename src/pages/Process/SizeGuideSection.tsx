import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

export default function SizeGuideSection() {
  const { t } = useTranslation("process");

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: "linear-gradient(180deg, #BFE3C6 0%, #F8FCFA 100%)",
      }}
    >
      <Container>
        <Stack
          spacing={4}
          alignItems="center"
          textAlign="center"
          maxWidth={700}
          mx="auto"
        >
          {/* ===== TEXT ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography variant="h4" fontWeight={700} color="primary.main" mb={2}>
              {t("size.title")}
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
              sx={{ lineHeight: 1.8 }}
            >
              {t("size.subtitle")}
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Button
              component={RouterLink}
              to="/services/size-guide"
              variant="contained"
              sx={{
                mt: 2,
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "#2EA67E" },
                px: 4,
                py: 1.2,
                borderRadius: 10,
                fontWeight: 600,
                color:"#fff"
              }}
            >
              {t("size.cta")}
            </Button>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  );
}
