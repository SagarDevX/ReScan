"use client";

import { useEffect, useState } from "react";
import { Dithering } from "@paper-design/shaders-react";

export function Shader() {
    const [showShader, setShowShader] = useState(false);

    useEffect(() => {
        const isMobileDevice =
            /Android|iPhone|iPad|iPod|Mobile/i.test(
                navigator.userAgent
            ) ||
            (navigator.maxTouchPoints > 1 &&
                window.matchMedia("(pointer: coarse)").matches);

        setShowShader(!isMobileDevice);
    }, []);

    if (!showShader) return null;

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