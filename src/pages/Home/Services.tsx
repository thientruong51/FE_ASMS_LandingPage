import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link as RouterLink } from "react-router-dom";
import ElectricBorder from "../../components/ElectricBorder";
import GlareHover from '../../components/GlareHover';

export default function Services() {
  const { t } = useTranslation();

  const services = [
    {
      id: 1,
      tag: t("services.items.shared.tag"),
      title: t("services.items.shared.title"),
      image:
        "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761759147/Khochung_ham9v0.jpg",
      features: [
        t("services.items.shared.f1"),
        t("services.items.shared.f2"),
        t("services.items.shared.f3"),
      ],
    },
    {
      id: 2,
      tag: t("services.items.private.tag"),
      title: t("services.items.private.title"),
      image:
        "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761759147/Khotuquandogiadinh_wn7xcp.jpg",
      features: [
        t("services.items.private.f1"),
        t("services.items.private.f2"),
        t("services.items.private.f3"),
      ],
    },
  ];

  return (
    <Box sx={{ backgroundColor: "white", py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        {/* Tiêu đề section */}
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight={700}
          sx={{ color: "primary.main", mb: 1 }}
        >
          {t("sections.services")}
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          {t("services.lead")}
        </Typography>

        {/* Danh sách dịch vụ */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 6, md: 4 }}
          justifyContent="center"
          alignItems="stretch"
        >
          {services.map((item) => (
  <ElectricBorder
    key={item.id} 
    color="#3CBD96"
    speed={0.5}
    chaos={0.3}
    thickness={2}
    style={{ borderRadius: 30 }}
  >
    <Card
      sx={{
        flex: 1,
        borderRadius: 4,
        backgroundColor: "rgba(191, 227, 198, 0.11)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        },
      }}
    >
                {/* Tiêu đề nổi */}
                <Box
                  sx={{
                    backgroundColor: "primary.main",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    borderRadius: "999px",
                    alignSelf: "center",
                    mt: 1,
                    zIndex: 2,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {item.tag}
                </Box>

                {/* Ảnh */}
                <Box sx={{ px: 3, mt: -1 }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: 260,
                      borderRadius: 5,
                      overflow: "hidden", 
                    }}
                  >
                    <GlareHover
                      glareColor="#ffffff"
                      glareOpacity={0.3}
                      glareAngle={-30}
                      glareSize={300}
                      transitionDuration={800}
                      playOnce={false}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "inherit",
                        display: "block",
                      }}
                    >
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.title}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </GlareHover>
                  </Box>
                </Box>



                {/* Nội dung */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ color: "primary.main", mb: 2 }}
                    >
                      {item.title}
                    </Typography>

                    <Stack spacing={1.2}>
                      {item.features.map((f, i) => (
                        <Stack
                          direction="row"
                          spacing={1.5}
                          key={i}
                          alignItems="center"
                        >
                          <CheckIcon sx={{ color: "#3CBD96", fontSize: 18 }} />
                          <Typography variant="body2" color="text.secondary">
                            {f}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>

                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    component={RouterLink}
                    to="/contact"
                    sx={{
                      mt: 4,
                      alignSelf: "flex-start",
                      backgroundColor: "#3CBD96",
                      color: "#fff",
                      borderRadius: "999px",
                      textTransform: "none",
                      px: 4,
                      py: 1.2,
                      fontWeight: 600,
                      "&:hover": { backgroundColor: "#34a582" },
                    }}
                  >
                    {t("cta.getQuote")}
                  </Button>
                </CardContent>
              </Card>
            </ElectricBorder>

          ))}
        </Stack>
      </Container>
    </Box>
  );
}
