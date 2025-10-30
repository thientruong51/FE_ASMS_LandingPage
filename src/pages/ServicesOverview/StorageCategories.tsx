import { Box, Container, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function StorageCategories() {
  const { t } = useTranslation("servicesOverview");

  const items = [
    {
      img: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761759147/Khotuquandonoithat_rh3kxy.jpg",
      title: t("categories.furniture"),
    },
    {
      img: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761759147/Khotuquanvanphong_g5ml0j.jpg",
      title: t("categories.documents"),
    },
    {
      img: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761759147/Khotuquandogiadinh_wn7xcp.jpg",
      title: t("categories.personal"),
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
            mb={2}
          >
            {t("categories.title")}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            mb={6}
          >
            {t("categories.subtitle")}
          </Typography>
        </motion.div>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 4, md: 3 }}
          justifyContent="center"
          alignItems="stretch"
        >
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              style={{ flex: 1 }}
            >
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  cursor: "pointer",
                  "&:hover img": {
                    transform: "scale(1.05)",
                  },
                  "&:hover .overlay": {
                    opacity: 0.2,
                  },
                  "&:hover .title": {
                    color: "#3CBD96",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <Box
                  component="img"
                  src={item.img}
                  alt={item.title}
                  sx={{
                    width: "100%",
                    height: 260,
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                  }}
                />
                <Box
                  className="overlay"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#000",
                    opacity: 0,
                    transition: "opacity 0.4s ease",
                  }}
                />
                <Box
                  className="title"
                  sx={{
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: 18,
                    textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                    transition: "color 0.3s ease",
                  }}
                >
                  {item.title}
                </Box>
              </Box>
            </motion.div>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
