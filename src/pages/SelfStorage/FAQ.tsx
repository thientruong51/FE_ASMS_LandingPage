import {
  Box,
  Container,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function FAQ() {
  const { t } = useTranslation("selfStorage");
  const [expanded, setExpanded] = useState<number | false>(false);

  const faqs = t("faq.items", { returnObjects: true }) as {
    q: string;
    a: string;
  }[];

  const handleToggle = (i: number) => {
    setExpanded(expanded === i ? false : i);
  };

  return (
    <Box sx={{ bgcolor: "#E9F6F1", py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        {/* ===== HEADER ===== */}
        <Stack spacing={1.5} alignItems="center" textAlign="center" mb={5}>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {t("faq.title")}
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            maxWidth={600}
          >
            {t("faq.desc")}
          </Typography>
        </Stack>

        {/* ===== FAQ LIST ===== */}
        <Stack spacing={1.5}>
          {Array.isArray(faqs) &&
            faqs.map((item, i) => (
              <Box
                key={i}
                sx={{
                  borderRadius: 2,
                  bgcolor: "#fff",
                  boxShadow:
                    expanded === i
                      ? "0 4px 12px rgba(0,0,0,0.08)"
                      : "0 2px 6px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
              >
                {/* ===== Question Row ===== */}
                <Box
                  onClick={() => handleToggle(i)}
                  sx={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 3,
                    py: 2,
                    borderLeft: `4px solid ${
                      expanded === i ? "#3CBD96" : "#BFE3C6"
                    }`,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "#204945",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <span style={{ color: "#3CBD96", fontWeight: 700 }}>Q.</span>{" "}
                    {item.q}
                  </Typography>

                  <IconButton
                    size="small"
                    sx={{
                      color: "#fff",
                      bgcolor: expanded === i ? "#3CBD96" : "#BFE3C6",
                      transition: "all 0.3s ease",
                      "&:hover": { bgcolor: "#3CBD96" },
                    }}
                  >
                    {expanded === i ? (
                      <RemoveIcon fontSize="small" />
                    ) : (
                      <AddIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>

                {/* ===== Answer Section ===== */}
                {expanded === i && (
                  <Box
                    sx={{
                      px: 5,
                      pb: 3,
                      pt: 1,
                      color: "text.secondary",
                      borderTop: "1px solid #E0E0E0",
                      backgroundColor: "#FAFAFA",
                      animation: "fadeIn 0.3s ease",
                      "@keyframes fadeIn": {
                        from: { opacity: 0, transform: "translateY(-5px)" },
                        to: { opacity: 1, transform: "translateY(0)" },
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ mt: 1.5, lineHeight: 1.7, whiteSpace: "pre-line" }}
                    >
                      {item.a}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
        </Stack>

       
      </Container>
    </Box>
  );
}
