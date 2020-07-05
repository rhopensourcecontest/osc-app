# Backend

An Express.js server that exposes a GraphQL API.

### First-time Setup

* Install the packages needed to run the backend application with<br>
  ```
  $ npm install
  ```
* Set up environment variables in `nodemon.json` needed to run all the modules
  * **MongoDB**
    * Create an account at https://www.mongodb.com/cloud/atlas
    * Set up a cluster
    * You may need to setup a database user account in Atlas under `Security/Database Access`
    * You may need to edit allowed IP addresses in Atlas under `Security/Network Access` 
    * Retrieve the following values:
      * `MONGO_USER`
      * `MONGO_PASSWORD`
      * `MONGO_DB`
  * **Nodemailer**
    * Create OAuth credentials following the steps [here](https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1)
    * Retrieve the following values:
      * `GMAIL_ADDRESS`
      * `GMAIL_CLIENT_ID`
      * `GMAIL_CLIENT_SECRET`
      * `GMAIL_REDIRECT_URL`
      * `GMAIL_REFRESH_TOKEN`
  * **JWT**
    * Create a secure `JWT_SECRET_KEY`

## Available Scripts

In the `backend` directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:5000](http://localhost:5000) to view it in the browser.

GraphiQL user interface of the API will be accessible at [http://localhost:5000/graphql](http://localhost:5000/graphql).

The server will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the tests.<br>

### `npm run build`

Builds the app for production to the `build` folder.<br>
It optimizes the build for the best performance.
