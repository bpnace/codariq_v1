#!/usr/bin/env python3
"""Apply the maintained Clarity consent and disclosure overlay to staged pages."""

from pathlib import Path
import sys


STAGE = Path(sys.argv[1])


def replace_once(path: Path, old: str, new: str, description: str) -> None:
    text = path.read_text(encoding="utf-8")
    if new in text:
        return
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one {description} in {path.name}; found {count}.")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


pages = ("index.html", "impressum.html", "datenschutz.html")
for name in pages:
    page = STAGE / name
    replace_once(
        page,
        '<link rel="stylesheet" href="style.css">',
        '<link rel="stylesheet" href="style.css">\n  <link rel="stylesheet" href="clarity-consent.css">',
        "stylesheet insertion point",
    )
    replace_once(
        page,
        '<dialog id="contact-dialog" class="site-dialog" aria-labelledby="contact-heading">',
        '<dialog id="contact-dialog" class="site-dialog" aria-labelledby="contact-heading" data-clarity-mask="true">',
        "contact dialog",
    )
    if name == "index.html":
        replace_once(
            page,
            '<span class="footer-coords" id="coords">00°N / 00°E</span>',
            '<span class="footer-coords" id="coords">00°N / 00°E</span>\n      <button type="button" class="clarity-settings" data-clarity-settings>Analyse-Einstellungen</button>',
            "footer settings button",
        )
    elif name in ("impressum.html", "datenschutz.html"):
        replace_once(
            page,
            '    <div class="legal-body">',
            '    <div class="legal-body">\n      <button type="button" class="clarity-settings" data-clarity-settings>Analyse-Einstellungen</button>',
            "legal settings button",
        )

    if "id=\"analytics-consent\"" not in page.read_text(encoding="utf-8"):
        replace_once(
            page,
            '  <script src="contact.js"></script>\n</body>',
            '''  <script src="contact.js"></script>
  <aside class="clarity-consent" id="analytics-consent" aria-labelledby="analytics-consent-heading" hidden>
    <div>
      <h2 id="analytics-consent-heading" tabindex="-1">Analyse-Einstellungen</h2>
      <p>Wir verwenden Microsoft Clarity nur mit deiner Zustimmung, um die Nutzung dieser Website anhand von Heatmaps und Sitzungsaufzeichnungen zu verstehen. <a href="/datenschutz">Mehr zum Datenschutz</a>.</p>
    </div>
    <div class="clarity-consent__actions">
      <button type="button" data-clarity-deny>Analyse ablehnen</button>
      <button type="button" data-clarity-allow>Analyse erlauben</button>
    </div>
  </aside>
  <script src="clarity-consent.js"></script>
</body>''',
            "consent UI insertion point",
        )

privacy = STAGE / "datenschutz.html"
replace_once(
    privacy,
    '''      <h3>6. Ihre Rechte</h3>''',
    '''      <h3>6. Microsoft Clarity (optionale Nutzungsanalyse)</h3>
      <p>Microsoft Clarity wird nur geladen, wenn Sie zuvor über „Analyse erlauben“ ausdrücklich eingewilligt haben. Anbieter ist Microsoft. Clarity hilft uns, die Nutzung dieser Website zu verstehen und ihre Darstellung zu verbessern. Dazu erstellt der Dienst Heatmaps und Sitzungsaufzeichnungen mit Seitenaufrufen, Klicks, Maus- und Scrollbewegungen sowie technischen Nutzungsdaten wie Browser-, Geräte-, Seiten- und Verweisangaben.</p>
      <p>Microsoft verarbeitet dabei auch technische Kennungen zur Zuordnung von Sitzungen; beim Abruf des Clarity-Skripts kann insbesondere Ihre IP-Adresse an Microsoft übermittelt werden. Wir übermitteln keine von uns gesetzten Clarity-Ereignisse oder Nutzerkennungen und keine Kontaktformularinhalte. Das Kontaktformular ist zusätzlich mit der Clarity-Maskierung gekennzeichnet. Bei erteilter Einwilligung kann Clarity Cookies und vergleichbare Speichertechniken verwenden. Ihre Auswahl speichern wir für sechs Monate in Ihrem Browser (localStorage).</p>
      <p>Rechtsgrundlage für das Speichern oder Auslesen von Informationen auf Ihrem Endgerät ist § 25 Abs. 1 TDDDG; für die anschließende Verarbeitung gilt Art. 6 Abs. 1 lit. a DSGVO. Sie können Ihre Einwilligung jederzeit über „Analyse-Einstellungen“ am Seitenende oder hier im Dialog mit Wirkung für die Zukunft ändern oder widerrufen. Eine Verarbeitung in Drittländern, insbesondere den USA, kann nicht ausgeschlossen werden. Weitere Informationen finden Sie in der <a href="https://privacy.microsoft.com/de-de/privacystatement" target="_blank" rel="noopener noreferrer">Microsoft-Datenschutzerklärung</a>.</p>
      <h3>7. Ihre Rechte</h3>''',
    "Clarity disclosure insertion point",
)
replace_once(
    privacy,
    "      <p>Stand Oktober 2026</p>",
    "      <p>Stand November 2026</p>",
    "privacy policy date",
)
