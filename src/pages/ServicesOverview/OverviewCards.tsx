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

export default function OverviewCards() {
  const { t } = useTranslation("servicesOverview");

  const cards = [
  {
    key: "self",
    img: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761759147/Khotuquandogiadinh_wn7xcp.jpg",
    title: t("overview.self.title"),
    desc: t("overview.self.desc"),
    features: t("overview.self.features", { returnObjects: true }) as string[],
    btn: t("overview.self.btn"),
  },
  {
    key: "shared",
    img: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761759147/Khochung_ham9v0.jpg",
    title: t("overview.shared.title"),
    desc: t("overview.shared.desc"),
    features: t("overview.shared.features", { returnObjects: true }) as string[],
    btn: t("overview.shared.btn"),
  },
];


  return (
    <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: "#F9FAF9" }}>
      <Container>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 4, md: 6 }}
          justifyContent="center"
          alignItems="stretch"
          
        >
          {cards.map((card, index) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              style={{ flex: 1 }}
            >
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  component="img"
                  src={card.img}
                  alt={card.title}
                  sx={{
                    height: 220,
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
                <CardContent sx={{ flex: 1, p: 3 }}>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color= "primary.main"
                    mb={1.5}
                  >
                    {card.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {card.desc}
                  </Typography>

                  <Stack spacing={1} mb={3}>
                    {card.features.map((f: string, i: number) => (
                      <Stack
                        direction="row"
                        key={i}
                        spacing={1.2}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: "#3CBD96",
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ lineHeight: 1.5 }}
                        >
                          {f}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#3CBD96",
                      color: "white",
                      borderRadius: "999px",
                      fontWeight: 600,
                      textTransform: "none",
                      px: 3,
                      "&:hover": { backgroundColor: "#35a982" },
                    }}
                  >
                    {card.btn}
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
