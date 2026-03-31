import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#4b5869",
          borderRadius: "20%",
          color: "#ffffff",
          fontWeight: 700,
          letterSpacing: "-0.03em",
        }}
      >
        FH
      </div>
    ),
    { ...size }
  );
}
