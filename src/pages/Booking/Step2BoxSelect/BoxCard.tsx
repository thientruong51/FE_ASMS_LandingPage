import { Paper, Stack, Typography } from "@mui/material";

export default function BoxCard({
  label,
  size,
  price,
  selected,
  onSelect,
}: {
  label: string;
  size: string;
  price: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Paper
      onClick={onSelect}
      sx={{
        p: 3,
        borderRadius: 4,
        textAlign: "center",
        border: selected ? "2px solid #3CBD96" : "1px solid #ddd",
        boxShadow: selected
          ? "0 0 0 2px rgba(60,189,150,0.3)"
          : "0 4px 12px rgba(0,0,0,0.04)",
        cursor: "pointer",
        transition: "all 0.25s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        },
      }}
    >
      <Stack spacing={1.2} alignItems="center">
        <Typography variant="h6" fontWeight={700} color="primary.main">
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {size}
        </Typography>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          {price}
        </Typography>
      </Stack>
    </Paper>
  );
}
