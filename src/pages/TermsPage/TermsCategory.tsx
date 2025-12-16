import { Stack, Typography } from "@mui/material";
import type { BusinessRule } from "../../api/businessRule.api";
import TermsRuleItem from "./TermsRuleItem";

type Props = {
  chapterIndex: number;
  title: string;
  rules: BusinessRule[];
};

export default function TermsCategory({
  chapterIndex,
  title,
  rules,
}: Props) {
  return (
    <Stack spacing={4}>
      {/* CHƯƠNG */}
      <Typography
        variant="h6"
        fontWeight={700}
        textAlign="center"
        sx={{ textTransform: "uppercase" }}
      >
        CHƯƠNG {chapterIndex}
      </Typography>

      <Typography
        variant="h5"
        fontWeight={700}
        textAlign="center"
      >
        {title}
      </Typography>

      <Stack spacing={3}>
        {rules.map((r, idx) => (
          <TermsRuleItem
            key={r.ruleCode}
            index={idx + 1}
            rule={r}
          />
        ))}
      </Stack>
    </Stack>
  );
}
