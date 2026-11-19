<?php
header('Content-Type: text/plain; charset=utf-8');
$data = json_decode(@file_get_contents('/var/www/content/blog.json') ?: '{}', true);
echo <<<'MD'
# CODARIQ

> CODARIQ beschäftigt sich mit kontrollierter KI-Integration in bestehende Abläufe. Schwerpunkte sind Datenflüsse, Rollen, Zugriffsrechte, Freigaben, Protokollierung und Fehlerbehandlung.

## Überblick und Leistungen

- [CODARIQ](https://codariq.de/)
- [KI-Integration in Prozesse](https://codariq.de/ki-integration-prozesse)
- [KI-Dokumentenablage](https://codariq.de/ki-dokumentenablage)
- [Blog](https://codariq.de/blog)
- [Sitemap](https://codariq.de/sitemap.xml)

## Veröffentlichte Beiträge

MD;
foreach (($data['brand'] ?? '') === 'codariq' ? ($data['articles'] ?? []) : [] as $article) {
    $slug = $article['slug'] ?? '';
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $slug)) continue;
    $title = trim(preg_replace('/[\r\n\[\]<>]+/u', ' ', $article['title'] ?? ''));
    if ($title !== '') echo "- [$title](https://codariq.de/blog/$slug)\n";
}
