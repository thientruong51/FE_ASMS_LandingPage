import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Stack,
  Chip,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HistoryIcon from "@mui/icons-material/History";
import { useTranslation } from "react-i18next";


import {
  fetchOrderByCode,
  fetchOrderDetails,
  type OrderSummary,
  type OrderDetailApi,
} from "../../../api/order.list";

import {
  getTrackingByOrder,
  type TrackingHistoryItem,
} from "../../../api/trackingHistoryApi";

import { fetchContainerTypes } from "../../../api/containerType";
import { fetchShelfTypes } from "../../../api/shelfType";


import {
  translateServiceName,
  translateProductType,
  translateStyle,
  translatePaymentStatus,
  translateStatus,
  translateActionType,
} from "../../../utils/translationHelpers";


const imageRegex = /\.(jpeg|jpg|gif|png|webp|avif|svg)$/i;
const dataImageRegex = /^data:image\/[a-zA-Z]+;base64,/;

const isImageUrl = (v?: string | null) => {
  if (!v) return false;
  if (dataImageRegex.test(v)) return true;
  return imageRegex.test(v);
};

const toArray = <T,>(v?: T[] | null): T[] => (Array.isArray(v) ? v : []);
const has = (v: any) => v !== null && v !== undefined && v !== "";

function Thumbnail({ src, size = 96 }: { src: string; size?: number }) {
  return (
    <Box
      component="img"
      src={src}
      sx={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: 1,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    />
  );
}

function base64ToUtf8(b64: string) {
  try {
    return decodeURIComponent(escape(window.atob(b64)));
  } catch {
    return "";
  }
}


export default function OrderScanPage() {
  const { t } = useTranslation(["order", "common"]);
  const { orderCode } = useParams<{ orderCode?: string }>();
  const query = new URLSearchParams(window.location.search);
  const payloadParam = query.get("payload");

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [details, setDetails] = useState<OrderDetailApi[]>([]);
  const [tracking, setTracking] = useState<TrackingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContainerTypes().catch(() => {});
    fetchShelfTypes().catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        if (payloadParam) {
          const json = base64ToUtf8(payloadParam);
          const obj = JSON.parse(json);

          if (!mounted) return;

          setOrder(obj.order ?? null);
          setDetails(toArray(obj.orderDetails));
          setTracking(toArray(obj.tracking));
          return;
        }

        if (orderCode) {
          const [o, d, tkg] = await Promise.all([
            fetchOrderByCode(orderCode),
            fetchOrderDetails(orderCode),
            getTrackingByOrder(orderCode),
          ]);

          if (!mounted) return;

          setOrder(o);
          setDetails(toArray(d));
          setTracking(toArray(tkg?.data));
          return;
        }

        setError(t("order:noOrderSelected"));
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [orderCode, payloadParam, t]);

  const fmtMoney = (v: any) =>
    v == null
      ? "-"
      : new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(Number(v));

  const fmtDate = (v?: string | null) =>
    v ? new Date(v).toLocaleString() : "-";


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card elevation={2}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <HistoryIcon />
            </Avatar>
          }
          title={
            <Typography fontWeight={700}>
              {order?.orderCode ?? orderCode}
            </Typography>
          }
          action={
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
              >
                <ContentCopyIcon />
              </IconButton>
              <IconButton
                onClick={() => window.open(window.location.href, "_blank")}
              >
                <OpenInNewIcon />
              </IconButton>
            </Stack>
          }
        />

        <CardContent>
          {loading ? (
            <Box py={6} textAlign="center">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              {/* ===== SUMMARY ===== */}
              <Stack direction="row" spacing={2} mb={2}>
                <Avatar sx={{ width: 64, height: 64 }}>
                  {order?.customerName?.slice(0, 2) ?? "OD"}
                </Avatar>
                <Box>
                  <Typography fontWeight={700}>
                    {order?.customerName}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip
                      label={translateStatus(t, order?.status)}
                      size="small"
                    />
                    <Chip
                      label={translatePaymentStatus(
                        t,
                        order?.paymentStatus
                      )}
                      size="small"
                      color={
                        order?.paymentStatus === "Paid"
                          ? "success"
                          : "warning"
                      }
                    />
                    {order?.style && (
                      <Chip
                        label={translateStyle(t, order.style)}
                        size="small"
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* ===== ORDER INFO ===== */}
              <Typography fontWeight={700} mb={1}>
                {t("order:labels.orderInformation")}
              </Typography>

              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Box display="flex">
                      <Box width={200} color="text.secondary">
                        {t("order:labels.orderId")}
                      </Box>
                      <Box>{order?.orderCode}</Box>
                    </Box>

                    {has(order?.phoneContact) && (
                      <Box display="flex">
                        <Box width={200} color="text.secondary">
                          {t("order:labels.phone")}
                        </Box>
                        <Box>{order?.phoneContact}</Box>
                      </Box>
                    )}

                    {has(order?.email) && (
                      <Box display="flex">
                        <Box width={200} color="text.secondary">
                          {t("order:labels.email")}
                        </Box>
                        <Box>{order?.email}</Box>
                      </Box>
                    )}

                    {has(order?.address) && (
                      <Box display="flex">
                        <Box width={200} color="text.secondary">
                          {t("order:labels.address")}
                        </Box>
                        <Box>{order?.address}</Box>
                      </Box>
                    )}

                    {has(order?.note) && (
                      <Box display="flex">
                        <Box width={200} color="text.secondary">
                          {t("order:labels.note")}
                        </Box>
                        <Box>{order?.note}</Box>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* ===== DETAILS ===== */}
              <Typography fontWeight={700} mb={1}>
                {t("order:labels.items")}
              </Typography>

              <Stack spacing={1}>
                {details.map((d) => {
                  const productNames = toArray(d.productTypeNames);
                  const serviceNames = toArray(d.serviceNames);

                  return (
                    <Card key={d.orderDetailId} variant="outlined">
                      <CardContent>
                        <Typography fontWeight={700}>
                          {t("order:orderDetailId")} #{d.orderDetailId}
                        </Typography>

                        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                          {has(d.storageCode) && (
                            <Chip
                              label={`${t("order:item.storage")}: ${
                                d.storageCode
                              }`}
                              size="small"
                            />
                          )}
                          {has(d.containerCode) && (
                            <Chip
                              label={`${t("order:item.container")}: ${
                                d.containerCode
                              }`}
                              size="small"
                            />
                          )}
                        </Stack>

                        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                          {has(d.containerType) && (
                            <Chip
                              label={`${t("order:item.containerType")}: ${
                                d.containerType
                              }`}
                              size="small"
                              color="info"
                            />
                          )}
                          {has(d.shelfTypeId) && (
                            <Chip
                              label={`${t("order:item.shelfType")}: ${
                                d.shelfTypeId
                              }`}
                              size="small"
                              color="warning"
                            />
                          )}
                        </Stack>

                        {has(d.quantity) && (
                          <Typography variant="body2" mt={0.5}>
                            {t("order:item.qty")}: {d.quantity}
                          </Typography>
                        )}

                        {d.isPlaced !== null && (
                          <Chip
                            sx={{ mt: 1 }}
                            label={
                              d.isPlaced
                                ? t("order:item.placed")
                                : t("order:item.unplaced")
                            }
                            size="small"
                            color={d.isPlaced ? "success" : "default"}
                          />
                        )}

                        {productNames.length > 0 && (
                          <Typography mt={1}>
                            {translateProductType(
                              t,
                              productNames.join(", ")
                            )}
                          </Typography>
                        )}

                        {serviceNames.length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {translateServiceName(
                              t,
                              serviceNames.join(", ")
                            )}
                          </Typography>
                        )}

                        <Typography fontWeight={700} mt={1}>
                          {fmtMoney(d.subTotal ?? d.price)}
                        </Typography>

                        {isImageUrl(d.image) && (
                          <Box mt={1}>
                            <Thumbnail src={d.image!} />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* ===== TRACKING ===== */}
              <Typography fontWeight={700} mb={1}>
                {t("order:trackingHistory")}
              </Typography>

              <Stack spacing={1}>
                {tracking.map((it) => {
                  const images = toArray(it.images);

                  return (
                    <Card key={it.trackingHistoryId} variant="outlined">
                      <CardContent>
                        <Typography fontWeight={700}>
                          {translateActionType(t, it.actionType) ??
                            translateStatus(t, it.newStatus)}
                        </Typography>
                        <Typography variant="caption">
                          {fmtDate(it.createAt)}
                        </Typography>

                        {(isImageUrl(it.image) || images.length > 0) && (
                          <Stack direction="row" spacing={1} mt={1}>
                            {isImageUrl(it.image) && (
                              <Thumbnail src={it.image!} size={80} />
                            )}
                            {images.map(
                              (img, i) =>
                                isImageUrl(img) && (
                                  <Thumbnail key={i} src={img} size={80} />
                                )
                            )}
                          </Stack>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
