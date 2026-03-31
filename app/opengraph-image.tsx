import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f0f13",
          fontFamily: "sans-serif",
          gap: 24,
        }}
      >
        <div style={{
          fontSize: 72,
          fontWeight: 700,
          color: "#f8fafc",
          letterSpacing: "-0.03em",
        }}>
          머니NPC
        </div>
        <div style={{
          fontSize: 28,
          color: "#818cf8",
          fontWeight: 500,
        }}>
          VC심사역 출신의 투자 기록 · 액티브 ETF
        </div>
        <div style={{
          marginTop: 16,
          fontSize: 20,
          color: "#64748b",
        }}>
          moneynpc.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
