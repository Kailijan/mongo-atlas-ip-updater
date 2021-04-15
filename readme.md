# Mongo IP Updater

This NodeJS application adds the public ip address of the device it's run on to the Network Access list by using the [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) REST-API.

## Setup

1. Clone this repository
2. Run `npm install` to install the dependencies
3. [Generate a MongoDB Atlas API-Key](https://docs.atlas.mongodb.com/configure-api-access/#programmatic-api-keys)
4. Copy `.env.sample` to `dev.env` | `prod.env` | `qa.env` and add the desired settings
5. `npm run build` to compile typescript
6. `npm run start:[prod|qa|dev]` to run the updater on your desired environment

## Running the updater as a Linux-Service

TODO: Document setup
