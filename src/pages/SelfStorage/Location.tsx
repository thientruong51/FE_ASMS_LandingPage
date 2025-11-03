import { Box, Container, Stack, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

export default function Location() {
  const { t } = useTranslation("selfStorage");

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "#F8FCFA" }}>
      <Container>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 4, md: 6 }}
          alignItems="center"
        >
          {/* Google Map */}
          <Box
            sx={{
              flex: 1,
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            }}
          >
            <iframe
              title="ASMS Self Storage Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4394469926045!2d106.7726569758073!3d10.85256025778136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d8a6b5ac82a3%3A0x92d06e6cbf0e2472!2zQ8O0bmcgVHkgQ-G7lSBQaOG6p24gUGjhuqFtIFRoxrDhu51uZw!5e0!3m2!1svi!2s!4v1709551611666!5m2!1svi!2s"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </Box>

          {/* Text Info */}
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {t("location.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {t("location.desc")}
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <RoomOutlinedIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                {t("location.address")}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <PhoneOutlinedIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                {t("location.phone")}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <AccessTimeOutlinedIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                {t("location.hours")}
              </Typography>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              sx={{ borderRadius: 10, px: 4, mt: 2, alignSelf: "flex-start", color:"#fff" }}
            >
              {t("location.cta")}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
