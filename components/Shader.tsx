
"use client";

import { Dithering } from "@paper-design/shaders-react";

export function Shader() {
    return (
        <div className="h-full w-full opacity-50 md:opacity-80">
            <Dithering
                colorBack="#000000"
                colorFront="#a3a3a3"
                shape="wave"
                type="8x8"
                size={0.25}
                speed={0.6}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            />
        </div>
    );
}
