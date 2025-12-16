import { Box, Container, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";

export default function TermsHero() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 10 },
        background: "linear-gradient(180deg, #BFE3C6 0%, #F8FCFA 100%)",
      }}
    >
      <Container>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" fontWeight={700} color="primary.main">
              ĐIỀU KHOẢN DỊCH VỤ
            </Typography>
          </motion.div>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 760, lineHeight: 1.9 }}
          >
            Văn bản này quy định quyền, nghĩa vụ và trách nhiệm giữa khách hàng
            và đơn vị cung cấp dịch vụ lưu trữ, vận chuyển và quản lý kho hàng.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
