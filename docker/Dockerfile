############################################################
# Dockerfile to build ubuntu container images
############################################################

# Set the base image to Ubuntu
FROM node:alpine

# File Author / Maintainer
MAINTAINER Vignesh S

################## BEGIN INSTALLATION ######################
# RUN apk add --no-cache  --repository http://dl-cdn.alpinelinux.org/alpine/edge/main --repository  http://dl-cdn.alpinelinux.org/alpine/edge/community  docker
RUN apk update && apk upgrade 
RUN apk add --no-cache bash git python make g++
RUN git clone https://github.com/vignesh380/edissHW3.git /home/node
RUN cd /home/node && npm update  && npm install --save && npm update
# RUN npm install forever -g
RUN npm install pm2 -g
##################### INSTALLATION END #####################


# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
RUN mv /home/node/package.json /tmp/package.json
#RUN cd /tmp && npm install
#RUN cp -a /tmp/node_modules /home/node/

# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
WORKDIR /home/node
ADD . /home/node


# Expose the default port
EXPOSE 3000

# Default port to execute the entrypoint
CMD ["pm2-docker", "bin/www"]