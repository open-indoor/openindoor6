FROM node:16-bullseye

RUN apt update
RUN apt install -y iproute2
WORKDIR /root/openindoor6
# RUN yarn add nodemon @babel/core @babel/cli @babel/node @babel/preset-env prettier eslint eslint-plugin-node jest jest-cli eslint-plugin-jest --dev
# RUN npm i --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin @babel/core @babel/preset-env babel-loader
RUN yarn add --dev webpack webpack-cli @webpack-cli/init @webpack-cli/serve webpack-dev-server html-webpack-plugin @babel/core @babel/preset-env babel-loader
RUN yarn add webpack webpack-cli @webpack-cli/init @webpack-cli/serve webpack-dev-server html-webpack-plugin @babel/core @babel/preset-env babel-loader
# RUN yarn global add @webpack-cli/init @webpack-cli/serve
# RUN yarn add -D @webpack-cli/serve
RUN yarn global add http-server
# RUN yarn init -y

ADD ./src ./src
ADD ./public ./public
ADD ./package.json ./
ADD ./webpack.config.js ./
RUN yarn install

CMD yarn run start