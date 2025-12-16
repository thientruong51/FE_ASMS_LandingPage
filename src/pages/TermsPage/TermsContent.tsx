import {
  Box,
  Container,
  Stack,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import { fetchBusinessRules, type BusinessRule } from "../../api/businessRule.api";
import TermsCategory from "./TermsCategory";

export default function TermsContent() {
  const [data, setData] = useState<Record<string, BusinessRule[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessRules({ page: 1, pageSize: 100 })
      .then(res => {
        const rules = res.data
          .filter(r => r.isActive)
          .sort(
            (a, b) =>
              a.category.localeCompare(b.category) ||
              a.ruleCode.localeCompare(b.ruleCode)
          );

        const grouped = rules.reduce<Record<string, BusinessRule[]>>(
          (acc, r) => {
            acc[r.category] ??= [];
            acc[r.category].push(r);
            return acc;
          },
          {}
        );

        setData(grouped);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box py={10} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box py={{ xs: 6, md: 10 }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            bgcolor: "#FFFFFF",
            px: { xs: 3, md: 6 },
            py: { xs: 4, md: 6 },
            border: "1px solid #E0E0E0",
          }}
        >
          <Stack spacing={8}>
            {Object.entries(data).map(([category, rules], idx) => (
              <TermsCategory
                key={category}
                chapterIndex={idx + 1}
                title={category}
                rules={rules}
              />
            ))}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
