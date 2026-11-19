import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import RegistroServiceWorker from "../components/RegistroServiceWorker";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "SIG#07 — Mapas Vetoriais",
    description:
        "PWA que exibe municípios de MG e RJ (IBGE), o Rio Pomba e pontos de interesse em GeoJSON, com Popup e Tabela de Atributos.",
    appleWebApp: {
        capable: true,
        title: "Mapas Vetoriais",
        statusBarStyle: "black-translucent",
    },
};

export const viewport: Viewport = {
    themeColor: "#0f172a",
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="pt-BR" className={geistSans.variable}>
            <body>
                {children}
                <RegistroServiceWorker />
            </body>
        </html>
    );
}
