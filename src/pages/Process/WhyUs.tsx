import { Box, Container, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function WhyUs() {
  const { t } = useTranslation("process");

  const items = t("why.items", { returnObjects: true }) as {
    title: string;
    desc: string;
  }[];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "#F8FCFA" }}>
      <Container>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={6}
          alignItems="center"
        >
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700} color="primary.main" mb={3}>
              {t("why.title")}
            </Typography>

            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.2 }}
              >
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  {item.title}
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 2,
                    bgcolor: "primary.main",
                    my: 1,
                  }}
                />
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {item.desc}
                </Typography>
              </motion.div>
            ))}
          </Box>

          <motion.img
            src={`https://res.cloudinary.com/dkfykdjlm/image/upload/v1761766378/gui-hang-gia-tri-cao-1_kp2q1r.jpg`}
            alt="why us"
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 12,
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            }}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          />
        </Stack>
      </Container>
    </Box>
  );
}
