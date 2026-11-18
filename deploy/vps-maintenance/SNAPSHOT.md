# CODARIQ: aktueller VPS-Website-Stand

Quellsicherung vom 18. November 2026. Dieser Ordner enthält den derzeit eingesetzten PHP-/Apache-Wartungsstand von `codariq.de`, einschließlich Blog-Rendering, lokal ausgelieferter Fonts, CCM19 und Clarity-Anbindung. Der Astro-Quellbaum im Repository bleibt als eigenständiger Entwicklungsstand erhalten; er ist nicht mit dem aktuell ausgelieferten Wartungsstand gleichzusetzen.

## Maßgebliche Dateien

- `stage/site/`: aktuelle öffentliche Website-Dateien; direkt aus `/srv/codariq/release/stage/site` übernommen.
- `apache/`, `php/`, `Dockerfile`, `compose.yaml`: vorhandene Laufzeit-/Buildkonfiguration.
- `SOURCE-MANIFEST.json`: SHA256-Herkunftsnachweis der vom VPS übernommenen Dateien.
- Die bestehende `README.md`, `assets/` und `stage-runtime.sh` stammen aus der ursprünglichen Migration. Ihre eigene Consent-Vorlage ist historisch. **`stage-runtime.sh` nicht erneut auf den aktuellen Stand anwenden:** Das würde spätere Blog-, Font- und CCM19-Änderungen überschreiben. Aktueller Build-Eingang ist bereits `stage/site/`.

Die mitgesicherte `.dockerignore` wurde ausschließlich in dieser Git-Arbeitskopie um die später hinzugekommenen öffentlichen Blog-, Font- und Consent-Dateien ergänzt. Auf dem VPS wurde nichts geändert.

## Nicht in Git

Kein Webhook-Passwort, kein privater Konfigurationsinhalt, keine `.env`, keine Datenbank und keine Nutzer-/Formulardaten. Die im öffentlichen CCM19-Script sichtbare Einbindungskennung ist keine private Admin-API-Zugangsdatei.

Blogdaten und Cover sind externe Laufzeitinhalte. Die vorhandene Compose-Konfiguration erwartet `/srv/codariq/content` sowie die private Webhook-Konfiguration außerhalb des Webroots. Diese müssen getrennt gesichert und auf dem Zielsystem bereitgestellt werden; dieses Repository ersetzt keine Laufzeit-Datensicherung.

## Rollout

Diese GitHub-Sicherung führt keinen Rollout aus. Vor späterer Bereitstellung private Mounts und Proxy-Netzwerk bereitstellen, den alten Container sichern und den vollständigen Build-/Consent-/Formularablauf separat abnehmen. Der historische Image-Tag in `compose.yaml` ist ein lokaler VPS-Pin, kein öffentlich verfügbares Image.
