import { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useTranslation } from "react-i18next";
import LiquidEther from '../../components/LiquidEther';
import GlareHover from "../../components/GlareHover";
import ShinyText from "../../components/ShinyText";

interface Slide {
  title: string;
  subtitle: string;
  image: string;
}

export default function Hero() {
  const { t, i18n } = useTranslation();
  const slides = t("hero.slides", { returnObjects: true }) as Slide[];

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const total = slides.length;

  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + total) % total);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % total);
    }, 13000);
    return () => clearInterval(timer);
  }, [total, i18n.language]);

  const slide = slides[current];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      zIndex: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      zIndex: 0,
    }),
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 3, md: 10 },
          pb: { xs: 6, md: 8 },
          minHeight: { xs: "75vh", md: "90vh" },
          backgroundColor: "#ccc",
        }}
      >
        {/* --- Liquid background: zIndex thấp, pointerEvents none --- */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "auto",
          }}
        >
          <LiquidEther
            colors={["#85FE75", "#32EC82", "#60F4A3"]}
            mouseForce={20}
            cursorSize={80}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          />
        </Box>

        {/* Gradient overlay (nhẹ): zIndex giữa */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundImage: `url("https://res.cloudinary.com/dkfykdjlm/image/upload/v1766405842/content_zhwv2c.png") `,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            pointerEvents: "none",
          }}
        />


        {/* Mũi tên trái (zIndex cao hơn nội dung) */}
        <IconButton
          onClick={handlePrev}
          sx={{
            position: "absolute",
            left: { xs: 10, md: 40 },
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            "&:hover": { backgroundColor: "#3CBD96", color: "white" },
            zIndex: 4,
          }}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>

        {/* Nội dung chính: zIndex > LiquidEther */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 5, md: 3 }}
          alignItems="center"
          justifyContent="space-between"
          sx={{
            width: "100%",
            margin: "0 auto",
            marginLeft: { xs: 0, md: 5 },
            zIndex: 3,
            position: "relative",
          }}
        >

          <Stack flex={1} spacing={3}>
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={slide.title + i18n.language}
                variants={variants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 200, damping: 25 },
                  opacity: { duration: 0.3 },
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  <ShinyText
                    text={slide.title}
                    disabled={false}
                    speed={1}
                    className="shiny-title"
                  />
                </Typography>

                <Typography
                  variant="body1"
                  color="#fff"
                  sx={{ maxWidth: 480, mt: 2 }}
                >
                  {slide.subtitle}
                </Typography>
                <Stack direction="row" spacing={2} mt={3}>
                  <Button
                    variant="contained"
                    size="large"
                    component={RouterLink}
                    to="/booking"
                    sx={{
                      backgroundColor: "#3CBD96",
                      color: "#fff",
                      borderRadius: "999px",
                      textTransform: "none",
                      px: 4,
                      "&:hover": { backgroundColor: "#34a582" },
                    }}
                  >
                    {t("cta.getStarted")}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    component={RouterLink}
                    to="/contact"
                    sx={{
                      color: "#3CBD96",
                      borderColor: "#3CBD96",
                      borderRadius: "999px",
                      textTransform: "none",
                      px: 4,
                      "&:hover": {
                        backgroundColor: "rgba(60,189,150,0.08)",
                      },
                    }}
                  >
                    {t("cta.contactUs")}
                  </Button>
                </Stack>
              </motion.div>
            </AnimatePresence>
          </Stack>

          {/* Hình ảnh */}
          <Box
            flex={0.9}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={slide.image + i18n.language}
                variants={variants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 200, damping: 25 },
                  opacity: { duration: 0.3 },
                }}
                style={{
                  position: "absolute",
                  width: "75%",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "5px solid #76af87ff",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
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
                  <img
                    src={slide.image}
                    alt={slide.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "inherit",
                      display: "block",
                    }}
                  />
                </GlareHover>
              </motion.div>
            </AnimatePresence>
          </Box>

        </Stack>

        {/* Mũi tên phải */}
        <IconButton
          onClick={handleNext}
          sx={{
            position: "absolute",
            right: { xs: 10, md: 40 },
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            "&:hover": { backgroundColor: "#3CBD96", color: "white" },
            zIndex: 4,
          }}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Box>
    </>
  );
}
