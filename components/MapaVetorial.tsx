"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import type { Feature, FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";
import {
    CAMADAS,
    formatarValor,
    rotulo,
    type Camada,
    type FeicaoSelecionada,
} from "./camadas";

// Ícone padrão do alfinete: as imagens foram copiadas de leaflet/dist/images para public/leaflet/
// (sem isso, o Next.js não encontra as imagens e o marcador aparece quebrado).
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
});

// [latitude, longitude] (ordem do Leaflet, ao contrário do GeoJSON)
const CENTRO_INICIAL: L.LatLngTuple = [-19.6, -44.2];
const ZOOM_INICIAL = 6;

// Região entre Rio Pomba (MG) e Itaocara (RJ): [[sul, oeste], [norte, leste]]
const REGIAO_RIO_POMBA_ITAOCARA: L.LatLngBoundsExpression = [
    [-21.85, -43.35],
    [-21.1, -41.9],
];

type Dados = Record<string, FeatureCollection | null>;

function escaparHtml(texto: string): string {
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function montarPopup(camada: Camada, atributos: Record<string, unknown>): string {
    const titulo = escaparHtml(formatarValor(atributos[camada.campoTitulo]));
    const linhas = Object.entries(atributos)
        .filter(([chave]) => chave !== camada.campoTitulo)
        .map(
            ([chave, valor]) =>
                `<p style="margin: 2px 0; font-size: 12px;"><strong>${escaparHtml(rotulo(chave))}:</strong> ${escaparHtml(formatarValor(valor))}</p>`,
        )
        .join("");

    return `
        <div style="font-family: system-ui, sans-serif; min-width: 200px; color: #0f172a;">
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #64748b;">${escaparHtml(camada.nome)}</div>
            <h4 style="margin: 2px 0 6px 0; color: #0284c7; font-size: 15px;">${titulo}</h4>
            ${linhas}
        </div>
    `;
}

function estiloBotao(ativo: boolean): React.CSSProperties {
    return {
        padding: "6px 12px",
        borderRadius: 6,
        border: "none",
        fontSize: 12,
        fontWeight: "bold",
        cursor: "pointer",
        background: ativo ? "#0284c7" : "transparent",
        color: ativo ? "#ffffff" : "#94a3b8",
    };
}

const PAINEL_FLUTUANTE: React.CSSProperties = {
    position: "absolute",
    zIndex: 1000,
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: 4,
    display: "flex",
    gap: 4,
};

type Props = {
    onSelecionarFeicao: (feicao: FeicaoSelecionada) => void;
};

export default function MapaVetorial({ onSelecionarFeicao }: Props) {
    const [dados, setDados] = useState<Dados>({});
    const [carregando, setCarregando] = useState(true);
    const [tipoCamada, setTipoCamada] = useState<"satelite" | "ruas">("satelite");
    const [mapa, setMapa] = useState<L.Map | null>(null);

    // No celular não existe "mouseout": guardamos o último desenho destacado para devolver o estilo dele.
    const destacadaRef = useRef<{ layer: L.Path; estilo: L.PathOptions } | null>(null);

    // Baixa os três GeoJSON uma única vez, quando o mapa aparece na tela
    useEffect(() => {
        Promise.all(
            CAMADAS.map((camada) =>
                fetch(camada.arquivo)
                    .then((resposta) => {
                        if (!resposta.ok) {
                            throw new Error(`Falha ao baixar ${camada.arquivo}: HTTP ${resposta.status}`);
                        }
                        return resposta.json() as Promise<FeatureCollection>;
                    })
                    .then((geojson) => [camada.id, geojson] as const)
                    .catch((erro) => {
                        console.error("Erro ao carregar o GeoJSON:", erro);
                        return [camada.id, null] as const;
                    }),
            ),
        )
            .then((pares) => setDados(Object.fromEntries(pares)))
            .finally(() => setCarregando(false));
    }, []);

    function removerDestaque() {
        const anterior = destacadaRef.current;
        if (anterior) {
            anterior.layer.setStyle(anterior.estilo);
            destacadaRef.current = null;
        }
    }

    function destacar(layer: L.Layer, camada: Camada) {
        if (!(layer instanceof L.Path) || !camada.estilo || !camada.estiloDestaque) return;
        if (destacadaRef.current?.layer === layer) return;
        removerDestaque();
        layer.setStyle(camada.estiloDestaque);
        destacadaRef.current = { layer, estilo: camada.estilo };
    }

    // O Leaflet chama esta função uma vez para cada feição (município, rio ou ponto)
    function criarAoConfigurarFeicao(camada: Camada) {
        return function aoConfigurarFeicao(feature: Feature, layer: L.Layer) {
            const atributos = (feature.properties ?? {}) as Record<string, unknown>;

            layer.bindPopup(montarPopup(camada, atributos));

            layer.on({
                mouseover: () => destacar(layer, camada),
                mouseout: () => {
                    if (destacadaRef.current?.layer === layer) removerDestaque();
                },
                click: () => {
                    destacar(layer, camada);
                    onSelecionarFeicao({
                        camada: camada.nome,
                        geometria: feature.geometry.type,
                        titulo: formatarValor(atributos[camada.campoTitulo]),
                        atributos,
                    });
                },
            });
        };
    }

    const camadasComFalha = CAMADAS.filter((c) => !carregando && !dados[c.id]);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid #334155" }}>
            {/* Alternador do mapa de fundo */}
            <div style={{ ...PAINEL_FLUTUANTE, top: 12, right: 12 }}>
                <button type="button" onClick={() => setTipoCamada("satelite")} style={estiloBotao(tipoCamada === "satelite")}>
                    Satélite
                </button>
                <button type="button" onClick={() => setTipoCamada("ruas")} style={estiloBotao(tipoCamada === "ruas")}>
                    Ruas
                </button>
            </div>

            {/* Atalhos de enquadramento */}
            <div style={{ ...PAINEL_FLUTUANTE, bottom: 24, left: 12 }}>
                <button type="button" style={estiloBotao(false)} onClick={() => mapa?.flyTo(CENTRO_INICIAL, ZOOM_INICIAL)}>
                    MG + RJ
                </button>
                <button type="button" style={estiloBotao(false)} onClick={() => mapa?.flyToBounds(REGIAO_RIO_POMBA_ITAOCARA)}>
                    Rio Pomba ↔ Itaocara
                </button>
            </div>

            {carregando && (
                <div style={{ position: "absolute", top: 12, left: 56, zIndex: 1000, background: "rgba(15, 23, 42, 0.85)", color: "#38bdf8", padding: "6px 12px", borderRadius: 6, fontSize: 12, border: "1px solid #334155" }}>
                    Carregando GeoJSON...
                </div>
            )}

            {camadasComFalha.length > 0 && (
                <div style={{ position: "absolute", top: 12, left: 56, zIndex: 1000, background: "rgba(127, 29, 29, 0.9)", color: "#fecaca", padding: "6px 12px", borderRadius: 6, fontSize: 12 }}>
                    Não carregou: {camadasComFalha.map((c) => c.arquivo).join(", ")}
                </div>
            )}

            <MapContainer ref={setMapa} center={CENTRO_INICIAL} zoom={ZOOM_INICIAL} style={{ height: "100%", width: "100%" }}>
                {tipoCamada === "satelite" ? (
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution="&copy; ESRI World Imagery"
                        maxZoom={19}
                    />
                ) : (
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                        maxZoom={19}
                    />
                )}

                {/* Ordem de desenho: polígonos embaixo, rio no meio, pontos por cima */}
                {CAMADAS.map((camada) => {
                    const geojson = dados[camada.id];
                    if (!geojson) return null;
                    return (
                        <GeoJSON
                            key={camada.id}
                            data={geojson}
                            style={camada.estilo}
                            onEachFeature={criarAoConfigurarFeicao(camada)}
                        />
                    );
                })}
            </MapContainer>
        </div>
    );
}
