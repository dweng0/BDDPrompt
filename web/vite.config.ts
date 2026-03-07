import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  root: ".",
  base: "./", // Use relative paths for GitHub Pages compatibility
  build: {
    outDir: "../docs",
    emptyOutDir: true,
  },
});
