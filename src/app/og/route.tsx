import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          backgroundColor: "#0b0b0c", // ← clave: usar backgroundColor
          backgroundImage:
            "radial-gradient(1000px 500px at 20% 10%, rgba(200,80,60,.2), transparent 60%), " +
            "radial-gradient(900px 450px at 90% 20%, rgba(40,140,120,.18), transparent 60%)",
          fontSize: 80,
          fontWeight: 800,
          fontFamily: "ui-sans-serif, system-ui, Arial",
          letterSpacing: "-0.02em",
        }}
      >
        Portfolio Inteligente
      </div>
    ),
    size
  );
}
