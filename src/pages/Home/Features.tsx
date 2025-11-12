import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Features() {
  const { t } = useTranslation();

  const features = [
    {
      id: 1,
      icon: <ThreeDRotationIcon sx={{ fontSize: 42, color: "#3CBD96" }} />,
      titleKey: "sub-features.tour.title",
      descKey: "sub-features.tour.desc",
      btnKey: "sub-features.tour.btn",
    },
    {
      id: 2,
      icon: <LocalShippingIcon sx={{ fontSize: 42, color: "#3CBD96" }} />,
      titleKey: "sub-features.car.title",
      descKey: "sub-features.car.desc",
      btnKey: "sub-features.car.btn",
    },
    {
      id: 3,
      icon: <SupportAgentIcon sx={{ fontSize: 42, color: "#3CBD96" }} />,
      titleKey: "sub-features.support.title",
      descKey: "sub-features.support.desc",
      btnKey: "sub-features.support.btn",
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#E8F6F0", py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        {/* Tiêu đề */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h4"
            align="center"
            fontWeight={700}
            sx={{ color: "primary.main", mb: 1 }}
          >
            {t("sub-features.title")}
          </Typography>
        </motion.div>

        {/* Mô tả */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 760, mx: "auto" }}
          >
            {t("sub-features.subtitle")}
          </Typography>
        </motion.div>

        {/* Các card */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 4, md: 3 }}
          justifyContent="center"
          alignItems="stretch"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              style={{ flex: 1 }}
            >
              <Card
                elevation={0}
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  backgroundColor: "#F6FBF9",
                  border: "1px solid rgba(60,189,150,0.15)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    textAlign: "center",
                    p: { xs: 4, md: 5 },
                  }}
                >
                  <Box
                    sx={{
                      width: 90,
                      height: 90,
                      mx: "auto",
                      mb: 3,
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    {f.icon}
                  </Box>

                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: "#125A44", mb: 2 }}
                  >
                    {t(f.titleKey)}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 3,
                      px: { xs: 1, md: 2 },
                      lineHeight: 1.7,
                    }}
                  >
                    {t(f.descKey)}
                  </Typography>

                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      backgroundColor: "#3CBD96",
                      color: "#fff",
                      textTransform: "none",
                      borderRadius: "999px",
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      "&:hover": { backgroundColor: "#34a582" },
                    }}
                  >
                    {t(f.btnKey)}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
