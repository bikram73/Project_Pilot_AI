import cors from "cors";

const allowedOrigin = process.env.LEMMA_PROXY_ALLOWED_ORIGIN || "*";

export const corsMiddleware = cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
});
