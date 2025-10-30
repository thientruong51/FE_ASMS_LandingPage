import {
  Box,
  Container,
  Stack,
  Typography,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

export default function Steps() {
  const { t } = useTranslation("servicesOverview");

  const steps = [
    {
      number: "01",
      title: t("steps.step1.title"),
      desc: t("steps.step1.desc"),
      icon: <AssignmentIcon sx={{ fontSize: 56, color: "#3CBD96" }} />,
    },
    {
      number: "02",
      title: t("steps.step2.title"),
      desc: t("steps.step2.desc"),
      icon: <WarehouseIcon sx={{ fontSize: 56, color: "#3CBD96" }} />,
    },
    {
      number: "03",
      title: t("steps.step3.title"),
      desc: t("steps.step3.desc"),
      icon: <LocalShippingIcon sx={{ fontSize: 56, color: "#3CBD96" }} />,
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: "#FFFFFF" }}>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
           color= "primary.main"
            textAlign="center"
            mb={6}
          >
            {t("steps.title")}
          </Typography>
        </motion.div>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 4, md: 3 }}
          justifyContent="center"
          alignItems="stretch"
        >
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{ flex: 1 }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  backgroundColor: "#F7FDF9",
                  border: "1px solid #E0F0E6",
                }}
              >
                <Box sx={{ mb: 2 }}>{s.icon}</Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="#3CBD96"
                  mb={1}
                >
                  {t("steps.step")} {s.number}
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  color="#125A44"
                  mb={1}
                >
                  {s.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxWidth: 260 }}
                >
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
