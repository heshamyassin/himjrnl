FROM ubuntu:22.04
# FROM node:23
ENV IS_DOCKER=true

# Metadata
LABEL com.example.vendor="TheHiM"
LABEL org.opencontainers.image.title="TheHiM"
LABEL org.opencontainers.image.authors="himjrnl@gmail.com"
LABEL org.opencontainers.image.description="In a digital age where modern gentlemen are losing the true essence of luxury, HiM offers exclusive access to inspiring stories and unique conversations of like—minded refined men who share a passion for adventure."
LABEL org.opencontainers.image.url=https://github.com/hgyassin/himjrnl
LABEL org.opencontainers.image.source=https://github.com/hgyassin/himjrnl

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Set debconf to run non-interactively
ARG DEBIAN_FRONTEND=noninteractive

### Set VERSION Variables
ENV PIPENV_VERSION=2022.7.24
ENV HOME_PATH=/home/docker
ENV HIM_PATH=$HOME_PATH/HIM
ENV NVM_DIR=$HOME_PATH/.nvm
ENV NODE_VERSION=v21.2.0

# Install base dependencies
WORKDIR /usr/local
RUN apt-get update && apt-get install --yes -q --no-install-recommends \
apt-transport-https build-essential ca-certificates curl git wget openssl \
ssh openssh-server sudo software-properties-common libsndfile1 ffmpeg \ 
patchelf python3 python3-dev python3-pip python3-venv automake make g++ \ 
ncurses-dev nvi pkg-config unzip wavpack zip libtool libssl-dev libz-dev \
zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev llvm libncurses5-dev \
xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev libgdbm-dev \
libnss3-dev libc6-dev
RUN sudo chmod -R a+rwx $PWD
ENV PATH=$PWD:$PATH
WORKDIR $HOME_PATH

############## HIM DEPENDENCIES ##############
# Run the container as an unprivileged user
RUN groupadd docker && useradd -g docker -s /bin/bash -m docker
RUN adduser docker sudo && sudo visudo -f /etc/sudoers && chown -R docker $PWD
USER docker
WORKDIR $HOME_PATH

### Install Node.js with nvm
ENV NVM_DIR=$HOME_PATH/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
RUN /bin/bash -c "source $NVM_DIR/nvm.sh && nvm install $NODE_VERSION && nvm use --delete-prefix $NODE_VERSION"

# cleanup
USER root
RUN apt-get update && apt-get upgrade -y && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Update npm install folder (local/global)
WORKDIR $HIM_PATH
RUN chown -R docker $PWD
ENV PATH=$PWD/bin:$PWD/lib:$NVM_DIR/versions/node/$NODE_VERSION/bin:$PATH
RUN npm config set prefix $PWD && npm config set prefix $PWD -g

############## HIM CORE ##############
# Install HIM
EXPOSE 3000:3000

# USER docker
COPY --chown=docker ./ ./

RUN npm install

CMD ["npm", "start"]

# docker run -p 3000:3000 express