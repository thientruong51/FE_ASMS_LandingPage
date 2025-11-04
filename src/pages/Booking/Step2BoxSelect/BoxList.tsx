import { Box, Stack } from "@mui/material";
import BoxCard from "./BoxCard";

export default function BoxList({
  chosen,
  onSelect,
}: {
  chosen: any;
  onSelect: (b: any) => void;
}) {
  const boxes = [
    { id: "A", label: "Box A", size: "0.5 m³", price: "200.000 đ" },
    { id: "B", label: "Box B", size: "1 m³", price: "350.000 đ" },
    { id: "C", label: "Box C", size: "2 m³", price: "600.000 đ" },
    { id: "D", label: "Box D", size: "3 m³", price: "850.000 đ" },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: 1000 }}>
      <Stack
        direction="row"
        flexWrap="wrap"
        justifyContent="center"
        spacing={3}
        rowGap={3}
      >
        {boxes.map((box) => (
          <Box key={box.id} sx={{ flex: "1 1 200px", maxWidth: 240 }}>
            <BoxCard
              {...box}
              selected={chosen?.id === box.id}
              onSelect={() => onSelect(box)}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
