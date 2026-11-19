# SIG#07 — Mapas Vetoriais e Tabela de Atributos

PWA em Next.js + React Leaflet que exibe camadas vetoriais em GeoJSON e mostra a Tabela de Atributos (`properties`) de cada feição no Popup e no painel da página.

## Camadas

| Arquivo (`public/`) | Geometria | Origem |
| --- | --- | --- |
| `municipios-mg-rj.geojson` | Polígonos (945 municípios) | IBGE, Malha Municipal 2024 (MG e RJ), convertida com Mapshaper |
| `hidrografia.geojson` | Linha (Rio Pomba) | Traçado de referência do OpenStreetMap |
| `pontos-interesse.geojson` | Pontos | IF Sudeste MG Campus Rio Pomba, centro de Rio Pomba e centro de Itaocara |

Conversão da malha do IBGE (Shapefile em SIRGAS 2000 para GeoJSON em WGS 84):

```bash
npx mapshaper -i MG_Municipios_2024.shp RJ_Municipios_2024.shp combine-files \
  -merge-layers \
  -simplify 3% keep-shapes \
  -filter-fields CD_MUN,NM_MUN,SIGLA_UF,NM_RGI,NM_RGINT,AREA_KM2 \
  -proj wgs84 \
  -o precision=0.00001 format=geojson municipios-mg-rj.geojson
```

## Rodando

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. No celular (mesma rede Wi-Fi), use o endereço `Network` mostrado no terminal.

## Estrutura

- `app/page.tsx`: página com o painel da Tabela de Atributos
- `components/MapaVetorial.tsx`: mapa Leaflet, carregamento dos GeoJSON com `fetch` e `onEachFeature`
- `components/camadas.ts`: configuração das camadas, estilos e rótulos dos atributos
- `app/manifest.ts` e `public/sw.js`: PWA (instalável e com as camadas em cache)

SIG-Web, Prof. José Rui.
