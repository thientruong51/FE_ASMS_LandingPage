import { Dialog, DialogContent } from "@mui/material";
import Map from "../../ServicesOverview/Map";

interface Props {
  open: boolean;
  onClose: () => void;
  step: number;
  yawDeg?: number;
}

export default function StorageMapDialog({
  open,
  onClose,
  step,
  yawDeg,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogContent sx={{ p: 0 }}>
        <Map step={step} yawDeg={yawDeg} />
      </DialogContent>
    </Dialog>
  );
}
