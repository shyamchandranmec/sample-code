# Dockerfile
# using debian:jessie for it's smaller size over ubuntu

FROM debian:jessie
RUN echo "Edited on 21-1-2016"

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Set environment variables
ENV appDir /var/www/app/current

# Run updates and install deps
RUN apt-get update

RUN apt-get install -y -q --no-install-recommends \
    apt-transport-https \
    build-essential \
    ca-certificates \
    curl \
    g++ \
    gcc \
    git \
    make \
    nginx \
    sudo \
    wget \
    python \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get -y autoclean

RUN apt-get -qq update
RUN apt-get -qq -y install vim

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 4.0.0

# Install nvm with node and npm
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# Set up our PATH correctly so we don't have to long-reference npm, node, &c.
ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Set the work directory
RUN mkdir -p ${appDir}
WORKDIR ${appDir}

# Add our package.json and install *before* adding our application files
ADD package.json ./
RUN npm install -g node-gyp
RUN npm install

# Install pm2 so we can run our application
RUN npm i -g pm2

# Add application files
RUN echo "Edited on March-2-70pm"
ADD . ${appDir}

#Expose the port
EXPOSE 3000

RUN npm run-script apidoc
CMD ["pm2", "start", "processes.json", "--no-daemon"]
