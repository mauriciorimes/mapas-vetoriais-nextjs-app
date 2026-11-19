// Service worker do PWA: guarda o app e as camadas GeoJSON para abrir mesmo sem rede.
// Os ladrilhos do mapa de fundo (ESRI / OpenStreetMap) NÃO entram no cache: são de outro
// domínio e, guardando todos, o cache cresceria sem limite enquanto o usuário navega.
const CACHE = "mapas-vetoriais-v1";
const APP_SHELL = [
    "/",
    "/manifest.webmanifest",
    "/municipios-mg-rj.geojson",
    "/hidrografia.geojson",
    "/pontos-interesse.geojson",
];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((chaves) =>
                Promise.all(chaves.filter((chave) => chave !== CACHE).map((chave) => caches.delete(chave))),
            ),
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    // Só o que é do próprio site (app + GeoJSON). Ladrilhos de outros domínios vão direto para a rede.
    if (new URL(request.url).origin !== self.location.origin) return;

    // Rede primeiro, cache como reserva quando estiver offline.
    event.respondWith(
        fetch(request)
            .then((resposta) => {
                if (resposta.ok) {
                    const copia = resposta.clone();
                    caches.open(CACHE).then((cache) => cache.put(request, copia));
                }
                return resposta;
            })
            .catch(() => caches.match(request).then((emCache) => emCache ?? caches.match("/"))),
    );
});
