import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#3CBD96", light: "#BFE3C6" },
    secondary: { main: "#BFE3C6" },
    background: { default: "#FFFFFF" },
    text: { primary: "#204945", secondary: "#777E90" },
  },
  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    h3: { fontWeight: 700 },
    h6: { fontWeight: 600, color: "#3CBD96" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
});

export default theme;
