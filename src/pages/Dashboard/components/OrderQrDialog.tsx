import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
    Stack,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";

import { fetchOrderByCode, fetchOrderDetails } from "../../../api/order.list";
import { getTrackingHistories } from "../../../api/trackingHistoryApi";
import {
    createShortLink,
    getShortLinkByOrderCode,
} from "../../../api/shortLinkApi";


function utf8ToBase64(str: string) {
    try {
        return window.btoa(unescape(encodeURIComponent(str)));
    } catch {
        return "";
    }
}

function sanitizeOrderForQr(o: any) {
    if (!o) return null;
    const clone = JSON.parse(JSON.stringify(o));
    delete clone.image;
    delete clone.images;
    delete clone.imageUrl;
    delete clone.photo;
    delete clone.photoUrl;
    return clone;
}


type Props = {
    open: boolean;
    onClose: () => void;
    orderCode?: string | null;
    size?: number;
};

export default function OrderQrDialog({
    open,
    onClose,
    orderCode,
    size = 300,
}: Props) {
    const { t } = useTranslation("dashboard");

    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [payloadB64, setPayloadB64] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [qrDataUrl, setQrDataUrl] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setPayloadB64("");
            setShortUrl("");
            setQrDataUrl("");
            setError(null);
            setLoading(false);
            setGenerating(false);
        }
    }, [open]);

    useEffect(() => {
        if (!open || !orderCode) return;

        let mounted = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const [order, details, trackingResp] = await Promise.all([
                    fetchOrderByCode(orderCode),
                    fetchOrderDetails(orderCode),
                    getTrackingHistories({ orderCode }),
                ]);

                if (!mounted) return;

                const payloadObj = {
                    order: sanitizeOrderForQr(order),

                    orderDetails: details ?? [],

                    tracking: (trackingResp?.data ?? []).map((t: any) => ({
                        trackingHistoryId: t.trackingHistoryId,
                        orderDetailCode: t.orderDetailCode,
                        oldStatus: t.oldStatus,
                        newStatus: t.newStatus,
                        actionType: t.actionType,
                        createAt: t.createAt,
                        currentAssign: t.currentAssign,
                        nextAssign: t.nextAssign,
                        image: t.image ?? null,
                        images: Array.isArray(t.images) ? t.images : [],
                        orderCode: t.orderCode,
                    })),

                    generatedAt: new Date().toISOString(),
                };

                setPayloadB64(utf8ToBase64(JSON.stringify(payloadObj)));
            } catch (err: any) {
                setError(err?.message ?? String(err));
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [open, orderCode]);

    useEffect(() => {
        if (!payloadB64 || !orderCode) return;

        let mounted = true;

        (async () => {
            try {
                const base = window.location.origin;
                const originalUrl = `${base}/orders/scan/${orderCode}?payload=${encodeURIComponent(
                    payloadB64
                )}`;

                await createShortLink({ originalUrl, orderCode });
                const short = await getShortLinkByOrderCode(orderCode);

                if (mounted) setShortUrl(short?.shortUrl ?? "");
            } catch {
                if (mounted) setShortUrl("");
            }
        })();

        return () => {
            mounted = false;
        };
    }, [payloadB64, orderCode]);

    const qrValue = useMemo(() => shortUrl, [shortUrl]);

    useEffect(() => {
        if (!qrValue) return;

        let mounted = true;
        setGenerating(true);

        (async () => {
            try {
                const url = await QRCode.toDataURL(qrValue, {
                    width: size,
                    margin: 1,
                });
                if (mounted) setQrDataUrl(url);
            } finally {
                if (mounted) setGenerating(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [qrValue, size]);


    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                    <Typography fontWeight={700}>
                        {t("orderDetail.qrTitle") ?? "Order QR"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {orderCode}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Tooltip title="Open link">
                        <IconButton
                            size="small"
                            disabled={!shortUrl}
                            onClick={() => window.open(shortUrl, "_blank")}
                        >
                            <OpenInNewIcon />
                        </IconButton>
                    </Tooltip>

                    <IconButton onClick={onClose} size="small">
                        <CloseRoundedIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Box py={6} display="flex" justifyContent="center">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <Box display="flex" justifyContent="center">
                        {generating ? (
                            <CircularProgress />
                        ) : qrDataUrl ? (
                            <img
                                src={qrDataUrl}
                                alt="QR"
                                style={{ width: size, height: size, background: "#fff" }}
                            />
                        ) : null}
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    startIcon={<ContentCopyOutlinedIcon />}
                    disabled={!shortUrl}
                    onClick={() => navigator.clipboard.writeText(shortUrl)}
                >
                    Copy link
                </Button>

                <Button
                    startIcon={<FileDownloadOutlinedIcon />}
                    disabled={!qrDataUrl}
                    onClick={() => {
                        const a = document.createElement("a");
                        a.href = qrDataUrl;
                        a.download = `qr_order_${orderCode}.png`;
                        a.click();
                    }}
                >
                    Download PNG
                </Button>

                <Box flex={1} />

                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
