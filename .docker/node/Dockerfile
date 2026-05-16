FROM node:24-alpine AS img_build

# make sure you can use HTTPS
RUN apk --update add ca-certificates

# persistent / runtime deps
RUN apk update \
    && apk add --no-cache --virtual .persistent-deps \
        git      
        
# Download and install Yarn:
RUN corepack enable
RUN corepack install --global yarn 
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

FROM img_build AS vitepress

# Arguments
ARG UID=1001
ARG WORKDIR="/src"

# Add user
RUN <<EOF
    getent group www-data || addgroup -g ${UID} www-data
    if ! getent passwd ${UID} >/dev/null; then
      adduser -u ${UID} -G www-data -s /bin/sh -D developer;
    else
      existing_user=$(getent passwd 1000 | cut -d: -f1) &&
      addgroup ${existing_user} www-data;
    fi
EOF

# Create structure application
RUN mkdir -p $WORKDIR \
    && chown -R $UID:www-data $WORKDIR
