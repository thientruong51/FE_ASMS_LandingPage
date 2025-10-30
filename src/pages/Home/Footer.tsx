import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import logo from "/assets/LOGO-remove.png";

export default function Footer() {
  const { t } = useTranslation();

  const services = t("footer.servicesList", { returnObjects: true }) as string[];
  const support = t("footer.supportList", { returnObjects: true }) as string[];
  const myasms = t("footer.myasmsList", { returnObjects: true }) as string[];

  return (
    <Box sx={{ bgcolor: "primary.main", color: "#fff", pt: 8 }}>
      <Container>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "center", md: "flex-start" }}
          justifyContent="space-between"
          spacing={{ xs: 6, md: 10 }}
          textAlign={{ xs: "center", md: "left" }}
        >
          {/* Cột 1: Logo + slogan + nút + hotline */}
          <Stack spacing={2} flex={1} alignItems={{ xs: "center", md: "flex-start" }}>
            <Box component="img" src={logo} alt="ASMS Logo" sx={{ width: 140 }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {t("footer.tagline")}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              sx={{
                width: "fit-content",
                color: "#204945",
                fontWeight: 600,
                mt: 1,
              }}
            >
              {t("footer.getQuote")}
            </Button>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              justifyContent={{ xs: "center", md: "flex-start" }}
            >
              <PhoneIcon sx={{ color: "secondary.main" }} />
              <Typography variant="body1" fontWeight={600}>
                028 7770 0117
              </Typography>
            </Stack>
          </Stack>

          {/* Cột 2: Storage Services */}
          <Stack spacing={0.8} flex={1}>
            <Typography variant="h6" sx={{ mb: 1, color: "secondary.main" }}>
              {t("footer.servicesTitle")}
            </Typography>
            {services.map((item, i) => (
              <Typography key={i} variant="body2">
                {item}
              </Typography>
            ))}
          </Stack>

          {/* Cột 3: Support */}
          <Stack spacing={0.8} flex={1}>
            <Typography variant="h6" sx={{ mb: 1, color: "secondary.main" }}>
              {t("footer.supportTitle")}
            </Typography>
            {support.map((item, i) => (
              <Typography key={i} variant="body2">
                {item}
              </Typography>
            ))}
          </Stack>

          {/* Cột 4: MyASMS */}
          <Stack spacing={0.8} flex={1}>
            <Typography variant="h6" sx={{ mb: 1, color: "secondary.main" }}>
              MyASMS
            </Typography>
            {myasms.map((item, i) => (
              <Typography key={i} variant="body2">
                {item}
              </Typography>
            ))}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ mt: 2 }}
              justifyContent={{ xs: "center", md: "flex-start" }}
            >
              <IconButton color="inherit" size="small">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" size="small">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" size="small">
                <LinkedInIcon />
              </IconButton>
              <IconButton color="inherit" size="small">
                <EmailIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>

        {/* Dòng mô tả */}
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.9)",
              maxWidth: 900,
              mx: "auto",
              textAlign: "center",
            }}
          >
            {t("footer.description")}
          </Typography>
        </Box>

        {/* Dòng bản quyền */}
        <Box
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.2)",
            mt: 6,
            py: 3,
            textAlign: "center",
            color: "rgba(255,255,255,0.9)",
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} ASMS. {t("footer.rights")}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
