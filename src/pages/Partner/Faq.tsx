import {
  Box,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";

export default function Faq() {
  const { t } = useTranslation("partner");
  const rawFaqs = t("faq.items", { returnObjects: true });
  const faqs = Array.isArray(rawFaqs) ? rawFaqs : [];

  return (
    <Box sx={{ bgcolor: "#E9F4F3", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          fontWeight={800}
          textAlign="center"
          mb={5}
          color="#204945"
        >
          {t("faq.title")}
        </Typography>

        {faqs.length === 0 ? (
          <Typography color="text.secondary" textAlign="center">
            (No FAQs yet)
          </Typography>
        ) : (
          faqs.map((item: any, idx: number) => (
            <Accordion
              key={idx}
              disableGutters
              sx={{
                mb: 2,
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#fff",
                boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#3CBD96" }} />}
              >
                <Typography fontWeight={700} color="text.primary">
                  {item.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-wrap" }}
                >
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Container>
    </Box>
  );
}
