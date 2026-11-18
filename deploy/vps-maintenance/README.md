# CODARIQ VPS deployment

This is the Strato maintenance release with the game, legal pages and contact form. The complete 101-file original is retained in the local `strato-original.tar.gz` with its SHA-256 checksum. Sixteen active files are staged for serving. Astro assets and the inactive newsletter are archived outside the image.

The maintained Clarity integration lives in `assets/`. `stage-runtime.sh` copies the self-hosted consent JavaScript and CSS, applies the Clarity overlay to the three active HTML pages after the webhook proxy path rewrite, and then stages the result. The overlay adds no Microsoft connection until visitors accept analytics; saved choices expire after six months. Run the staging script again after editing the snapshot to regenerate these changes.

Build with `./stage-runtime.sh ../strato-original` and `sudo docker compose build` from the release directory. The live VPS workdir is `/srv/codariq/release`. The service has no published port; ingress uses the existing external `proxy-net` network and the `codariq-web` alias. `sudo docker compose up -d --no-build --wait` starts it. The pinned base supplies PHP 8.5.12, cURL and OpenSSL. The build upgrades Apache to at least Debian's patched `2.4.71-1~deb13u1` and updates zlib to the Debian security build.

The current n8n webhook URL and its already assigned Basic Auth credential are provided to PHP through the read-only VPS file `/srv/codariq/private/webhook-proxy.config.php` (root:www-data, mode 0440). The old Strato endpoint is no longer registered. Keep this secret outside the Docker context and web root. There were no production form submissions during migration testing.

Caddy's candidate and original config are staged under `/srv/codariq/preflight/`. Apply the new routes only with the web DNS cutover ready; its bind-mounted Caddyfile must keep its inode. See `../ingress/rollback.md` for the DNS changes and rollback values. Verify both IPv4 and IPv6, apex and www HTTPS, the expected site content and redirect behavior, and the existing Stackwerkhaus and automation domains.
