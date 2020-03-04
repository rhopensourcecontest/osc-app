import React, { Component } from 'react';

import "./Auth.css";
import AuthContext from '../context/auth-context';

import firebase from 'firebase';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import 'firebaseui/dist/firebaseui.css';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN
});

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

  switchModeHandler = () => {
    this.setState(prevState => {
      return { isLogin: !prevState.isLogin };
    });
  }

  handleFirebase = (user) => {
    if (!user.email) {
      alert("Current user does not have an email address.");
      window.location.reload();
    }

    const email = user.email;

    if (email.trim().length === 0) {
      return;
    }

    let requestBody = {
      query: `
      query {
        login(email: "${email}", isMentor: ${this.context.isMentor}) {
          userId
          token
          tokenExpiration
        }
      }
    `
    };

    if (!this.state.isLogin && this.context.isMentor) {
      requestBody = {
        query: `
        mutation {
          createMentor(mentorInput: {email: "${email}"}) {
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
          createStudent(studentInput: {email: "${email}"}) {
            _id
            email
          }
        }
      `
      };
    }

    fetch('http://localhost:5000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          // alert("Something went wrong.");
          throw new Error('Failed');
        }
        return res.json();
      })
      .then(resData => {
        if (resData.data.login) {
          this.setState({ isSignedIn: !!user });
          this.context.login(
            resData.data.login.token,
            resData.data.login.userId,
            resData.data.login.tokenExpiration,
            this.state.isSignedIn
          );
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
          {this.context.isSignedIn ? (
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
                    <button type="button" onClick={this.switchModeHandler}>
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