import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Container,
  IconButton,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

type ReviewItem = {
  name: string;
  role: string;
  text: string;
  avatar?: string;
  rating?: number;
};

export default function Reviews() {
  const { t, i18n } = useTranslation();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const raw = t("reviews.items", { returnObjects: true });
    if (Array.isArray(raw)) {
      setReviews(raw as ReviewItem[]);
    }
  }, [i18n.language, t]);

  const getAvatar = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=BFE3C6&color=125A44&bold=true`;

  // motion configs
  const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.56 } };
  const itemFade = (i = 0) => ({ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: i * 0.08 } });

  return (
    <Box sx={{ backgroundColor: "#F0FAF7", py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        {/* Title */}
        <motion.div
          initial={fadeUp.initial}
          whileInView={fadeUp.whileInView}
          transition={fadeUp.transition}
          viewport={{ once: true, amount: 0.2 }}
        >
          <Typography
            variant="h4"
            align="center"
            fontWeight={700}
            sx={{ color: "primary.main", mb: 1 }}
          >
            {t("reviews.title")}
          </Typography>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.56, delay: 0.06 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 760, mx: "auto" }}
          >
            {t("reviews.subtitle")}
          </Typography>
        </motion.div>

        {reviews.length === 0 ? (
          <Typography align="center" color="text.secondary">
            Loading reviews...
          </Typography>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.04 }}
            viewport={{ once: true, amount: 0.15 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 4,
                background:
                  "linear-gradient(180deg, rgba(191,227,198,0.25) 0%, rgba(191,227,198,0.18) 100%)",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={{ xs: 3, md: 4 }}
                alignItems="stretch"
              >
                {/* LEFT LIST with scroll */}
                <Stack
                  sx={{
                    flex: 1,
                    minWidth: 280,
                    maxHeight: 380,
                    overflowY: "auto",
                    pr: 1,
                    "&::-webkit-scrollbar": { width: 6 },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(0,0,0,0.2)",
                      borderRadius: 3,
                    },
                  }}
                  spacing={2}
                >
                  {reviews.map((item, idx) => {
                    const active = idx === selected;
                    return (
                      <motion.div
                        key={idx}
                        initial={itemFade(idx).initial}
                        whileInView={itemFade(idx).whileInView}
                        transition={itemFade(idx).transition}
                        viewport={{ once: true, amount: 0.3 }}
                        style={{ display: "block", minWidth: 0 }}
                      >
                        <Paper
                          onClick={() => setSelected(idx)}
                          elevation={0}
                          sx={{
                            p: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            borderRadius: 3,
                            cursor: "pointer",
                            backgroundColor: active ? "#E6F5EC" : "#FFFFFF",
                            transition: "all .25s ease",
                            border: active
                              ? "1px solid rgba(60,189,150,0.35)"
                              : "1px solid rgba(0,0,0,0.06)",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              backgroundColor: active ? "#E1F3E8" : "#FAFFFC",
                            },
                          }}
                        >
                          <Avatar
                            src={getAvatar(item.name)}
                            alt={item.name}
                            sx={{
                              width: 48,
                              height: 48,
                              border: "2px solid #BFE3C6",
                              flexShrink: 0,
                            }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="subtitle1"
                              noWrap
                              sx={{ fontWeight: 600, color: "#0F4436" }}
                            >
                              {item.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                              sx={{ opacity: 0.9 }}
                            >
                              {item.role}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            sx={{
                              color: active ? "primary.main" : "text.secondary",
                            }}
                          >
                            <ArrowForwardIosIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      </motion.div>
                    );
                  })}
                </Stack>

                {/* RIGHT CONTENT */}
                <motion.div
                  // animate whole right panel when it comes into view
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.56, delay: 0.08 }}
                  viewport={{ once: true, amount: 0.2 }}
                  style={{ flex: 2, minWidth: 0 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      flex: 2,
                      borderRadius: 4,
                      p: { xs: 3, md: 5 },
                      backgroundColor: "#FFFFFF",
                      border: "1px solid rgba(0,0,0,0.06)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      minWidth: 0,
                    }}
                  >
                    {/* Quote icon */}
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                      <FormatQuoteIcon
                        sx={{ fontSize: 36, color: "primary.main", opacity: 0.9 }}
                      />
                    </Box>

                    {/* Animated text block — keyed by selected so it animates on change */}
                    <motion.div
                      key={selected}
                      initial={{ opacity: 0, y: 12, scale: 0.995 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.44 }}
                    >
                      <Typography
                        variant="body1"
                        align="center"
                        sx={{
                          color: "#173E33",
                          lineHeight: 1.8,
                          maxWidth: 740,
                          mx: "auto",
                          mb: 3,
                          minHeight: { xs: 80, md: 120 }, // keep stable height
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {reviews[selected]?.text}
                      </Typography>

                      <Stack spacing={0.5} alignItems="center">
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, color: "#0F4436" }}
                        >
                          {reviews[selected]?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {reviews[selected]?.role}
                        </Typography>
                        <Rating
                          value={reviews[selected]?.rating ?? 5}
                          precision={0.5}
                          readOnly
                          sx={{ mt: 1 }}
                        />
                      </Stack>
                    </motion.div>
                  </Paper>
                </motion.div>
              </Stack>
            </Paper>
          </motion.div>
        )}
      </Container>
    </Box>
  );
}
