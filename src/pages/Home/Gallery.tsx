import { Container, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import SectionTitle from "../../components/SectionTitle";
import CircularGallery from "../../components/CircularGallery";

export default function Gallery() {
  const { t } = useTranslation();

  return (
    <Container
    
      sx={{
        py: { xs: 8, md: 12 },
        textAlign: "center",
        position: "relative",
        color: "primary.main",
        
      }}
    >
      <SectionTitle
      
        title={t("gallery.title")} 
        subtitle={t("gallery.lead")}
        
      />

      <Box
        sx={{
          height: { xs: 400, md: 600 },
          position: "relative",
          mt: 6,
        }}
      >
        <CircularGallery
          bend={3}
          textColor="#000"
          borderRadius={0.05}
          scrollEase={0.02}
        />
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 3, maxWidth: 600, mx: "auto" }}
      >
        {t("gallery.note")}
      </Typography>
    </Container>
  );
}
