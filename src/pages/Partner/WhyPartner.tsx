import { Box, Container, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function WhyPartner() {
  const { t } = useTranslation("partner");
  const rawItems = t("why.items", { returnObjects: true });
  const items = Array.isArray(rawItems) ? rawItems : [];

  return (
    <Box sx={{ bgcolor: "#E9F4F3", py: { xs: 8, md: 12 } }}>
      <Container>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
          gap={2}
        >
          <Paper
            elevation={0}
            sx={{
              bgcolor: "#BFE3C6",
              color: "#204945",
              borderRadius: 4,
              p: 4,
              gridRow: { md: "span 2" },
              display: "flex",
              alignItems: "flex-end",
              backgroundImage:
                "radial-gradient(180px 180px at 20% 15%, rgba(255,255,255,0.5), rgba(191,227,198,0))",
            }}
          >
            <Typography variant="h5" fontWeight={700}>
              {t("why.title")}
            </Typography>
          </Paper>

          {items.map((it: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Paper
                elevation={0}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 4,
                  p: 4,
                  minHeight: 180,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                }}
              >
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{ color: "#3CBD96", mb: 1 }}
                >
                  {it.num}
                </Typography>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {it.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {it.desc}
                </Typography>
              </Paper>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
