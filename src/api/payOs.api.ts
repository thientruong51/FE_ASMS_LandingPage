// src/api/payOs.api.ts
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL as string;

if (!BASE) throw new Error("VITE_API_BASE_URL not defined");

export type CreatePayLinkResult = {
  paymentCode: string | number;
  checkoutUrl: string;
  raw?: any;
};

export type PayOsResultResponse = {
  status?: string;
  paymentCode?: string;
  orderCode?: string;
  url?: string;
  amount?: number;
  message?: string;
  raw?: any;
};

/**
 * Create a payment link for an order code.
 * Returns { paymentCode, checkoutUrl } — throws on unexpected response.
 */
export async function createPayLink(orderCode: string): Promise<CreatePayLinkResult> {
  const url = `${BASE}/api/PayOs/create-link/${encodeURIComponent(orderCode)}`;
  const token = localStorage.getItem("accessToken");

  const res = await axios.post(
    url,
    {}, // body: bổ sung nếu backend yêu cầu
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    }
  );

  const data = res.data;

  // support multiple possible names from providers/backend
  const paymentCode = data?.paymentCode ?? data?.payment_id ?? data?.payment_code ?? data?.paymentCodeRaw ?? null;
  const checkoutUrl = data?.checkoutUrl ?? data?.url ?? data?.paymentUrl ?? data?.link ?? null;

  if ((!checkoutUrl || typeof checkoutUrl !== "string") || (paymentCode == null)) {
    console.error("Unexpected PayOS create-link response:", data);
    throw new Error("Không nhận được `checkoutUrl` hoặc `paymentCode` từ server.");
  }

  return { paymentCode, checkoutUrl, raw: data };
}

/**
 * Get payment result by paymentCode.
 * Normalizes various provider/backend shapes into PayOsResultResponse.
 */
export async function getPaymentResult(paymentCode: string | number): Promise<PayOsResultResponse> {
  const url = `${BASE}/api/PayOs/result/${encodeURIComponent(String(paymentCode))}`;
  const token = localStorage.getItem("accessToken");

  const res = await axios.get(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  const data = res?.data ?? {};

  // If the API returns a string (rare), try parse
  const payload = typeof data === "string" ? (() => {
    try {
      return JSON.parse(data);
    } catch {
      return { raw: data };
    }
  })() : data;

  // Normalize
  const normalized: PayOsResultResponse = {
    status: payload?.status ?? payload?.paymentStatus ?? payload?.statusCode ?? undefined,
    paymentCode: payload?.paymentCode ?? payload?.payment_id ?? payload?.payment_code ?? undefined,
    orderCode: payload?.orderCode ?? payload?.order_code ?? payload?.order_id ?? undefined,
    url: payload?.url ?? payload?.redirectUrl ?? payload?.paymentUrl ?? undefined,
    amount: payload?.amount ?? payload?.total ?? undefined,
    message: payload?.message ?? undefined,
    raw: payload,
  };

  return normalized;
}
