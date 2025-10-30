import { Stack, Typography } from "@mui/material";

interface Props {
  overline?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
}

export default function SectionTitle({
  overline,
  title,
  subtitle,
  align = "center",
}: Props) {
  return (
    <Stack
      spacing={1}
      textAlign={align}
      alignItems={
        align === "left"
          ? "flex-start"
          : align === "right"
          ? "flex-end"
          : "center"
      }
    >
      {overline && (
        <Typography variant="overline" color="primary" sx={{ letterSpacing: 1 }}>
          {overline}
        </Typography>
      )}
      <Typography variant="h3">{title}</Typography>
      {subtitle && (
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 740 }}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  );
}
