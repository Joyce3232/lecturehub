import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 確保伺服器端可正確讀取上層的 ../wiki/ 資料夾
  outputFileTracingIncludes: {
    "/**": ["../wiki/**/*"],
  },
};

export default nextConfig;
