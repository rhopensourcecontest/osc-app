import React, { Component } from 'react';
import AuthContext from '../components/context/auth-context';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/app';
import 'firebase/auth';
import { fetchNoAuth } from '../api-calls/Fetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faUser } from "@fortawesome/free-solid-svg-icons";

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
    isLogin: true,
    selectedOption: null
  }

  static contextType = AuthContext;

  uiConfig = {
    signInFlow: "popup",
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
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
   * Switch Firebase button text between 'Sign in' and 'Sign up' 
   */
  switchFirebaseButtonText = () => {
    const elements = document.getElementsByClassName("firebaseui-idp-text-long");
    for (const element of elements) {
      element.textContent.includes("Sign in")
        ? element.textContent = element.textContent.replace("Sign in", "Sign up")
        : element.textContent = element.textContent.replace("Sign up", "Sign in");
    }
  }

  /**
   * Switch between login and registration
   */
  switchModeHandler = () => {
    this.switchFirebaseButtonText();
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
          window.location.reload();
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

  /**
   * Sets state.selectedOption according to user choice
   */
  handleOptionChange = changeEvent => {
    this.setState({ selectedOption: changeEvent.target.value }, () => {
      this.context.setIsMentor(this.state.selectedOption === "mentor")
    });
  };

  /**
   * Returns welcome element if currentUser exists
   */
  welcomeElement = () => {
    const user = firebase.auth().currentUser;
    return user ? (
      <center>
        <div>Signed in!</div>
        <h1>
          Welcome {
            user.displayName
            || user.providerData[0].displayName
            || user.providerData[1].displayName
          }
        </h1>
        <p>{user.email}</p>
        <img
          src={user.photoURL}
          alt={user.displayName}
          height="100px"
        />
      </center>
    ) : <></>;
  }

  render() {
    if (this.state.isSignedIn && !firebase.auth().currentUser) {
      window.location.reload();
    }
    return (
      <React.Fragment>
        <div className="auth-form">
          {this.state.isSignedIn ? (
            <this.welcomeElement />
          ) : (
              <React.Fragment>
                {!this.context.token && (
                  <>
                    <center><h2>Choose your role</h2></center>
                    <form className="auth-box">
                      <label
                        className="labl"
                        title="You will choose a task, and mentor
                          responsible for this task will help you complete it."
                      >
                        <input
                          type="radio"
                          name="react-tips"
                          value="student"
                          checked={this.state.selectedOption === "student"}
                          onChange={this.handleOptionChange}
                          className="form-check-input"
                        />
                        <div>
                          Student
                          <FontAwesomeIcon icon={faUser} />
                        </div>
                      </label>

                      <label
                        className="labl"
                        title="You will create tasks and help students 
                          who will work on these tasks."
                      >
                        <input
                          type="radio"
                          name="react-tips"
                          value="mentor"
                          checked={this.state.selectedOption === "mentor"}
                          onChange={this.handleOptionChange}
                          className="form-check-input"
                        />
                        <div>
                          Mentor<br />
                          <FontAwesomeIcon icon={faUserTie} />
                        </div>
                      </label>
                    </form>
                  </>
                )}
                {this.state.selectedOption && (
                  <>
                    <StyledFirebaseAuth
                      uiConfig={this.uiConfig}
                      firebaseAuth={firebase.auth()}
                    />
                    <br />
                    <div className="form-actions">
                      <center>
                        <div className="auth-switcher">
                          {this.state.isLogin
                            ? "Don't have an account yet?"
                            : "Already have an accout?"
                          }&nbsp;
                          <b onClick={this.switchModeHandler}>
                            <u>{this.state.isLogin ? "Sign up" : "Sign in"}</u>
                          </b>
                        </div>
                      </center>
                    </div>
                  </>
                )}
              </React.Fragment>
            )}
        </div>
      </React.Fragment>
    );
  }
}

export default AuthPage;
