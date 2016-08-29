Github repo: https://github.com/matthieu-vincke/MicroservicesStarter   

# Starter kit for Microservices using Dockers and Swagger

This is a starter kit I use for projects based on a Microservices architecture.
It is based on Docker containers and uses Swagger to build the Microservices using Node.js and Express.
The Swagger project includes a Redis db in order to be able to rely on Swagger plugins like OAuth etc..
Below are simple instructions, please contact me if you need more details.

## Development
### Windows
#### For the dev of each microservice:
- set in C:\Windows\System32\drivers\etc\hosts
  ```
  127.0.0.1 redisDocker
  ```
- npm install
- run a local redis (you can find the binaries for Windows in https://github.com/MSOpenTech/redis/releases)
- setEnvWindows.bat

#### Running tests
- swagger project test

#### Running the project
- swagger project start
You can now go on http://127.0.0.1:8000/hello?name=Scott to check you microservice

#### Edit the swagger project
- swagger project edit

#### See the microservice documentation
- With the project started, go to: http://127.0.0.1:8000/docs

#### Using the Redis OAuth
More information to come...

### Linux
- Never tested on Linux but should work... If anyone to contribute on this, I would be grateful.

##Staging
More than staging, it is between dev and staging actually... It is a way to run the full architecture in your local computer
### Windows
- Run docker tools
- Go to the folder when the sources are
- Follow the instructions below:   
On Windows, with docker tools, you might not have your container running properly...  
This is a well known problem due to the fact the containers are actually running on the virtual machine (The default docker machine) and not directly on your machine. As the path: ./MicroServices/UserManager doesn't actually exist on the default machine, you understand this can't work: we have to mount our local folder to a folder of the docker default machine to make this work.  
I found some help for this on https://gist.github.com/matthiasg/76dd03926d095db08745
Basically, what you have to do is the following:
  - Open virtual box (installed with the docker tools), right click on the default machine that is actually the docker-machine default
  - Add your c drive (or the drive in which your sources live) as a shared folder. For me it is C:\ under the name 'c'
  - Go to the docker-tools prompt and type
  - docker-machine ssh default
  - cd /var/lib/boot2docker
  - sudo vi ./bootsync.sh
  - Set it as:  

    ```python
    #!/bin/sh

    mkdir /home/docker/c
    mount.vboxsf c /home/docker/c   
    ```   

  - sudo chmod +x ./bootsync.sh
  - exit
  - Then, restart the docker machine with 'docker-machine restart'
  - You can ssh again the docker machine to see the folder is correctly mounted
  - Modify the docker-compose file with the complete path to your sources.
  For me:

    ```
    volumes:
    - //home/docker/c/Work/GitHub/MicroservicesStarter/MicroServiceOne:/usr/src/app
    ```

  If you don't to this, you will have to rebuild the MicroServiceOne container everytime you do a change in the code! This is not a good way to develop... Using a volume allow you to only have to restart the container to take your code changes into account or even to only restart the node server.  

Once you are done with all this, type:
- docker-compose -f docker-compose-dev.yaml build
This command will build the docker containers. Once it is done, we can run everything
- docker-compose -f docker-compose-dev.yaml up -d
- All the services: redis and microserviceone should be running, to check it:
- docker ps command should return something like this:

```
$ docker ps
CONTAINER ID        IMAGE                                  COMMAND                  CREATED             STATUS              PORTS                     NAMES
b4ec3054de0b        microservicesstarter_microserviceone   "node app.js"            22 seconds ago      Up 19 seconds       0.0.0.0:8000->10010/tcp   microservicesstarter_microserviceone_1
ebd8af6c290f        redis                                  "docker-entrypoint.sh"   22 seconds ago      Up 20 seconds       6379/tcp                  microservicesstarter_redisDocker_1
```

## Production
### Auto deployment
The auto deployment is ready for circleci. It has been tested using Digital Ocean.
For further details, you can check the file "circle.yml".
This is still a work in progress as the deployment is not fully automatic as it needs a manual restart.
More to come soon...

## Contacts
You can contact me on Twitter ![Twitter](https://dl.dropboxusercontent.com/u/52579856/OpenYeller/Img/TwitterBird-40x40.png): [Matthieu Vincke](https://twitter.com/MatthieuVincke)
