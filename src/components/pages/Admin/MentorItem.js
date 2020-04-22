import React, { Component } from 'react';
import AuthContext from '../../context/auth-context';

import './MentorItem.css';

/**
 * Mentor component for rights editation
 */
class MentorItem extends Component {
  static contextType = AuthContext;

  state = {
    isVerified: this.props.mentor.isVerified,
    isAdmin: this.props.mentor.isAdmin
  };

  /**
   * Saves changes of Mentor's rights
   */
  handleSubmit = () => {
    const requestBody = {
      query: `
        mutation {
          changeMentorRights(
            mentorId: "${this.props.mentor._id}"
            isVerified: ${this.state.isVerified},
            isAdmin: ${this.state.isAdmin}
          ) { isVerified isAdmin }
        }
      `
    };

    const token = this.context.token;

    fetch('http://localhost:5000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed');
        }
        return res.json();
      })
      .then(resData => {
        alert('Successfully updated.');
      })
      .catch(err => {
        alert('Failed.')
        console.log(err);
      });
  }

  /**
   * Change value of state.isVerified
   */
  handleVerifiedChange = () => {
    this.setState(prevState => {
      return { isVerified: !prevState.isVerified };
    });
  }

  /**
   * Change value of state.isAdmin
   */
  handleAdminChange = () => {
    this.setState(prevState => {
      return { isAdmin: !prevState.isAdmin };
    });
  }

  render() {
    return (
      <li className="task__list-item" key={this.props.mentor._id}>
        <div className="flex-row">
          <div>
            <div>
              <div className="header">
                <b>{this.props.mentor.email}</b>
              </div>
              <div className="flex-col">
                <label>Verified:</label>
                <input
                  name="isVerified"
                  type="checkbox"
                  checked={this.state.isVerified}
                  onChange={this.handleVerifiedChange} />
              </div>
              <div className="flex-col">
                <label>Admin rights:</label>
                <input
                  name="isAdmin"
                  type="checkbox"
                  checked={this.state.isAdmin}
                  onChange={this.handleAdminChange} />
              </div>
            </div>
          </div>
          <div>
            <button
              className="btn"
              onClick={this.handleSubmit.bind(this)}
            >Save</button>
          </div>
        </div>
      </li>
    );
  }
}

export default MentorItem;
