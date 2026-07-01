// Robust fetch patch to handle read-only window.fetch in sandboxed iframe environments
try {
  const originalFetch = window.fetch;
  if (originalFetch) {
    let currentFetch = originalFetch;
    // Attempt to make fetch writable on the window object
    try {
      Object.defineProperty(window, "fetch", {
        value: originalFetch,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } catch (e) {
      // If window itself is locked, try Window.prototype
      try {
        Object.defineProperty(Window.prototype, "fetch", {
          value: originalFetch,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      } catch (e2) {
        // Fallback to a getter/setter on window
        try {
          Object.defineProperty(window, "fetch", {
            get() { return currentFetch; },
            set(newFetch) { currentFetch = newFetch; },
            configurable: true,
            enumerable: true,
          });
        } catch (e3) {
          // Final fallback to a getter/setter on Window.prototype
          try {
            Object.defineProperty(Window.prototype, "fetch", {
              get() { return currentFetch; },
              set(newFetch) { currentFetch = newFetch; },
              configurable: true,
              enumerable: true,
            });
          } catch (e4) {
            console.warn("Could not patch window.fetch:", e4);
          }
        }
      }
    }
  }
} catch (error) {
  console.warn("Could not execute fetch patch:", error);
}

// Suppress benign WebSocket/HMR unhandled promise rejections and connection errors in sandboxed preview environments
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    if (reason) {
      const message = reason.message || String(reason);
      if (
        message.includes("WebSocket") ||
        message.includes("failed to connect to websocket") ||
        message.includes("ws://") ||
        message.includes("wss://") ||
        message.includes("closed without opened")
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        console.info("[Sandbox Patch] Gracefully suppressed benign HMR WebSocket rejection:", message);
      }
    }
  });

  window.addEventListener("error", (event) => {
    const message = event.message || "";
    if (
      message.includes("WebSocket") ||
      message.includes("failed to connect to websocket") ||
      message.includes("ws://") ||
      message.includes("wss://") ||
      message.includes("closed without opened")
    ) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      console.info("[Sandbox Patch] Gracefully suppressed benign HMR WebSocket error:", message);
    }
  }, true);
}

export {};

