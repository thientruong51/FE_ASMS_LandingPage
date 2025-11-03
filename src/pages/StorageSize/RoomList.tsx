import { Stack } from "@mui/material";
import RoomCard from "./RoomCard";

export default function RoomList({ hasAC }: { hasAC: boolean }) {
  const rooms = [
    {
      type: "small" as const,
      area: "5.94 m²",
      dimension: "1.8 x 3.3 x 2.5 m",
      price: hasAC ? "2.400.000 đ" : "1.900.000 đ",
      model: hasAC
        ? "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847452/BASIC_may_lanh_aogegp.glb"
        : "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847454/BASIC_jtoarm.glb",
    },
    {
      type: "medium" as const,
      area: "10.56 m²",
      dimension: "3.2 x 3.3 x 2.5 m",
      price: hasAC ? "4.100.000 đ" : "3.200.000 đ",
      model: hasAC
        ? "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847456/BUSINESS_may_lanh_uju2sk.glb"
        : "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847449/BUSINESS_tstcam.glb",
    },
    {
      type: "large" as const,
      area: "15.36 m²",
      dimension: "3.2 x 4.8 x 2.5 m",
      price: hasAC ? "5.700.000 đ" : "4.300.000 đ",
      model: hasAC
        ? "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847451/PREMIUM_may_lanh_semuy4.glb"
        : "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847452/PREMIUM_rsg6ue.glb",
    },
  ];

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={4}
      justifyContent="center"
      alignItems="stretch"
      width="100%"
    >
      {rooms.map((room, i) => (
        <RoomCard key={i} {...room} />
      ))}
    </Stack>
  );
}
