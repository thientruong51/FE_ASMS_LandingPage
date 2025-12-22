import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { updateOrderPasskey } from "../../../api/order.list";

interface UpdatePasskeyDialogProps {
  open: boolean;
  orderCode: string;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

const UpdatePasskeyDialog: React.FC<UpdatePasskeyDialogProps> = ({
  open,
  orderCode,
  onClose,
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation("dashboard");

  const [oldPasskey, setOldPasskey] = useState("");
  const [newPasskey, setNewPasskey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!orderCode || !oldPasskey || !newPasskey) return;

    setLoading(true);
    try {
      await updateOrderPasskey({
        orderCode,
        oldPasskey: String(oldPasskey),
        newPasskey: String(newPasskey),
      });

      setOldPasskey("");
      setNewPasskey("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        t("snack.updatePasskeyError") ??
        "Update passkey failed";
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {t("updatePasskey") ?? "Cập nhật passkey"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label={t("oldPasskey") ?? "Passkey hiện tại"}
            type="number"
            value={oldPasskey}
            onChange={(e) => setOldPasskey(e.target.value)}
            fullWidth
          />

          <TextField
            label={t("newPasskey") ?? "Passkey mới"}
            type="number"
            value={newPasskey}
            onChange={(e) => setNewPasskey(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {t("cancel") ?? "Hủy"}
        </Button>

        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={loading || !oldPasskey || !newPasskey}
        >
          {loading ? <CircularProgress size={18} /> : (t("update") ?? "Cập nhật")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdatePasskeyDialog;
