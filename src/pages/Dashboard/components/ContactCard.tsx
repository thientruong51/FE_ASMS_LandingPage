import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import { useTranslation } from "react-i18next";

type Props = {
  contact: any;
};

export default function ContactCard({ contact }: Props) {
  const { t } = useTranslation("contact");
  const isActive = contact?.isActive !== false;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        transition: "all .2s ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        <Stack spacing={1.5}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
                {(contact.customerName ?? contact.name ?? "CT")
                  .slice(0, 2)
                  .toUpperCase()}
              </Avatar>

              <Box>
                <Typography fontWeight={600}>
                  {contact.orderCode ?? t("labels.noOrder")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {contact.email ?? contact.phoneContact ?? ""}
                </Typography>
              </Box>
            </Box>

            <Chip
              size="small"
              label={
                isActive
                  ? t("status.active")
                  : t("status.processed")
              }
              color={isActive ? "success" : "default"}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Divider />

          {/* Message */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {contact.message}
          </Typography>

          {/* Image gallery */}
          {contact.image?.length > 0 && (
            <Box>
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                mb={0.5}
                color="text.secondary"
              >
                <ImageIcon fontSize="small" />
                <Typography variant="caption">
                  {t("labels.images")} · {contact.image.length}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {contact.image.slice(0, 4).map((src: string, idx: number) => (
                  <Box
                    key={idx}
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 1.5,
                      overflow: "hidden",
                      border: "1px solid #eee",
                      cursor: "pointer",
                      "& img": {
                        transition: "transform .2s ease",
                      },
                      "&:hover img": {
                        transform: "scale(1.05)",
                      },
                    }}
                    onClick={() => window.open(src, "_blank")}
                  >
                    <img
                      src={src}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}

                {contact.image.length > 4 && (
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 1.5,
                      bgcolor: "grey.100",
                      border: "1px dashed",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      color: "text.secondary",
                    }}
                  >
                    +{contact.image.length - 4}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
