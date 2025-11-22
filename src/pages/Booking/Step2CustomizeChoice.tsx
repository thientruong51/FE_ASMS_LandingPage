import { Box, Button, Container, Stack, Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
  room: { id: string; name: string; hasAC: boolean; type?: string };
  onBack: () => void;
  onSelect: (mode: "package" | "custom") => void;
};

export default function Step2CustomizeChoice({ room, onBack, onSelect }: Props) {
  const { t } = useTranslation("booking");

  return (
    <Box sx={{ bgcolor: "#F9FAFB", py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {t("customizeChoice.title")}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
            {t("customizeChoice.desc", { room: room.name })}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} mt={2}>
            <Paper
              elevation={3}
              sx={{
                flex: 1,
                p: 3,
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 6px 20px rgba(0,0,0,0.08)" },
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                {t("customizeChoice.packageTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                {t("customizeChoice.packageDesc")}
              </Typography>
              <Button variant="contained" fullWidth onClick={() => onSelect("package")}>
                {t("customizeChoice.selectPackage")}
              </Button>
            </Paper>

            <Paper
              elevation={3}
              sx={{
                flex: 1,
                p: 3,
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 6px 20px rgba(0,0,0,0.08)" },
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                {t("customizeChoice.customTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                {t("customizeChoice.customDesc")}
              </Typography>
              <Button variant="outlined" fullWidth onClick={() => onSelect("custom")}>
                {t("customizeChoice.selectCustom")}
              </Button>
            </Paper>
          </Stack>

          <Button variant="text" color="inherit" onClick={onBack}>
            {t("actions.back")}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
