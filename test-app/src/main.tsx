import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { testData } from "./module1";

const App = () => {
  return <div>{testData}</div>;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
