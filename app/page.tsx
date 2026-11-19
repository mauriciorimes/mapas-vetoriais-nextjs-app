"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import { formatarValor, rotulo, type FeicaoSelecionada } from "../components/camadas";

// O Leaflet precisa do objeto window, que só existe no navegador (visto na Aula 06)
const MapaVetorial = dynamic(() => import("../components/MapaVetorial"), {
    ssr: false,
    loading: () => <p className={styles.instrucaoVazio}>Carregando o mapa...</p>,
});

const NOME_GEOMETRIA: Record<string, string> = {
    Polygon: "Polígono",
    MultiPolygon: "Multipolígono",
    LineString: "Linha",
    MultiLineString: "Multilinha",
    Point: "Ponto",
};

export default function Home() {
    const [feicao, setFeicao] = useState<FeicaoSelecionada | null>(null);

    return (
        <main className={styles.container}>
            <header className={styles.cabecalho}>
                <h1>Mapas Vetoriais e Tabela de Atributos</h1>
                <p>Municípios de MG e RJ (IBGE), Rio Pomba e pontos de interesse em GeoJSON</p>
            </header>

            <section className={styles.mapaWrapper}>
                <MapaVetorial onSelecionarFeicao={setFeicao} />
            </section>

            <section className={styles.cardPainel}>
                <h2 className={styles.cardTitulo}>Tabela de Atributos (properties)</h2>

                {feicao ? (
                    <>
                        <div className={styles.resumo}>
                            <span className={styles.selo}>{feicao.camada}</span>
                            <span className={styles.selo}>
                                {NOME_GEOMETRIA[feicao.geometria] ?? feicao.geometria}
                            </span>
                        </div>
                        <h3 className={styles.tituloFeicao}>{feicao.titulo}</h3>
                        <div className={styles.gridAtributos}>
                            {Object.entries(feicao.atributos).map(([chave, valor]) => (
                                <div key={chave} className={styles.itemAtributo}>
                                    <div className={styles.itemRotulo}>
                                        {rotulo(chave)} <code>{chave}</code>
                                    </div>
                                    <div className={styles.itemValor}>{formatarValor(valor)}</div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className={styles.instrucaoVazio}>
                        Toque ou clique em um município, no rio ou em um ponto para consultar os atributos do GeoJSON.
                    </p>
                )}
            </section>

            <footer className={styles.rodape}>
                SIG-Web, Prof. José Rui. Dados: IBGE, Malha Municipal 2024 (MG e RJ). Rio Pomba: traçado de referência do OpenStreetMap. Pontos: desenho próprio.
            </footer>
        </main>
    );
}
