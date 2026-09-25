const CACHE = "atlas-perche-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

async function cachePageAndAssets(pageUrl, packageUrl) {
  const cache = await caches.open(CACHE);
  const pageResponse = await fetch(pageUrl, { cache: "reload" });
  if (!pageResponse.ok) throw new Error("page");
  await cache.put(pageUrl, pageResponse.clone());

  const html = await pageResponse.text();
  const matches = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  const urls = [...new Set(matches)]
    .map((value) => new URL(value, pageUrl))
    .filter((url) => url.origin === new URL(pageUrl).origin)
    .map((url) => url.href);

  await Promise.all(urls.map(async (url) => {
    try {
      const response = await fetch(url);
      if (response.ok) await cache.put(url, response);
    } catch {}
  }));

  const pkg = await fetch(packageUrl);
  if (!pkg.ok) throw new Error("package");
  await cache.put(packageUrl, pkg);
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_ACTIVITY") return;
  event.waitUntil(
    cachePageAndAssets(event.data.pageUrl, event.data.packageUrl)
      .then(() => event.ports?.[0]?.postMessage({ ok: true }))
      .catch(() => event.ports?.[0]?.postMessage({ ok: false }))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then(async (response) => {
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
          const cache = await caches.open(CACHE);
          cache.put(event.request, response.clone());
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          const candidates = await caches.open(CACHE).then((cache) => cache.keys());
          const page = candidates.find((request) => request.url.includes("/attivita/perche"));
          if (page) return caches.match(page);
        }
        return Response.error();
      })
  );
});
