import React, { Component } from 'react';
import AuthContext from '../../context/auth-context';
import { fetchAuth } from '../../../api-calls/Fetch';

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

    fetchAuth(token, requestBody)
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
                <input
                  name="isVerified"
                  type="checkbox"
                  checked={this.state.isVerified}
                  onChange={this.handleVerifiedChange} />
                <label>Verified</label>
              </div>
              <div className="flex-col">
                <input
                  name="isAdmin"
                  type="checkbox"
                  checked={this.state.isAdmin}
                  onChange={this.handleAdminChange} />
                <label>Admin rights</label>
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
