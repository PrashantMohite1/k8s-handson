FROM nginx:alpine

COPY site/ /usr/share/nginx/html/
COPY nginx-templates/config.js.template /etc/nginx/templates/config.js.template

EXPOSE 80

ARG VERSION=1.0.0
ARG THEME=default
LABEL version="${VERSION}"
LABEL theme="${THEME}"

# Rendered from nginx-templates/config.js.template into config.js at container
# start (via nginx's built-in envsubst-on-templates entrypoint script). Baked
# in here as the image's default, but can still be overridden per-container
# with `docker run -e` / a k8s env var, without rebuilding.
ENV NGINX_ENVSUBST_OUTPUT_DIR=/usr/share/nginx/html
ENV APP_VERSION=${VERSION}
ENV APP_THEME=${THEME}
