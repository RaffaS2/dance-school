import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname, //diz ao Turbopack que a raiz do projeto é a pasta frontend/, eliminando a confusão com o package-lock.json da raiz.
  },
};

export default nextConfig;
