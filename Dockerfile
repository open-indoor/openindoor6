FROM node:16-bullseye

RUN apt update
RUN apt install -y iproute2
WORKDIR /root/openindoor6
ADD ./package.json ./

RUN yarn add --dev webpack webpack-cli @webpack-cli/init @webpack-cli/serve webpack-dev-server html-webpack-plugin @babel/core @babel/preset-env babel-loader
RUN yarn add --dev css-loader style-loader
RUN yarn add --dev image-webpack-loader imagemin
RUN yarn add --dev clean-webpack-plugin
RUN yarn add --dev svg-inline-loader
RUN yarn add --dev path
RUN yarn add --dev jest

RUN yarn global add http-server

ADD ./src ./src
ADD ./public ./public
ADD ./webpack.config.js ./
RUN yarn install

CMD yarn run start