import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "SIG#07 — Mapas Vetoriais e Tabela de Atributos",
        short_name: "Mapas Vetoriais",
        description:
            "Municípios de MG e RJ (IBGE), Rio Pomba e pontos de interesse em GeoJSON, com Popup e Tabela de Atributos.",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#0f172a",
        theme_color: "#0f172a",
        icons: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        ],
    };
}
