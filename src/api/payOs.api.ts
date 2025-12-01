// src/api/payOs.api.ts
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL as string;

if (!BASE) throw new Error("VITE_API_BASE_URL not defined");

export type CreatePayLinkResult = {
  paymentCode: string | number;
  checkoutUrl: string;
  raw?: any;
};

type PayOsResultResponse = {
  status?: string;
  paymentCode?: string;
  amount?: number;
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

  // phù hợp với JSON bạn đưa: { paymentCode: ..., checkoutUrl: "..." }
  const paymentCode = data?.paymentCode ?? data?.payment_id ?? data?.paymentCodeRaw ?? null;
  const checkoutUrl = data?.checkoutUrl ?? data?.url ?? data?.paymentUrl ?? data?.link ?? null;

  if ((!checkoutUrl || typeof checkoutUrl !== "string") || (paymentCode == null)) {
    console.error("Unexpected PayOS create-link response:", data);
    throw new Error("Không nhận được `checkoutUrl` hoặc `paymentCode` từ server.");
  }

  return { paymentCode, checkoutUrl, raw: data };
}

/**
 * Get payment result by paymentCode.
 */
export async function getPaymentResult(paymentCode: string | number): Promise<PayOsResultResponse> {
  const url = `${BASE}/api/PayOs/result/${encodeURIComponent(String(paymentCode))}`;
  const token = localStorage.getItem("accessToken");

  const res = await axios.get(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return res.data ?? { raw: res.data };
}
