import { Box, Container, Typography, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const projects = [
 
  {
    title: "COMING SOON",
    img: "https://vinhomes-longbeach.com/wp-content/uploads/2025/03/khach-san-cao-cap-vinhomes-long-beach.webp",
  },
  {
    title: "VINHOME GRAND PARK",
    img: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1762186073/the-beverly-26_un47va.jpg",
  },
  {
    title: "VINHOME SMART CITY",
    img: "https://file4.batdongsan.com.vn/crop/492x273/2025/10/15/20251015103100-416c_wm.jpg",
  },
  {
    title: "COMING SOON",
    img: "https://vjsgroup.com/Upload/project/ocean-park-1.jpg",
  },
];

export default function Projects() {
  const { t } = useTranslation("partner");
  const [focusIndex, setFocusIndex] = useState(0);

  const next = () => {
    setFocusIndex((prev) => (prev + 1) % projects.length);
  };
  const prev = () => {
    setFocusIndex((prev) =>
      prev === 0 ? projects.length - 1 : prev - 1
    );
  };

  const handleDotClick = (i: number) => setFocusIndex(i);

  return (
    <Box sx={{ bgcolor: "#BFE3C6", color: "#204945", py: { xs: 8, md: 12 } }}>
      <Container>
        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          mb={6}
          color="#204945"
        >
          {t("projects.title")}
        </Typography>

        {/* Dàn ảnh hiển thị kế bên */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: 3,
            flexWrap: "nowrap",
            overflow: "hidden",
          }}
        >
          {projects.map((p, i) => {
            const isActive = i === focusIndex;
            return (
              <motion.div
                key={i}
                animate={{
                  scale: isActive ? 1.1 : 0.9,
                  opacity: isActive ? 1 : 0.7,
                  y: isActive ? -10 : 0,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                style={{
                  flex: "0 0 240px",
                  borderRadius: 20,
                  overflow: "hidden",
                  position: "relative",
                  background: "#fff",
                  boxShadow: isActive
                    ? "0 15px 30px rgba(0,0,0,0.2)"
                    : "0 8px 20px rgba(0,0,0,0.08)",
                  cursor: "pointer",
                }}
                onClick={() => handleDotClick(i)}
              >
                <Box
                  component="img"
                  src={p.img}
                  alt={p.title}
                  sx={{
                    width: "100%",
                    height: 360,
                    objectFit: "cover",
                    filter: isActive ? "brightness(1)" : "brightness(0.7)",
                    transition: "filter 0.4s",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(0,0,0,0.35)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    textAlign: "center",
                    px: 2,
                  }}
                >
                  <Typography
                    fontWeight={800}
                    letterSpacing={1}
                    sx={{
                      textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                      fontSize: 16,
                    }}
                  >
                    {p.title}
                  </Typography>
                </Box>
              </motion.div>
            );
          })}
        </Box>

        {/* Thanh điều hướng */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            mt: 6,
          }}
        >
          {/* Nút trái */}
          <IconButton
            onClick={prev}
            sx={{
              width: 48,
              height: 48,
              bgcolor: "rgba(255,255,255,0.3)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.5)" },
            }}
          >
            <ArrowBackIosNewIcon sx={{ color: "#fff" }} />
          </IconButton>

          {/* Dots */}
          <Box sx={{ display: "flex", gap: 1.2 }}>
            {projects.map((_, i) => (
              <Box
                key={i}
                onClick={() => handleDotClick(i)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor:
                    i === focusIndex ? "#fff" : "rgba(255,255,255,0.5)",
                  transition: "all 0.3s",
                  cursor: "pointer",
                }}
              />
            ))}
          </Box>

          {/* Nút phải */}
          <IconButton
            onClick={next}
            sx={{
              width: 48,
              height: 48,
              bgcolor: "rgba(255,255,255,0.3)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.5)" },
            }}
          >
            <ArrowForwardIosIcon sx={{ color: "#fff" }} />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
}
