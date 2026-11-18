# CODARIQ: aktueller VPS-Website-Stand

Quellsicherung vom 18. November 2026. Dieser Ordner enthält den derzeit eingesetzten PHP-/Apache-Wartungsstand von `codariq.de`, einschließlich Blog-Rendering, lokal ausgelieferter Fonts, CCM19 und Clarity-Anbindung. Der Astro-Quellbaum im Repository bleibt als eigenständiger Entwicklungsstand erhalten; er ist nicht mit dem aktuell ausgelieferten Wartungsstand gleichzusetzen.

Nach dem Tracking-Ausbau desselben Tages erneut mit dem Live-Stand abgeglichen: GA4 `G-PV0P0WH6KY` wird jetzt ausschließlich nach der separaten optionalen CCM19-Freigabe geladen, unabhängig von Clarity. Kontaktannahme/-fehler, CTA-Sichtbarkeit und Positionskennungen sind enthalten. Aktueller technischer Abnahmebericht im privaten Growth-Board-Projekt: `TRACKING-LIVE-ACCEPTANCE.md`.

## Maßgebliche Dateien

- `stage/site/`: aktuelle öffentliche Website-Dateien; direkt aus `/srv/codariq/release/stage/site` übernommen.
- `apache/`, `php/`, `Dockerfile`, `compose.yaml`: vorhandene Laufzeit-/Buildkonfiguration.
- `SOURCE-MANIFEST.json`: SHA256-Herkunftsnachweis der vom VPS übernommenen Dateien.
- Die bestehende `README.md`, `assets/` und `stage-runtime.sh` stammen aus der ursprünglichen Migration. Ihre eigene Consent-Vorlage ist historisch. **`stage-runtime.sh` nicht erneut auf den aktuellen Stand anwenden:** Das würde spätere Blog-, Font- und CCM19-Änderungen überschreiben. Aktueller Build-Eingang ist bereits `stage/site/`.

Die mitgesicherte `.dockerignore` enthält die später hinzugekommenen öffentlichen Blog-, Font- und Consent-Dateien. Beim aktuellen Tracking-Rollout wurden diese Build-Eingänge auch auf dem VPS abgesichert. Die GitHub-Sicherung selbst löst keinen weiteren Rollout aus.

## Nicht in Git

Kein Webhook-Passwort, kein privater Konfigurationsinhalt, keine `.env`, keine Datenbank und keine Nutzer-/Formulardaten. Die im öffentlichen CCM19-Script sichtbare Einbindungskennung ist keine private Admin-API-Zugangsdatei.

Blogdaten und Cover sind externe Laufzeitinhalte. Die vorhandene Compose-Konfiguration erwartet `/srv/codariq/content` sowie die private Webhook-Konfiguration außerhalb des Webroots. Diese müssen getrennt gesichert und auf dem Zielsystem bereitgestellt werden; dieses Repository ersetzt keine Laufzeit-Datensicherung.

## Rollout

Diese GitHub-Sicherung führt keinen Rollout aus. Vor späterer Bereitstellung private Mounts und Proxy-Netzwerk bereitstellen, den alten Container sichern und den vollständigen Build-/Consent-/Formularablauf separat abnehmen. Der historische Image-Tag in `compose.yaml` ist ein lokaler VPS-Pin, kein öffentlich verfügbares Image.
