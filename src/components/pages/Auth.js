import React, { Component } from 'react';
import AuthContext from '../context/auth-context';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/app';
import 'firebase/auth';
import { fetchNoAuth } from '../api-calls/Fetch';

import "./Auth.css";
import 'firebaseui/dist/firebaseui.css';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN
});

/**
 * Auth page for login and registration
 */
class AuthPage extends Component {
  state = {
    isLogin: true
  }

  static contextType = AuthContext;

  uiConfig = {
    signInFlow: "popup",
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccessWithAuthResult: (result) => {
        this.handleFirebase(result.user);
        return false;
      },
      signInFailure: function (error) {
        console.log(error);
      }
    }
  };

  componentDidMount() {
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(() => { });
  }

  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  /**
   * Switch between login and registration
   */
  switchModeHandler = () => {
    this.setState(prevState => {
      return { isLogin: !prevState.isLogin };
    });
  }

  /**
   * Handles login and registration based on state.isLogin.
   * User is received from firebase.
   * It can be Student or Mentor depending on context.isMentor.
   * 
   * @param {Object} user
   */
  handleFirebase = (user) => {
    if (!user.email) {
      alert("Current user does not have an email address.");
      window.location.reload();
    }

    const email = user.email;
    const uid = user.uid;

    if (email.trim().length === 0 || uid.trim().length === 0) {
      return;
    }

    let requestBody = {
      query: `
      query {
        login(email: "${email}", uid: "${uid}", isMentor: ${this.context.isMentor}) {
          userId
          token
          tokenExpiration
          isAdmin
          isVerified
        }
      }
    `
    };

    if (!this.state.isLogin && this.context.isMentor) {
      requestBody = {
        query: `
        mutation {
          createMentor(mentorInput: {email: "${email}", uid: "${uid}"}) {
            _id
            email
          }
        }
      `
      };
    } else if (!this.state.isLogin && !this.context.isMentor) {
      requestBody = {
        query: `
        mutation {
          createStudent(studentInput: {email: "${email}", uid: "${uid}"}) {
            _id
            email
          }
        }
      `
      };
    }

    fetchNoAuth(requestBody)
      .then(resData => {
        const response = resData.data.login;
        if (response) {
          this.setState({ isSignedIn: !!user });
          this.context.login(
            response.token,
            response.userId,
            response.isAdmin,
            response.isVerified
          );

          localStorage.setItem("token", response.token);
        } else if (resData.data) {
          if (resData.data.createMentor) {
            alert("Created mentor " + resData.data.createMentor.email);
          } else if (resData.data.createStudent) {
            alert("Created student " + resData.data.createStudent.email);
          }

          // Login user after the account is created
          if (!this.state.isLogin) {
            this.switchModeHandler();
            this.handleFirebase(firebase.auth().currentUser);
          }
        }
        if (resData.errors) {
          alert(resData.errors[0].message);
          window.location.reload();
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <React.Fragment>
        <div className="auth-form">
          {this.state.isSignedIn ? (
            <center>
              <div>Signed in!</div>

              <h1>
                Welcome {
                  firebase.auth().currentUser.displayName
                  || firebase.auth().currentUser.providerData[0].displayName
                  || firebase.auth().currentUser.providerData[1].displayName
                }
              </h1>
              <p>
                {firebase.auth().currentUser.email}
              </p>
              <img
                src={firebase.auth().currentUser.photoURL}
                alt={firebase.auth().currentUser.displayName}
                height="100px"
              />
            </center>
          ) : (
              <React.Fragment>
                <StyledFirebaseAuth
                  uiConfig={this.uiConfig}
                  firebaseAuth={firebase.auth()}
                />
                <br />
                <div className="form-actions">
                  <center>
                    <button className="btn" onClick={this.switchModeHandler}>
                      Switch to {this.state.isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </center>
                </div>
              </React.Fragment>
            )}
        </div>
      </React.Fragment>
    );
  }
}

export default AuthPage;
