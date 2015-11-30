# Crossbar Node.JS Image with Consul Service Discovery

This is a docker container that is intended to be used to in a micro services architecture in conjunction with Consul
to dynamically discover the Crossbar.io router with a Node.JS service.

## Usage

To use this image, do the following

### Create Source Files

    src/
     -> app.js
     -> middleware.js
     -> etc.
     
Do not overwrite "crossbar.js".  This handles the dynamic connectivity to the router.  If you need to run locally, copy
"crossbar.js" and "config.json".  Just do not modify since the dynamic aspect may stop working.

### Dockerfile

Create a Dockerfile

    FROM thehq/crossbar-nodejs-service-consul
    
    COPY src/ app/src/
    
### Run Docker

Execute Docker overriding the following environment variables as necessary

  - SERVICE_ENTRY (default=src.app_session.AppSession): The python path to your application session
  - ROUTER_PROTOCOL (default=ws): The protocol to use
  - ROUTER_SERVICE (default=app.router): The name of your Crossbar Router service in Consul
  - ROUTER_REALM (default=realm1): The name of the realm
  - CONSUL_SERVER (default=consul.service.consul:8500): The address of your Consul Server
  
An example of overriding the CONSUL_SERVER and ROUTER_REALM variables

    docker run \
      -e "CONSUL_SERVER=localhost:8500" \
      -e "ROUTER_REALM=main" ...

## Details

This Docker Image has the following features

  - Configures a config.js file (see [templates/config.js.tmpl](templates/config.json.tmpl))
  - Runs "node app.js" inside of a runit daemon (see [services/connect/run](services/connect/run))
  - Runs Consul Template inside of a runit daemon (see [services/config/run](services/config/run))

The result is a service that will reconfigure itself as it dynamically discovers the address of the application router.

## Other Customization

### Reconfigure Service Based on Consul Key/Value Store

Lets say you are using Consul to store some configuration information that your application depends on and you would
like to restart the service whenever that information changes, you can do the following

Assumptions:

  - File is called "data.json" and is read by the code from the run directory, which for this example is in 
    "/app/.crossbar/" inside the container
  - The Consul Key where this data is stored is at "$CONSUL_APP_DATA_PATH + '/data'"

Update the following files

#### templates/data.json.tmpl

    {{ key (print (env "CONSUL_APP_DATA_PATH") "/data") }}
    
#### services/data/run

    #!/bin/bash

    cat /etc/consul-templates/data.json.tmpl

    exec consul-template \
      -consul=$CONSUL_SERVER \
      -template "/etc/consul-templates/data.json.tmpl:/app/src/data.json:cat /app/src/data.json; sv restart connect"

#### Dockerfile

    FROM thehq/crossbar-service-consul
    
    RUN mkdir /etc/consul-templates/
    COPY templates/*.tmpl /etc/consul-templates/

    # Copy any source code
    COPY src/ /app/src/

    # Create the services
    COPY services/ /etc/service/
    RUN chmod +x /etc/service/*/run

Initialize the Consul Key/Value store and run.

## License

MIT
