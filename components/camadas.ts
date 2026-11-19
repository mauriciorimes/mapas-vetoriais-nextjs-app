import type { PathOptions } from "leaflet";

/**
 * Cada camada é um arquivo GeoJSON servido pela pasta public/.
 * No disco: public/municipios-mg-rj.geojson  ->  no navegador: /municipios-mg-rj.geojson
 */
export type Camada = {
    id: string;
    nome: string;
    arquivo: string;
    /** Chave de `properties` usada como título do Popup e do painel. */
    campoTitulo: string;
    /** Estilo de linhas e polígonos (pontos usam o alfinete padrão do Leaflet). */
    estilo?: PathOptions;
    estiloDestaque?: PathOptions;
    /**
     * Só para linhas: largura (px) de uma faixa invisível desenhada por cima da linha.
     * A linha tem poucos pixels e o dedo erra o toque, que cai no município de baixo;
     * a faixa aumenta a área de toque sem engrossar o desenho.
     */
    larguraToque?: number;
};

export const CAMADAS: Camada[] = [
    {
        id: "municipios",
        nome: "Municípios MG + RJ (IBGE)",
        arquivo: "/municipios-mg-rj.geojson",
        campoTitulo: "NM_MUN",
        estilo: {
            color: "#38bdf8",
            weight: 1,
            opacity: 0.95,
            fillColor: "#38bdf8",
            fillOpacity: 0.12,
        },
        estiloDestaque: {
            weight: 3,
            fillOpacity: 0.35,
        },
    },
    {
        id: "hidrografia",
        nome: "Hidrografia (Rio Pomba)",
        arquivo: "/hidrografia.geojson",
        campoTitulo: "NOME",
        estilo: {
            color: "#2563eb",
            weight: 5,
            opacity: 0.9,
        },
        // Aplicado à faixa de toque: ela aparece laranja translúcida quando o rio é tocado
        estiloDestaque: {
            color: "#f59e0b",
            opacity: 0.6,
        },
        larguraToque: 30,
    },
    {
        id: "pontos",
        nome: "Pontos de interesse (desenho próprio)",
        arquivo: "/pontos-interesse.geojson",
        campoTitulo: "NOME",
    },
];

/** Rótulos legíveis para as chaves de `properties` (o que não estiver aqui aparece com o nome original). */
export const ROTULOS: Record<string, string> = {
    CD_MUN: "Código IBGE",
    NM_MUN: "Município",
    SIGLA_UF: "UF",
    NM_RGI: "Região imediata",
    NM_RGINT: "Região intermediária",
    AREA_KM2: "Área (km²)",
    NOME: "Nome",
    TIPO: "Tipo",
    BACIA: "Bacia",
    MUNICIPIO: "Município",
    DESCRICAO: "Descrição",
    FONTE: "Fonte",
};

export function rotulo(chave: string): string {
    return ROTULOS[chave] ?? chave;
}

/** Números no padrão brasileiro (299.418 -> "299,418"); códigos ficam como texto. */
export function formatarValor(valor: unknown): string {
    if (typeof valor === "number") return valor.toLocaleString("pt-BR");
    if (valor === null || valor === undefined) return "—";
    return String(valor);
}

export type FeicaoSelecionada = {
    camada: string;
    geometria: string;
    titulo: string;
    atributos: Record<string, unknown>;
};
