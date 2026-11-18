FROM php:8.5-apache-trixie@sha256:08af36df144462d84c7f16190557eec06cb9f656882685610b712a15eec54d46

ARG APACHE_MIN_VERSION=2.4.71-1~deb13u1
ARG ZLIB_MIN_VERSION=1:1.3.dfsg+really1.3.1-1+deb13u1

COPY apache/site.conf /etc/apache2/sites-available/000-default.conf
COPY apache/security.conf /etc/apache2/conf-available/codariq-security.conf
COPY php/production.ini /usr/local/etc/php/conf.d/zz-codariq-production.ini

RUN set -eux; \
    apt-get update; \
    apt-get install -y --only-upgrade --no-install-recommends \
        apache2 apache2-bin apache2-data apache2-utils zlib1g linux-libc-dev; \
    apache_version="$(dpkg-query -W -f='${Version}' apache2)"; \
    dpkg --compare-versions "$apache_version" ge "$APACHE_MIN_VERSION"; \
    dpkg --compare-versions "$(dpkg-query -W -f='${Version}' zlib1g)" ge "$ZLIB_MIN_VERSION"; \
    a2enmod rewrite; \
    for module in http2 md vhost_alias; do \
        if [ -e "/etc/apache2/mods-enabled/${module}.load" ] || \
            [ -e "/etc/apache2/mods-enabled/${module}.conf" ]; then \
            a2dismod -f "$module"; \
        fi; \
    done; \
    a2enconf codariq-security; \
    a2ensite 000-default; \
    install -d -o root -g www-data -m 0750 /var/www/private; \
    install -d -o root -g www-data -m 0755 /var/www/html; \
    find /var/www/html -mindepth 1 -maxdepth 1 -exec rm -rf '{}' +; \
    php -r 'exit(function_exists("curl_init") ? 0 : 1);'; \
    apachectl -t; \
    rm -rf /var/lib/apt/lists/*

COPY --chown=root:www-data stage/site/ /var/www/html/

RUN set -eux; \
    find /var/www/html -type d -exec chmod 0755 '{}' +; \
    find /var/www/html -type f -exec chmod 0644 '{}' +; \
    chown -R root:www-data /var/www/html

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD ["php", "-r", "$context=stream_context_create(['http'=>['timeout'=>2]]); $body=@file_get_contents('http://127.0.0.1/', false, $context); exit($body === false ? 1 : 0);"]

STOPSIGNAL SIGWINCH
