"use client";

import { Dithering } from "@paper-design/shaders-react";

export function Shader() {
  return (
    <Dithering
      colorBack="#000000"
      colorFront="#ffffff"
      shape="wave"
      type="8x8"
      size={0.5}
      speed={1.2}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}