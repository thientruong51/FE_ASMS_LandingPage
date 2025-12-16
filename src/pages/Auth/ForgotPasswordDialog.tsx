import { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    IconButton,
    Stack,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { forgotPassword } from "../../api/password";

const BG_WAVE =
    "https://res.cloudinary.com/dkfykdjlm/image/upload/v1762962577/wave-haikei_skn4to.svg";
const LOGO =
    "https://res.cloudinary.com/dkfykdjlm/image/upload/v1762190185/LOGO-remove_1_o1wgk2.png";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function ForgotPasswordDialog({ open, onClose }: Props) {
    const { t } = useTranslation("auth");

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const validate = () => {
        if (!email.trim()) {
            setError(t("errorEmptyEmail") ?? "Vui lòng nhập email");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError(t("errorInvalidEmail") ?? "Email không hợp lệ");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validate()) return;

        try {
            setLoading(true);
            await forgotPassword({
                email,
                isEmployee: false,
            });
            setSuccess(
                t("forgotSuccess") ??
                "Hướng dẫn đặt lại mật khẩu đã được gửi về email của bạn."
            );
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 404) {
                setError(t("emailNotFound") ?? "Email không tồn tại");
            } else {
                setError(t("serverError") ?? "Có lỗi xảy ra, vui lòng thử lại");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    overflow: "visible",
                    borderRadius: 3,
                    background: "transparent",
                    boxShadow: "none",
                },
            }}
        >
            <IconButton
                onClick={onClose}
                sx={{
                    position: "absolute",
                    right: 12,
                    top: 12,
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent sx={{ p: 0 }}>
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    sx={{
                        borderRadius: 4,
                        overflow: "hidden",
                        backgroundImage: `url(${BG_WAVE})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >

                    <Box
                        component="img"
                        src={LOGO}
                        alt="logo"

                        sx={{ width: 90, mt: 2, mx: "auto" }}
                    />
                    <Box
                        sx={{
                            p: { xs: 3, md: 5 },
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="h5" fontWeight={700} color="#000" mb={1}>
                            {t("forgotPassword") ?? "Quên mật khẩu"}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{ color: "rgba(0, 0, 0, 0.85)", mb: 3 }}
                        >
                            {t("forgotSubtitle") ??
                                "Nhập email để nhận hướng dẫn đặt lại mật khẩu."}
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    label={t("email") ?? "Email"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    error={Boolean(error)}
                                    helperText={error || " "}
                                    FormHelperTextProps={{
                                        sx: { color: "#000000ff" },
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            color: "rgba(0, 0, 0, 0.85)",
                                            "&.Mui-focused": { color: "#000" },
                                        },
                                    }}
                                    InputProps={{
                                        sx: {
                                            borderRadius: 2,
                                            color: "#000",
                                            backgroundColor: "rgba(255,255,255,0.12)",
                                            "& fieldset": {
                                                borderColor: "rgba(255,255,255,0.4)",
                                            },
                                            "&:hover fieldset": {
                                                borderColor: "#fff",
                                            },
                                        },
                                    }}
                                />

                                {success && (
                                    <Box
                                        sx={{
                                            p: 1.2,
                                            borderRadius: 2,
                                            bgcolor: "rgba(60,189,150,0.15)",
                                            border: "1px solid rgba(60,189,150,0.4)",
                                            color: "#bff5e6",
                                            fontSize: 14,
                                        }}
                                    >
                                        {success}
                                    </Box>
                                )}

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        py: 1.2,
                                        borderRadius: 3,
                                        bgcolor: "#3CBD96",
                                        fontWeight: 700,
                                    }}
                                >
                                    {loading ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        t("sendReset") ?? "Gửi yêu cầu"
                                    )}
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
