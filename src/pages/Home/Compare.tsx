import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";

export default function Compare() {
  const { t } = useTranslation();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));

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

  const viewportProps = { once: true, amount: 0.2 };

  // Small helper to render check/close icon (consistent)
  const IconYes = () => <CheckIcon sx={{ color: "#0074B7", fontSize: 28 }} />;
  const IconNo = () => <CloseIcon sx={{ color: "#FF8B3D", fontSize: 28 }} />;

  return (
    <Box sx={{ backgroundColor: "#F0FAF7", py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={viewportProps}
        >
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight={700}
            sx={{ color: "primary.main", mb: 1 }}
          >
            {t("compare.title")}
          </Typography>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.06 }}
          viewport={viewportProps}
        >
          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: { xs: 4, md: 6 }, maxWidth: 960, mx: "auto" }}
          >
            {t("compare.subtitle")}
          </Typography>
        </motion.div>

        {mdUp ? (
          /* ---------- DESKTOP / TABLET (>= md) ---------- */
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: 4,
              flexWrap: "nowrap",
            }}
          >
            {/* Left labels column */}
            <Paper
              sx={{
                flex: 1.6,
                backgroundColor: "#E8F6F0",
                boxShadow: "none",
                borderRadius: 2,
                mt: 8.3,
                p: { xs: 2, md: 3 },
              }}
            >
              <Stack spacing={2.5}>
                {features.map((item, idx) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.04 }}
                    viewport={viewportProps}
                  >
                    <Typography sx={{ color: "#125A44", fontWeight: 500 }}>
                      {t(`compare.features.${item.key}`)}
                    </Typography>
                  </motion.div>
                ))}
              </Stack>
            </Paper>

            {/* Two service columns */}
            {[shared, privateS].map((col, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.06 + index * 0.06 }}
                viewport={viewportProps}
                style={{ flex: 1, minWidth: 220 }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    flex: 1,
                    borderRadius: 3,
                    p: { xs: 2, md: 3 },
                    textAlign: "center",
                    backgroundColor: "#fff",
                    minHeight: 240,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
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

                  <Stack spacing={2.5} alignItems="center" sx={{ mt: 1 }}>
                    {col.map((val, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.08 + i * 0.03 }}
                        viewport={viewportProps}
                      >
                        {val ? <IconYes /> : <IconNo />}
                      </motion.div>
                    ))}
                  </Stack>
                </Paper>
              </motion.div>
            ))}
          </Box>
        ) : (
          /* ---------- MOBILE (xs) ---------- */
          <Stack spacing={2} sx={{ mt: 2 }}>
            {/* Header row on mobile showing column labels */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 1,
                mb: 1,
              }}
            >
              <Box sx={{ flex: 1.2 }} />
              <Box
                sx={{
                  flex: 0.9,
                  textAlign: "center",
                  fontWeight: 600,
                  color: "text.secondary",
                }}
              >
                {t("compare.columns.sharedShort") ?? t("compare.columns.shared")}
              </Box>
              <Box
                sx={{
                  flex: 0.9,
                  textAlign: "center",
                  fontWeight: 600,
                  color: "text.secondary",
                }}
              >
                {t("compare.columns.privateShort") ?? t("compare.columns.private")}
              </Box>
            </Box>

            {features.map((item, idx) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.03 }}
                viewport={viewportProps}
              >
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    backgroundColor: "#fff",
                    border: "1px solid #EEF6F2",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: "#125A44", fontWeight: 500 }}>
                      {t(`compare.features.${item.key}`)}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 0.9, textAlign: "center" }}>
                    {shared[idx] ? <IconYes /> : <IconNo />}
                  </Box>

                  <Box sx={{ flex: 0.9, textAlign: "center" }}>
                    {privateS[idx] ? <IconYes /> : <IconNo />}
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </Stack>
        )}

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          viewport={viewportProps}
        >
          <Stack alignItems="center" mt={{ xs: 4, md: 6 }}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              component={RouterLink}
              to="/services/types"
              sx={{
                backgroundColor: "primary.main",
                color: "#fff",
                borderRadius: "999px",
                textTransform: "none",
                px: { xs: 3.5, md: 4 },
                py: 1.1,
                fontWeight: 600,
                "&:hover": { backgroundColor: "#34a582" },
              }}
            >
              {t("cta.readMore")}
            </Button>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
}
