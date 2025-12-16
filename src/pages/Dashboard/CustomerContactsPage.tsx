import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Pagination,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { fetchContactsByCustomer } from "../../api/contactApi";
import ContactCard from "./components/ContactCard";

const getCustomerCodeFromToken = () => {
  const raw =
    localStorage.getItem("accessToken") ??
    sessionStorage.getItem("accessToken");

  if (!raw) return "";
  const payload = JSON.parse(atob(raw.split(".")[1]));
  return payload.CustomerCode ?? payload.customer_code ?? "";
};

export default function CustomerContactsPage() {
  const { t } = useTranslation("contact");
  const customerCode = getCustomerCodeFromToken();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customerCode) return;

    const token =
      localStorage.getItem("accessToken") ??
      sessionStorage.getItem("accessToken") ??
      undefined;

    setLoading(true);
    fetchContactsByCustomer(customerCode, page, pageSize, token)
      .then((res) => {
        setData(res.data);
        setTotalPages(res.totalPages);
      })
      .finally(() => setLoading(false));
  }, [customerCode, page, pageSize]);

  return (
    <Box maxWidth={900} mx="auto" py={3}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        {t("page.myContacts")}
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={2}>
          {data.map((c) => (
            <ContactCard key={c.contactId} contact={c} />
          ))}
        </Stack>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            page={page}
            count={totalPages}
            onChange={(_, p) => setPage(p)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
