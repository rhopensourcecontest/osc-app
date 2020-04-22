import React, { Component } from 'react';
import AuthContext from '../../context/auth-context';
import MentorItem from './MentorItem';
import { fetchMentors } from '../../api-calls/Mentors';

import './Admin.css';

/**
 * Administration page accessible only by Admin
 */
class AdminPage extends Component {
  static contextType = AuthContext;

  state = {
    mentors: []
  };

  componentDidMount = () => {
    fetchMentors()
      .then(resData => {
        const mentors = resData.data.mentors;
        this.setState({ mentors: mentors });
      })
      .catch(err => {
        alert('Failed to fetch mentors.');
        console.log(err);
      });
  }

  render() {
    return (
      <React.Fragment>
        <div className="">
          <h1>Administration Page</h1>
          <p>Here you can add / remove Mentor rights.</p>
          <ul className="task__list">
            {this.state.mentors.map(mentor => {
              return (
                <MentorItem
                  key={mentor._id}
                  mentor={mentor}
                />
              )
            })}
          </ul>
        </div>
      </React.Fragment>
    );
  }
};

export default AdminPage;
