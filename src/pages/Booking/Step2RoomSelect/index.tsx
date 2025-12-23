import { useState, useEffect } from "react";
import { Box, Container, Stack, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import RoomHeader from "./RoomHeader";
import RoomList from "./RoomList";
import PriceInfo from "./PriceInfo";
import PriceToggle from "./PriceToggle";


export default function Step2RoomSelect({
  selected,
  onBack,
  onNext,
}: {
  selected: { id: string; name: string; hasAC: boolean; type?: string } | null;
  onBack: () => void;
  onNext: (room: { id: string; name: string; hasAC: boolean; type?: string }) => void;
}) {
  const { t } = useTranslation("storageSize");
 const [hasAC, setHasAC] = useState(selected?.hasAC ?? false);
 useEffect(() => {
    if (selected) {
      setHasAC(!!selected.hasAC);
    }
  }, [selected]);

  function mapNameToType(name: string) {
    const n = (name ?? "").toLowerCase();
    if (n.includes("small")) return "small";
    if (n.includes("medium")) return "medium";
    if (n.includes("large")) return "large";
    return "small";
  }

  const [room, setRoom] = useState<{ id: string; type: string } | null>(() => {
    if (!selected) return null;
    if ((selected as any).type) {
      return { id: selected.id, type: (selected as any).type };
    }
    return { id: selected.id, type: mapNameToType(selected.name) };
  });

  const handleSelectRoom = (id: string, type: string) => setRoom({ id, type });

  const handleConfirm = () => {
    if (!room) return;
    const name = t(`rooms.${room.type}.name`);
    onNext({ id: room.id, name, hasAC, type: room.type });
  };

  return (
    <Box sx={{ bgcolor: "#F9FAFB", py: { xs: 6, md: 10 } }}>
      <Container>
        <Stack spacing={6} alignItems="center">
          <RoomHeader />
          <PriceToggle hasAC={hasAC} setHasAC={setHasAC} />
          <RoomList hasAC={hasAC} selectedId={room?.id ?? ""} onSelect={handleSelectRoom} />
          <PriceInfo hasAC={hasAC} />

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="outlined" onClick={onBack}>
              {t("common.back")}
            </Button>
            <Button variant="contained" disabled={!room} onClick={handleConfirm}>
              {t("common.next")}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
