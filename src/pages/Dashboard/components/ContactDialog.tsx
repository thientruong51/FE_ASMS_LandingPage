import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { createContact } from "../../../api/contactApi";

const parseJwt = (token: string | null): any | null => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    try {
      return JSON.parse(decodeURIComponent(escape(decoded)));
    } catch {
      return JSON.parse(decoded);
    }
  } catch {
    return null;
  }
};

const getCustomerFromAccessToken = () => {
  const raw =
    localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken") ?? null;
  const claims = parseJwt(raw);
  if (!claims) return {};
  return {
    customerCode: claims["CustomerCode"] ?? claims["customer_code"] ?? claims["sub"] ?? "",
    name: claims["Name"] ?? claims["name"] ?? "",
    phone: claims["Phone"] ?? claims["phone"] ?? "",
    email: claims["Email"] ?? claims["email"] ?? "",
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
  orderCode?: string;
  onSent?: () => void;
};

const ContactDialog: React.FC<Props> = ({ open, onClose, orderCode, onSent }) => {
  const { t } = useTranslation("dashboard");
  const customer = getCustomerFromAccessToken();

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const handleSend = async () => {
    if (!orderCode) return;
    setSending(true);
    const payload = {
      customerCode: customer.customerCode ?? "",
      employeeCode: "",
      orderCode,
      name: customer.name ?? "",
      phoneContact: customer.phone ?? "",
      email: customer.email ?? "",
      message,
    };

    try {
      const token =
        localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken") ?? undefined;
      await createContact(payload, token);
      setSnackbarSeverity("success");
      setSnackbarMsg(t("orderDetail.contactSentSuccess") ?? "Gửi liên hệ thành công");
      setSnackbarOpen(true);
      setMessage("");
      onClose();
      onSent?.();
    } catch (err: any) {
      console.error("createContact failed", err);
      setSnackbarSeverity("error");
      const serverMsg = err?.response?.data?.message ?? err?.message ?? t("orderDetail.contactSentFailed");
      setSnackbarMsg(serverMsg);
      setSnackbarOpen(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{t("orderDetail.contactStaff") ?? "Liên hệ nhân viên"}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={1}>
            {t("orderDetail.contactFrom") ?? "Thông tin người liên hệ (lấy từ tài khoản của bạn):"}
          </Typography>

          <TextField
            fullWidth
            label={t("orderDetail.customerCode") ?? "Customer code"}
            value={customer.customerCode ?? ""}
            margin="dense"
            InputProps={{ readOnly: true }}
          />
          <TextField
            fullWidth
            label={t("orderDetail.name") ?? "Name"}
            value={customer.name ?? ""}
            margin="dense"
            InputProps={{ readOnly: true }}
          />
          <TextField
            fullWidth
            label={t("orderDetail.phone") ?? "Phone"}
            value={customer.phone ?? ""}
            margin="dense"
            InputProps={{ readOnly: true }}
          />
          <TextField
            fullWidth
            label={t("orderDetail.email") ?? "Email"}
            value={customer.email ?? ""}
            margin="dense"
            InputProps={{ readOnly: true }}
          />

          <TextField
            multiline
            minRows={4}
            fullWidth
            sx={{ mt: 1 }}
            label={t("orderDetail.messageLabel") ?? "Message"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={sending}>
            {t("orderDetail.cancel") ?? "Hủy"}
          </Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={sending || message.trim() === ""}
          >
            {sending ? t("orderDetail.sending") ?? "Đang gửi..." : t("orderDetail.send") ?? "Gửi"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ContactDialog;
