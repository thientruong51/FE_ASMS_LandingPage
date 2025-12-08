import { Box, Container, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import Footer from "../Home/Footer";
import Hero from "../Home/Hero";

export default function About() {
  const { t } = useTranslation("about");

  const sections = [
    {
      key: "intro",
      img: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761893615/unnamed_qdf5zd.jpg",
      reverse: false,
    },
    {
      key: "why",
      img: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761893688/unnamed_1_xnylyk.jpg",
      reverse: true,
    },
    {
      key: "safe",
      img: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761766102/kho-hang-la-gi_fguad1.jpg",
      reverse: false,
    },
  ];

  return (
    <Box>
      <Header />

      {/* ===== HERO SECTION ===== */}
      <Hero />

      {/* ===== CONTENT SECTIONS ===== */}
      <Container sx={{ py: { xs: 8, md: 10 } }}>
        {sections.map((s) => (
          <Stack
            key={s.key}
            direction={{
              xs: "column",
              md: s.reverse ? "row-reverse" : "row",
            }}
            spacing={6}
            alignItems="center"
            mb={10}
          >
            {/* ==== IMAGE ==== */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              style={{ flex: 1 }}
            >
              <Box
                component="img"
                src={s.img}
                alt={t(`${s.key}.title`)}
                sx={{
                  width: "100%",
                  borderRadius: 3,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                }}
              />
            </motion.div>

            {/* ==== TEXT ==== */}
            <motion.div
              initial={{ opacity: 0, x: s.reverse ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              style={{ flex: 1 }}
            >
              <Stack spacing={2}>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  color="primary.main"
                  sx={{
                    position: "relative",
                    display: "inline-block",
                    "&::after": {
                      content: '""',
                      display: "block",
                      width: 50,
                      height: 3,
                      bgcolor: "primary.main",
                      mt: 1,
                    },
                  }}
                >
                  {t(`${s.key}.title`)}
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-line" }}
                >
                  {t(`${s.key}.desc`)}
                </Typography>
              </Stack>
            </motion.div>
          </Stack>
        ))}
      </Container>

      <Footer />
    </Box>
  );
}
