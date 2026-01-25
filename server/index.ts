import "dotenv/config";
import { createServer } from "http";
import { app, log } from "./app.js";

const httpServer = createServer(app);

(async () => {
  if (process.env.VERCEL) return;

  if (process.env.NODE_ENV !== "production") {
    const { setupVite } = await import("./vite.js");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  const listenOpts =
    process.platform === "win32"
      ? { port, host: "0.0.0.0" }
      : { port, host: "0.0.0.0", reusePort: true };
  httpServer.listen(listenOpts, () => {
    log(`serving on port ${port}`);
  });
})();
