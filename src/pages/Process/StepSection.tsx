import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

import AssignmentIcon from "@mui/icons-material/Assignment";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";

const icons = [
  <AssignmentIcon sx={{ fontSize: 64, color: "primary.main" }} />,
  <LocalShippingOutlinedIcon sx={{ fontSize: 64, color: "primary.main" }} />,
  <ReplayOutlinedIcon sx={{ fontSize: 64, color: "primary.main" }} />,
];

export default function StepSection() {
  const { t } = useTranslation("process");

  const steps = t("steps.items", { returnObjects: true }) as {
    title: string;
    desc: string;
  }[];

  return (
    <Box sx={{ bgcolor: "#F8FCFA", py: { xs: 8, md: 12 } }}>
      <Container>
        {/* ==== HEADER ==== */}
        <Stack spacing={2} textAlign="center" alignItems="center" mb={6}>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {t("steps.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700 }}>
            {t("steps.subtitle")}
          </Typography>
        </Stack>

        {/* ==== STEPS ==== */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
        >
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.2 }}
              style={{ flex: 1 }}
            >
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  boxShadow: "0 6px 25px rgba(60,189,150,0.08)",
                  overflow: "hidden",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 10px 30px rgba(60,189,150,0.15)",
                  },
                  py: 4,
                }}
              >
                {/* Icon */}
                <Box display="flex" justifyContent="center" mb={2}>
                  {icons[i]}
                </Box>

                {/* Nội dung */}
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {t("steps.step")} {i + 1}
                  </Typography>

                  <Typography
                    variant="h6"
                    color="text.primary"
                    fontWeight={600}
                    mt={1}
                    mb={1}
                  >
                    {s.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    lineHeight={1.6}
                    sx={{ maxWidth: 300, mx: "auto" }}
                  >
                    {s.desc}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Stack>

        {/* ==== CTA ==== */}
        <Stack alignItems="center" mt={8}>
          <Button
            component={RouterLink}
            to="/contact"
            variant="contained"
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "#2EA67E" },
              px: 4,
              py: 1.2,
              borderRadius: 10,
              fontWeight: 600,
              color:"#fff"
            }}
          >
            {t("steps.cta")}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
