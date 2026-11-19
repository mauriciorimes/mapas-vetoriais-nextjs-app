"use client";

import { useEffect } from "react";

/** Registra o service worker que torna o app instalável (PWA). */
export default function RegistroServiceWorker() {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;

        // Em desenvolvimento o cache atrapalha (você edita o código e vê a versão antiga).
        if (process.env.NODE_ENV !== "production") {
            navigator.serviceWorker.getRegistrations().then((registros) => {
                registros.forEach((registro) => registro.unregister());
            });
            return;
        }

        // Falha silenciosa: contextos sem suporte (http em IP da rede, preview) não quebram o app.
        navigator.serviceWorker.register("/sw.js").catch((erro) => {
            console.warn("Service worker não registrado:", erro);
        });
    }, []);

    return null;
}
