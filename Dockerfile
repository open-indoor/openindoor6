FROM node:16-bullseye

RUN apt-get update && apt-get install -y \
    iproute2 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /root/openindoor6
ADD ./package.json ./

RUN yarn add --dev \
    webpack webpack-cli @webpack-cli/init @webpack-cli/serve \
    webpack-dev-server html-webpack-plugin @babel/core @babel/preset-env \
    babel-loader css-loader style-loader image-webpack-loader imagemin \
    clean-webpack-plugin svg-inline-loader path jest

RUN yarn global add http-server

ADD ./src ./src
ADD ./public ./public
ADD ./webpack.config.js ./
RUN yarn install

CMD yarn run start