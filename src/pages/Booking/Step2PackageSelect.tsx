import { useEffect, useState } from "react";
import { Box, Container, Stack, Button, Typography, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import RoomCard from "./Step2RoomSelect/RoomCard";
import { fetchServices, type ServiceApi } from "../../api/service"; 

type RoomId = "small" | "medium" | "large";

export default function Step2PackageSelect({
  room,
  onBack,
  onNext,
}: {
  room: { id: string; name: string; hasAC: boolean; type?: string };
  onBack: () => void;
  onNext: (pkg: { id: string; name: string; price: string }) => void;
}) {
  const { t } = useTranslation("storageSize");
  const [services, setServices] = useState<ServiceApi[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  const serviceIdMap: Record<RoomId, { normal: number; ac: number }> = {
    small: { normal: 5, ac: 6 },
    medium: { normal: 7, ac: 8 },
    large: { normal: 9, ac: 10 },
  };

  const modelMap = {
    small: {
      normal: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847454/BASIC_jtoarm.glb",
      ac: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847452/BASIC_may_lanh_aogegp.glb",
    },
    medium: {
      normal: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847449/BUSINESS_tstcam.glb",
      ac: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847456/BUSINESS_may_lanh_uju2sk.glb",
    },
    large: {
      normal: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847452/PREMIUM_rsg6ue.glb",
      ac: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847451/PREMIUM_may_lanh_semuy4.glb",
    },
  } as const;

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchServices()
      .then((res) => {
        if (!mounted) return;
        setServices(res);
      })
      .catch((err) => {
        console.error("[Step2] fetchServices error:", err);
        if (!mounted) return;
        setServices(null); 
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const formatVND = (n?: number | null) => (n == null ? "—" : n.toLocaleString("vi-VN") + " đ");

  // --- chuẩn hóa roomId ---
  const roomId: RoomId | null = (() => {
    if (room.type === "small" || room.type === "medium" || room.type === "large") {
      return room.type as RoomId;
    }
    if (room.id === "small" || room.id === "medium" || room.id === "large") {
      return room.id as RoomId;
    }
    const idMap: Record<string, RoomId> = { "1": "small", "2": "medium", "3": "large" };
    return idMap[String(room.id)] ?? null;
  })();

  // --- LOADING ---
  if (loading) {
    return (
      <Box sx={{ bgcolor: "#F9FAFB", py: 6 }}>
        <Container>
          <Stack spacing={4} alignItems="center">
            <CircularProgress />
            <Typography>Đang tải...</Typography>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (!services || !roomId) {
    console.error("Step2PackageSelect: services or roomId missing", { services, room });
    return (
      <Box sx={{ bgcolor: "#F9FAFB", py: 6 }}>
        <Container>
          <Typography color="error">Không thể tải dữ liệu gói hoặc phòng không hợp lệ.</Typography>
          <Button onClick={onBack} sx={{ mt: 2 }}>Quay lại</Button>
        </Container>
      </Box>
    );
  }

  const ids = serviceIdMap[roomId];
  const targetServiceId = room.hasAC ? ids.ac : ids.normal;
  const svc = services.find((s) => s.serviceId === targetServiceId) ?? null;

  if (!svc) {
    console.error("Service not found:", targetServiceId);
    return (
      <Box sx={{ bgcolor: "#F9FAFB", py: 6 }}>
        <Container>
          <Typography color="error">Không tìm thấy gói phù hợp.</Typography>
          <Button onClick={onBack} sx={{ mt: 2 }}>Quay lại</Button>
        </Container>
      </Box>
    );
  }

  const pkg = {
    serviceId: svc.serviceId,
    id: svc.serviceId.toString(),
    name: svc.name,
    desc: svc.description ?? "",
    price: formatVND(svc.price),
    rawPrice: svc.price,
    model: room.hasAC ? modelMap[roomId].ac : modelMap[roomId].normal,
  };

  return (
    <Box sx={{ bgcolor: "#F9FAFB", py: 6 }}>
      <Container>
        <Stack spacing={5} alignItems="center">
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {t("packageSelect.title")}
          </Typography>

          <RoomCard
            type={roomId}
            area={roomId === "small" ? "5.94 m²" : roomId === "medium" ? "10.56 m²" : "15.36 m²"}
            dimension={
              roomId === "small"
                ? "1.8 x 3.3 x 2.5 m"
                : roomId === "medium"
                ? "3.2 x 3.3 x 2.5 m"
                : "3.2 x 4.8 x 2.5 m"
            }
            price={pkg.price}
            model={pkg.model}
            desc={pkg.desc}       
            selected={selectedServiceId === pkg.serviceId}
            onSelect={() => setSelectedServiceId(pkg.serviceId)}
          />

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={onBack}>
              {t("actions.back")}
            </Button>

            <Button
              variant="contained"
              disabled={selectedServiceId !== pkg.serviceId}
              onClick={() =>
                onNext({
                  id: pkg.id,
                  name: pkg.name,
                  price: pkg.price,
                })
              }
            >
              {t("actions.next")}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
