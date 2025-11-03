import { Box, Button, Container, Stack, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

export default function Safety() {
  const { t } = useTranslation("shareWarehouse");

  const items = t("safety.items", { returnObjects: true }) as string[];

  return (
    <Box sx={{ bgcolor: "#3CBD96", color: "#fff", py: { xs: 6, md: 10 } }}>
      <Container>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems="center"
          spacing={{ xs: 4, md: 8 }}
        >
          <Box
            component="img"
            src="https://res.cloudinary.com/dkfykdjlm/image/upload/v1761766102/kho-hang-la-gi_fguad1.jpg"
            alt="warehouse safety"
            sx={{
              flex: 1,
              width: "30%",
              borderRadius: 3,
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
          />

          <Stack spacing={2} flex={1}>
            <Typography variant="h4" fontWeight={700}>
              {t("safety.title")}
            </Typography>

            <Stack spacing={1.5}>
              {items.map((item, i) => (
                <Stack direction="row" alignItems="center" spacing={1.5} key={i}>
                  <CheckIcon sx={{ color: "#fff" }} />
                  <Typography variant="body1">{item}</Typography>
                </Stack>
              ))}
            </Stack>

            <Button
              component={RouterLink}
              to="/contact"
              variant="contained"
              color="primary"
              size="large"
                sx={{ borderRadius: 10, px: 4, alignSelf: "flex-start", mt: 2 , color:"#fff"}}
            >
              {t("common.contact")}
            </Button>

          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
