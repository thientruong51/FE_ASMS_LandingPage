import { useState } from "react";
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
  selected: { id: string; name: string; hasAC: boolean } | null;
  onBack: () => void;
  onNext: (room: { id: string; name: string; hasAC: boolean }) => void;
}) {
  const { t } = useTranslation("storageSize");
  const [hasAC, setHasAC] = useState(selected?.hasAC || false);
  const [roomId, setRoomId] = useState(selected?.id || "");

  const handleSelectRoom = (id: string) => setRoomId(id);

  const handleConfirm = () => {
    if (!roomId) return;
    const name = t(`rooms.${roomId}.name`);
    onNext({ id: roomId, name, hasAC });
  };

  return (
    <Box sx={{ bgcolor: "#F9FAFB", py: { xs: 6, md: 10 } }}>
      <Container>
        <Stack spacing={6} alignItems="center">
          <RoomHeader />
          <PriceToggle hasAC={hasAC} setHasAC={setHasAC} />
          <RoomList
            hasAC={hasAC}
            selectedId={roomId}
            onSelect={handleSelectRoom}
          />
          <PriceInfo hasAC={hasAC} />

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="outlined" onClick={onBack}>
              {t("common.back")}
            </Button>
            <Button
              variant="contained"
              disabled={!roomId}
              onClick={handleConfirm}
            >
              {t("common.next")}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
