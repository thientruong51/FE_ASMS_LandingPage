// components/ViewStorageMapButton.tsx
import { IconButton, Tooltip } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useState, useMemo } from "react";
import StorageMapDialog from "./StorageMapDialog";
import {
  storageCodeToStepConfig,
  type StorageStepConfig,
} from "../../../utils/storageStep";

interface Props {
  order: any;
}

export default function ViewStorageMapButton({ order }: Props) {
  const [open, setOpen] = useState(false);

  const stepConfig: StorageStepConfig | null = useMemo(() => {
    // Chỉ áp dụng cho self-service
    if (order?.style !== "self" && order?.kind !== "self") return null;

    const items = Array.isArray(order?.items) ? order.items : [];

    const storageCode = items.find(
      (i: { storageCode?: string }) => i?.storageCode
    )?.storageCode;

    if (!storageCode) return null;

    return storageCodeToStepConfig(storageCode);
  }, [order]);

  // Không có step config thì không render icon
  if (!stepConfig) return null;

  return (
    <>
      <Tooltip title="Xem vị trí kho">
        <IconButton
          size="small"
          onClick={() => setOpen(true)}
        >
          <LocationOnIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <StorageMapDialog
        open={open}
        onClose={() => setOpen(false)}
        step={stepConfig.step}
        yawDeg={stepConfig.yawDeg}
      />
    </>
  );
}
