import { Box, Container, Stack, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Process() {
  const { t } = useTranslation("partner");
  const rawSteps = t("process.steps", { returnObjects: true });
  const steps = Array.isArray(rawSteps) ? rawSteps : [];

  return (
    <Box sx={{ bgcolor: "#E9F4F3", py: { xs: 8, md: 10 } }}>
      <Container>
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={6} color="#204945">
          {t("process.title")}
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
          textAlign="left"
        >
          {steps.map((s: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ flex: 1 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#fff",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: "#3CBD96",
                    color: "#fff",
                    fontWeight: 700,
                    display: "grid",
                    placeItems: "center",
                    mb: 2,
                  }}
                >
                  {i + 1}
                </Box>
                <Typography fontWeight={700} mb={0.5} color="text.primary">
                  {s.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.desc}
                </Typography>
              </Paper>
            </motion.div>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
