import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import WorkflowDemo from "./WorkflowDemo";
// import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WorkflowDemo />
  </StrictMode>,
);
