import { useState } from "react";
import { Box, Container, Stack, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import RoomCard from "./Step2RoomSelect/RoomCard";

export default function Step2PackageSelect({
  room,
  onBack,
  onNext,
}: {
  room: { id: string; name: string; hasAC: boolean };
  onBack: () => void;
  onNext: (pkg: { id: string; name: string; price: string }) => void;
}) {
  const { t } = useTranslation("storageSize");
  const [selected, setSelected] = useState(false);

  const packageMap = {
    small: {
      id: "basic",
      name: "Basic",
      desc: t("packageSelect.basicDesc", { defaultValue: "Small + 1 kệ + 10 thùng A" }),
      price: room.hasAC ? "2.400.000 đ" : "1.900.000 đ",
      model: room.hasAC
        ? "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847452/BASIC_may_lanh_aogegp.glb"
        : "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847454/BASIC_jtoarm.glb",
    },
    medium: {
      id: "business",
      name: "Business",
      desc: t("packageSelect.businessDesc", {
        defaultValue: "Medium + 2 kệ + 20 thùng + VC 10km",
      }),
      price: room.hasAC ? "4.100.000 đ" : "3.600.000 đ",
      model: room.hasAC
        ? "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847456/BUSINESS_may_lanh_uju2sk.glb"
        : "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847449/BUSINESS_tstcam.glb",
    },
    large: {
      id: "premium",
      name: "Premium",
      desc: t("packageSelect.premiumDesc", {
        defaultValue: "Large + 5 kệ + 30 thùng + 2 hàng quá khổ",
      }),
      price: room.hasAC ? "5.700.000 đ" : "5.100.000 đ",
      model: room.hasAC
        ? "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847451/PREMIUM_may_lanh_semuy4.glb"
        : "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847452/PREMIUM_rsg6ue.glb",
    },
  } as const;

  const pkg = packageMap[room.id as "small" | "medium" | "large"];

  return (
    <Box sx={{ bgcolor: "#F9FAFB", py: 6 }}>
      <Container>
        <Stack spacing={5} alignItems="center">
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {t("packageSelect.title")}
          </Typography>

          {/* Hiển thị đúng gói tương ứng với phòng đã chọn */}
          <RoomCard
            type={room.id as "small" | "medium" | "large"}
            area={room.id === "small" ? "5.94 m²" : room.id === "medium" ? "10.56 m²" : "15.36 m²"}
            dimension={
              room.id === "small"
                ? "1.8 x 3.3 x 2.5 m"
                : room.id === "medium"
                ? "3.2 x 3.3 x 2.5 m"
                : "3.2 x 4.8 x 2.5 m"
            }
            price={pkg.price}
            model={pkg.model}
            selected={selected}
            onSelect={() => setSelected(true)}
          />

          {/* Nút điều hướng */}
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={onBack}>
              {t("actions.back")}
            </Button>
            <Button
              variant="contained"
              disabled={!selected}
              onClick={() => onNext(pkg)}
            >
              {t("actions.next")}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
