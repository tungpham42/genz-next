"use client";

import React, { useState } from "react";
import { ConfigProvider } from "antd";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import { useServerInsertedHTML } from "next/navigation";

// Define the Theme Config here based on your old App.tsx
const themeConfig = {
  token: {
    // We will inherit the font from the body class, so we use 'inherit' or pass the font object
    fontFamily: "inherit",
    colorPrimary: "#8B5CF6",
    borderRadius: 16,
    colorText: "#2d3748",
    colorBgLayout: "#FFFBF5",
  },
  components: {
    Input: {
      controlHeightLG: 50,
      fontSizeLG: 16,
    },
  },
};

export default function AntdStyledProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cache] = useState(() => createCache());

  // Fix for Ant Design CSS-in-JS with Next.js App Router
  useServerInsertedHTML(() => (
    <style
      id="antd"
      dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
    />
  ));

  return (
    <StyleProvider cache={cache}>
      <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
    </StyleProvider>
  );
}
