import  { useEffect, useState } from "react";
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

  return (
    <Box sx={{ backgroundColor: "#F0FAF7", py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          align="center"
          fontWeight={700}
          sx={{ color: "primary.main", mb: 1 }}
        >
          {t("reviews.title")}
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 760, mx: "auto" }}
        >
          {t("reviews.subtitle")}
        </Typography>

        {reviews.length === 0 ? (
          <Typography align="center" color="text.secondary">
            Loading reviews...
          </Typography>
        ) : (
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
                    <Paper
                      key={idx}
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
                  );
                })}
              </Stack>

              {/* RIGHT CONTENT */}
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
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <FormatQuoteIcon
                    sx={{ fontSize: 36, color: "primary.main", opacity: 0.9 }}
                  />
                </Box>

                <Typography
                  variant="body1"
                  align="center"
                  sx={{
                    color: "#173E33",
                    lineHeight: 1.8,
                    maxWidth: 740,
                    mx: "auto",
                    mb: 3,
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
              </Paper>
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
