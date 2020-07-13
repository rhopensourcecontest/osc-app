# Frontend

A single-page React application that serves as a user interface for the Open Source Contest web application.

### First-time Setup

* Install the packages needed to run the frontend application with<br>
  ```
  $ npm install
  ```

* Set up environment variables in `.env` needed to run all the modules
  * **Firebase**
    * Create an account at https://console.firebase.google.com/
    * Set up a project
    * Enable Sign-in providers that you want to use
      * Facebook ID and secret can be retrieved by adding an app [here](https://developers.facebook.com/apps)
      * GitHub ID and secret can be retrieved by adding an app [here](https://github.com/settings/developers)
      * Google can be enabled directly in Firebase
    * Retrieve the following values:
      * `REACT_APP_FIREBASE_APIKEY`
      * `REACT_APP_FIREBASE_AUTHDOMAIN`
  * **API location**
    * Edit the following values:
      * `REACT_APP_LOCAL_API_LOCATION` defaults to `http://localhost:5000/graphql`
      * `REACT_APP_REMOTE_API_LOCATION`

### Available scripts

In the `frontend` directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
