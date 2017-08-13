############################################################
# Dockerfile to build ubuntu container images
############################################################

# Set the base image to Ubuntu
FROM node:alpine

# File Author / Maintainer
MAINTAINER Vignesh S

################## BEGIN INSTALLATION ######################
RUN apk update && apk upgrade && \
    apk add --no-cache bash git python make g++
RUN cd ~
RUN git clone https://github.com/vignesh380/edissHW3.git
RUN cd edissHW3
RUN npm install --save
# RUN npm install forever -g
RUN npm install pm2 -g
##################### INSTALLATION END #####################

# Expose the default port
EXPOSE 3000

# Default port to execute the entrypoint
CMD ["pm2-docker", "bin/www"]