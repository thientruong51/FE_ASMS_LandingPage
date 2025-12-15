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
  Box,
  CircularProgress,
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
    localStorage.getItem("accessToken") ??
    sessionStorage.getItem("accessToken") ??
    null;

  const claims = parseJwt(raw);
  if (!claims) return {};

  return {
    customerCode:
      claims["CustomerCode"] ??
      claims["customer_code"] ??
      claims["sub"] ??
      "",
    name: claims["Name"] ?? claims["name"] ?? "",
    phone: claims["Phone"] ?? claims["phone"] ?? "",
    email: claims["Email"] ?? claims["email"] ?? "",
  };
};

/* ================= Props ================= */
type Props = {
  open: boolean;
  onClose: () => void;
  orderCode?: string;
  onSent?: () => void;
};

const ContactDialog: React.FC<Props> = ({
  open,
  onClose,
  orderCode,
  onSent,
}) => {
  const { t } = useTranslation("dashboard");
  const customer = getCustomerFromAccessToken();

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<"success" | "error">("success");

  const [images, setImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [imgUploading, setImgUploading] = useState(false);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "";
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "";
  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

  const uploadFileToCloudinary = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", UPLOAD_PRESET);

    const resp = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: form,
    });

    if (!resp.ok) throw new Error("Cloudinary upload failed");

    const json = await resp.json();
    return json.secure_url ?? json.url;
  };

  const handleFilesSelected = (filesList: FileList | null) => {
    if (!filesList) return;
    const files = Array.from(filesList);
    setSelectedFiles(files);
    setPreviewImages(files.map((f) => URL.createObjectURL(f)));
  };

  const handleUploadImages = async () => {
    if (!selectedFiles?.length) return;

    setImgUploading(true);
    try {
      const uploaded = await Promise.all(
        selectedFiles.map(uploadFileToCloudinary)
      );
      setImages((prev) => Array.from(new Set([...prev, ...uploaded])));
      previewImages.forEach(URL.revokeObjectURL);
      setPreviewImages([]);
      setSelectedFiles(null);
    } finally {
      setImgUploading(false);
    }
  };

  const handleSend = async () => {
    if (!orderCode) return;

    setSending(true);
    try {
      let finalImages = [...images];

      if (selectedFiles?.length) {
        const uploaded = await Promise.all(
          selectedFiles.map(uploadFileToCloudinary)
        );
        finalImages = Array.from(new Set([...finalImages, ...uploaded]));
      }

      const payload = {
        customerCode: customer.customerCode ?? "",
        employeeCode: "",
        orderCode,
        name: customer.name ?? "",
        phoneContact: customer.phone ?? "",
        email: customer.email ?? "",
        message,
        image: finalImages,
      };

      const token =
        localStorage.getItem("accessToken") ??
        sessionStorage.getItem("accessToken") ??
        undefined;

      await createContact(payload, token);

      setSnackbarSeverity("success");
      setSnackbarMsg(
        t("orderDetail.contactSentSuccess") ?? "Gửi liên hệ thành công"
      );
      setSnackbarOpen(true);

      setMessage("");
      setImages([]);
      onClose();
      onSent?.();
    } catch (err: any) {
      console.error("createContact failed", err);
      setSnackbarSeverity("error");
      setSnackbarMsg(
        err?.response?.data?.message ??
          err?.message ??
          t("orderDetail.contactSentFailed")
      );
      setSnackbarOpen(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {t("orderDetail.contactStaff") ?? "Liên hệ nhân viên"}
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={1}>
            {t("orderDetail.contactFrom") ??
              "Thông tin người liên hệ (lấy từ tài khoản của bạn):"}
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

          {/* ================= Upload Images ================= */}
          <Typography variant="subtitle2" mt={2}>
            {t("orderDetail.images") ?? "Images"}
          </Typography>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
          />

          {previewImages.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
              {previewImages.map((u, i) => (
                <img
                  key={i}
                  src={u}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                  }}
                />
              ))}
            </Box>
          )}

          {selectedFiles?.length ? (
            <Button
              sx={{ mt: 1 }}
              size="small"
              variant="outlined"
              onClick={handleUploadImages}
              disabled={imgUploading}
            >
              {imgUploading ? (
                <CircularProgress size={16} />
              ) : (
                t("actions.upload") ?? "Upload"
              )}
            </Button>
          ) : null}

          {images.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
              {images.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                  }}
                />
              ))}
            </Box>
          )}
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
            {sending
              ? t("orderDetail.sending") ?? "Đang gửi..."
              : t("orderDetail.send") ?? "Gửi"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ContactDialog;
