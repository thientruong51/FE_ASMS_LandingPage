import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL as string;
if (!BASE) throw new Error("VITE_API_BASE_URL not defined");

/* =========================
 * TYPES
 * ========================= */

export type BusinessRule = {
  businessRuleId: number;
  ruleCode: string;
  category: string;
  ruleName: string;
  ruleDescription: string;
  ruleType: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  isActive: boolean;
  effectiveDate: string;
  expiryDate?: string | null;
  createdDate: string;
  updatedDate: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  notes?: string | null;
};

export type BusinessRulePayload = {
  ruleCode: string;
  category: string;
  ruleName: string;
  ruleDescription: string;
  ruleType: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  isActive?: boolean;
  effectiveDate?: string;
  expiryDate?: string | null;
  notes?: string | null;
};

export type BusinessRuleListResponse = {
  data: BusinessRule[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

/* =========================
 * API FUNCTIONS
 * ========================= */

/**
 * GET /api/BusinessRules
 * Có pagination + filter theo ruleCode / category
 */
export async function fetchBusinessRules(
  params?: {
    ruleCode?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  },
  token?: string
): Promise<BusinessRuleListResponse> {
  const url = `${BASE}/api/BusinessRules`;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await axios.get(url, {
    headers,
    params: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 100,
      ruleCode: params?.ruleCode,
      category: params?.category,
    },
  });

  return res.data;
}

/**
 * POST /api/BusinessRules
 */
export async function createBusinessRule(
  payload: BusinessRulePayload,
  token: string
): Promise<BusinessRule> {
  const url = `${BASE}/api/BusinessRules`;

  const res = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

/**
 * PUT /api/BusinessRules/{id}
 */
export async function updateBusinessRule(
  businessRuleId: number,
  payload: Partial<BusinessRulePayload>,
  token: string
): Promise<BusinessRule> {
  const url = `${BASE}/api/BusinessRules/${businessRuleId}`;

  const res = await axios.put(url, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
