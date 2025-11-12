import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import logo from "/assets/LOGO-remove.png";
import type { JSX } from "react/jsx-runtime";

export default function Footer(): JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const services = t("footer.servicesList", { returnObjects: true }) as string[];
  const support = t("footer.supportList", { returnObjects: true }) as string[];
  const myasms = t("footer.myasmsList", { returnObjects: true }) as string[];

  return (
    <Box component="footer" sx={{ bgcolor: "primary.main", color: "#fff", pt: 6, pb: 4 }}>
      <Container maxWidth="lg">
        {/* Top columns: use flex-wrap and responsive widths */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 4, md: 6 }}
          alignItems="flex-start"
          sx={{ width: "100%" }}
        >
          {/* Column 1 */}
          <Box
            sx={{
              width: { xs: "100%", sm: "100%", md: "25%" },
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="ASMS Logo"
              sx={{ width: { xs: 110, sm: 120, md: 140 }, mb: 1 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500, maxWidth: 320 }}>
              {t("footer.tagline")}
            </Typography>

            <Button
              variant="contained"
              color="secondary"
              size={isSm ? "small" : "medium"}
              sx={{
                mt: 1,
                width: "fit-content",
                color: "#204945",
                fontWeight: 600,
                mx: { xs: "auto", md: "0" },
              }}
            >
              {t("footer.getQuote")}
            </Button>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
              <PhoneIcon sx={{ color: "secondary.main", fontSize: { xs: 18, sm: 20 } }} />
              <Typography variant="body2" fontWeight={600}>
                028 7770 0117
              </Typography>
            </Stack>
          </Box>

          {/* Column 2 */}
          <Box
            sx={{
              width: { xs: "100%", sm: "50%", md: "25%" },
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 0.5, color: "secondary.main", fontWeight: 700 }}>
              {t("footer.servicesTitle")}
            </Typography>
            <Stack spacing={0.4}>
              {services.map((item, i) => (
                <Typography key={i} variant="body2">
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>

          {/* Column 3 */}
          <Box
            sx={{
              width: { xs: "100%", sm: "50%", md: "25%" },
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 0.5, color: "secondary.main", fontWeight: 700 }}>
              {t("footer.supportTitle")}
            </Typography>
            <Stack spacing={0.4}>
              {support.map((item, i) => (
                <Typography key={i} variant="body2">
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>

          {/* Column 4 */}
          <Box
            sx={{
              width: { xs: "100%", sm: "100%", md: "25%" },
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 0.5, color: "secondary.main", fontWeight: 700 }}>
              MyASMS
            </Typography>
            <Stack spacing={0.3} sx={{ width: "100%" }}>
              {myasms.map((item, i) => (
                <Typography key={i} variant="body2">
                  {item}
                </Typography>
              ))}
            </Stack>

            <Stack direction="row" spacing={1.25} sx={{ mt: 1.5 }} justifyContent={{ xs: "center", md: "flex-start" }}>
              <IconButton color="inherit" size={isSm ? "small" : "medium"} aria-label="facebook">
                <FacebookIcon fontSize={isSm ? "small" : "medium"} />
              </IconButton>
              <IconButton color="inherit" size={isSm ? "small" : "medium"} aria-label="instagram">
                <InstagramIcon fontSize={isSm ? "small" : "medium"} />
              </IconButton>
              <IconButton color="inherit" size={isSm ? "small" : "medium"} aria-label="linkedin">
                <LinkedInIcon fontSize={isSm ? "small" : "medium"} />
              </IconButton>
              <IconButton color="inherit" size={isSm ? "small" : "medium"} aria-label="email">
                <EmailIcon fontSize={isSm ? "small" : "medium"} />
              </IconButton>
            </Stack>
          </Box>
        </Stack>

        {/* Description */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.9)",
              maxWidth: 920,
              mx: "auto",
              textAlign: "center",
              fontSize: { xs: "0.9rem", sm: "0.95rem" },
            }}
          >
            {t("footer.description")}
          </Typography>
        </Box>

        {/* Copyright */}
        <Box
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.16)",
            mt: 4,
            py: 2.5,
            textAlign: "center",
            color: "rgba(255,255,255,0.9)",
          }}
        >
          <Typography variant="body2" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
            © {new Date().getFullYear()} ASMS. {t("footer.rights")}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
