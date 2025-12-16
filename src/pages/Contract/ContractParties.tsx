import { Box, Stack, Typography } from "@mui/material";

export default function ContractParties({ order }: { order: any }) {
  return (
    <Box sx={{ bgcolor: "#fff", p: 5, border: "1px solid #E0E0E0", mt: 4 }}>
      <Typography fontWeight={700}>
        I. THÔNG TIN CÁC BÊN
      </Typography>
      <Typography variant="body2" sx={{ fontStyle: "italic", mb: 2 }}>
        I. PARTIES INFORMATION
      </Typography>

      <Stack spacing={2}>
        <Typography>
          <b>BÊN A (Bên cho thuê):</b> CÔNG TY LƯU TRỮ ASMS
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          <b>PARTY A (Lessor):</b> STORAGE COMPANY ASMS
        </Typography>

        <Typography>
          <b>BÊN B (Bên thuê):</b> {order?.customerName ?? "Khách hàng"}
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          <b>PARTY B (Lessee):</b> {order?.customerName ?? "Customer"}
        </Typography>
      </Stack>
    </Box>
  );
}
