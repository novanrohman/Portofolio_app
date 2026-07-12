import { ImageResponse } from "next/og";

export const alt = "Novan Rohman — Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #0f172a 0%, #0b1220 55%, #071022 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              borderRadius: "28px",
              background: "linear-gradient(135deg, #6366f1, #10b981)",
              fontSize: "84px",
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            N
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "64px", fontWeight: 800, letterSpacing: "-1px" }}>
              Novan Rohman
            </div>
            <div style={{ fontSize: "30px", color: "rgba(255,255,255,0.6)", marginTop: "6px" }}>
              IT Risk &amp; Security · Full-Stack Developer
            </div>
          </div>
        </div>

        {/* Middle: tagline */}
        <div style={{ display: "flex", fontSize: "40px", lineHeight: 1.35, color: "rgba(255,255,255,0.85)", maxWidth: "900px" }}>
          Building secure, maintainable web experiences — bridging development with security and risk management.
        </div>

        {/* Bottom: accent bar + domain */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              fontSize: "28px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <div style={{ display: "flex", width: "56px", height: "8px", borderRadius: "999px", background: "linear-gradient(90deg, #6366f1, #10b981)" }} />
            novan.trustyvisual.my.id
          </div>
          <div style={{ display: "flex", fontSize: "28px", color: "rgba(255,255,255,0.7)" }}>
            Next.js · TypeScript · Tailwind
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
