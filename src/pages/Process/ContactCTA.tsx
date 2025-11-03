import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";

export default function ContactCTA() {
  const { t } = useTranslation("process");

  return (
    <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: "#FFFFFF" }}>
      <Container>
        <Stack spacing={3} alignItems="center" textAlign="center">
          {/* ===== ICON ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <LocalPhoneOutlinedIcon
              sx={{
                fontSize: 70,
                color: "primary.main",
                mb: 1,
              }}
            />
          </motion.div>

          {/* ===== TEXT ===== */}
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {t("contact.title")}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, lineHeight: 1.8 }}
          >
            {t("contact.subtitle")}
          </Typography>

          {/* ===== BUTTON ===== */}
          <Button
            component={RouterLink}
            to="/contact"
            variant="contained"
            sx={{
              mt: 2,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "#2EA67E" },
              px: 4,
              py: 1.2,
              borderRadius: 10,
              fontWeight: 600,
            }}
          >
            {t("contact.cta")}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
