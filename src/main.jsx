import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";
import "./styles.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#253858" },
    secondary: { main: "#64748b" },
    background: { default: "#f5f6f8", paper: "#ffffff" },
    success: { main: "#16845b" },
    warning: { main: "#b7791f" },
    error: { main: "#c2414b" }
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: '"Inter", "Segoe UI", Arial, sans-serif', button: { textTransform: "none", fontWeight: 600 } }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><BrowserRouter><ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider></BrowserRouter></React.StrictMode>
);