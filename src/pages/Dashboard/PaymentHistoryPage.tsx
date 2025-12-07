import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";



type ApiRecord = {
  paymentHistoryCode?: string;
  orderCode?: string;
  paymentMethod?: string;
  paymentPlatform?: string;
  amount?: number;
  [k: string]: any;
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? "";

function decodeJwtPayload(token: string | null): any | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const decoded = atob(b64 + pad);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

const PaymentHistoryPage: React.FC = () => {
  const { t } = useTranslation("paymentHistory");

  const [records, setRecords] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const payload = useMemo(() => decodeJwtPayload(token), [token]);

  const customerCode: string | undefined = useMemo(() => {
    if (!payload) return undefined;
    return (
      payload.CustomerCode ??
      payload.customerCode ??
      payload.customer_code ??
      payload.sub ??
      payload.userId ??
      payload.uid ??
      undefined
    );
  }, [payload]);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      setLoading(true);

      try {
        if (!customerCode) {
          setError(t("errorNoCustomer") ?? "Không tìm thấy mã khách hàng trong token.");
          setRecords([]);
          setLoading(false);
          return;
        }

        if (!API_BASE) {
          console.error("[PaymentHistory] VITE_API_BASE_URL not defined");
        }

        const url = `${API_BASE.replace(/\/+$/, "")}/api/PaymentHistory/by-customerCode`;
        const params = {
          customerCode,
          orderCode: "",
        };

        
        console.log("[PaymentHistory] GET", url, params);

        const res = await axios.get(url, {
          params,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          validateStatus: () => true, 
        });

       
        console.log("[PaymentHistory] status:", res.status, "content-type:", res.headers["content-type"]);

        if (res.status === 401) {
          setError(t("errorUnauthorized") ?? "Không có quyền truy cập (401).");
          setRecords([]);
          setLoading(false);
          return;
        }

        if (res.status >= 500) {
          setError(t("errorServer") ?? "Lỗi máy chủ, vui lòng thử lại sau.");
          setRecords([]);
          setLoading(false);
          return;
        }

        const contentType = (res.headers["content-type"] || "").toLowerCase();
        if (!contentType.includes("application/json")) {
          const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data || "");
          console.error("[PaymentHistory] expected JSON but received:", text.slice(0, 1000));
          setError(t("errorFetch") ?? "Lấy dữ liệu thất bại. (Server trả về HTML)");
          setRecords([]);
          setLoading(false);
          return;
        }

        const json = res.data;
        const list: ApiRecord[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : json?.items ?? [];

        setRecords(list);
      } catch (err) {
        console.error("[PaymentHistory] fetch error:", err);
        setError(t("errorFetch") ?? "Lấy dữ liệu thất bại.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerCode, refreshKey, token, t]);

  const filtered = useMemo(() => {
    if (!query.trim()) return records;
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      return (
        String(r.paymentHistoryCode ?? "").toLowerCase().includes(q) ||
        String(r.orderCode ?? "").toLowerCase().includes(q) ||
        String(r.paymentMethod ?? "").toLowerCase().includes(q) ||
        String(r.paymentPlatform ?? "").toLowerCase().includes(q)
      );
    });
  }, [records, query]);

  // ... (phần import & logic giữ nguyên)

return (
  <Stack spacing={3} width="100%">
    <Typography variant="h5" fontWeight={700}>
      {t("title") ?? "Lịch sử thanh toán"}
    </Typography>

    {/* FULL WIDTH PAPER */}
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        width: "100%",     
        boxSizing: "border-box",
      }}
    >
      <Stack spacing={2} width="100%">
        
        {/* HEADER TOOLS */}
        <Stack direction="row" spacing={2} alignItems="center" width="100%">
          <TextField
            label={t("search") ?? "Tìm kiếm theo mã / đơn hàng / nền tảng"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            sx={{ width: 300 }} 
          />

          <Box sx={{ flex: 1 }} />

          <IconButton
            aria-label="refresh"
            onClick={() => setRefreshKey((k) => k + 1)}
            title={t("refresh") ?? "Làm mới"}
          >
            <RefreshIcon />
          </IconButton>

         
        </Stack>

        {/* CUSTOMER INFO */}
        {customerCode && (
          <Typography variant="body2" color="text.secondary">
            {t("forCustomer") ?? "Đang hiển thị lịch sử thanh toán cho khách hàng:"}{" "}
            <strong>{customerCode}</strong>
          </Typography>
        )}

        {/* ERROR BOX */}
        {error && (
          <Paper
            sx={{
              p: 2,
              bgcolor: "rgba(255,80,80,0.06)",
              border: "1px solid rgba(255,80,80,0.15)",
              width: "100%",
            }}
          >
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Paper>
        )}

        {/* TABLE FULL WIDTH */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            maxHeight: 520,
            width: "100%",        
            overflowX: "auto",
          }}
        >
          <Table stickyHeader size="small" sx={{ width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell>{t("columns.paymentHistoryCode")}</TableCell>
                <TableCell>{t("columns.orderCode")}</TableCell>
                <TableCell>{t("columns.method")}</TableCell>
                <TableCell align="right">{t("columns.amount")}</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">{t("noRecords")}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.paymentHistoryCode ?? `${r.orderCode}-${Math.random()}`}>
                    <TableCell>{r.paymentHistoryCode ?? "-"}</TableCell>
                    <TableCell>{r.orderCode ?? "-"}</TableCell>
                    <TableCell>{r.paymentMethod ?? "-"}</TableCell>
                    <TableCell align="right">
                      {typeof r.amount === "number" ? r.amount.toLocaleString() : r.amount ?? "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Paper>
  </Stack>
);

};

export default PaymentHistoryPage;
