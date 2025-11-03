import { Box, Button, Container, Stack, Typography, Avatar } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

export default function ReviewSection() {
  const { t } = useTranslation("process");

  return (
    <Box sx={{ bgcolor: "#FFFFFF", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">
        <Stack spacing={4} alignItems="center" textAlign="center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {t("review.title")}
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
              sx={{ maxWidth: 600, lineHeight: 1.8, fontStyle: "italic" }}
            >
              “{t("review.text")}”
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Stack direction="row" spacing={2} alignItems="center" mt={1}>
              <Avatar
                alt={t("review.author")}
                src={`${import.meta.env.BASE_URL}images/review-avatar.jpg`}
                sx={{ width: 56, height: 56 }}
              />
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                {t("review.author")}
              </Typography>
            </Stack>
          </motion.div>

          <Button
            component={RouterLink}
            to="/reviews"
            variant="contained"
            sx={{
              mt: 4,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "#2EA67E" },
              px: 4,
              borderRadius: 10,
              fontWeight: 600,
            }}
          >
            {t("review.cta")}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
