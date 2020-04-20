import React, { Component } from 'react';
import { Growl } from 'primereact/growl';
import 'primeicons/primeicons.css';
import './Notification.css';

/**
 * Notification component (success, warn, info, error)
 */
class Notification extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * Show success notification
   * @param {string} msg 
   */
  showSuccess(msg) {
    this.growl.show({
      severity: 'success',
      summary: 'Success Message',
      detail: msg
    });
  };

  /**
   * Show warning notification
   * @param {string} msg
   */
  showWarning = (msg) => {
    this.growl.show({
      severity: 'warn',
      summary: 'Warning',
      detail: msg
    });
  };

  /**
   * Show error notification
   * @param {string} msg
   */
  showError = (msg) => {
    this.growl.show({
      severity: 'error',
      summary: 'Error',
      detail: msg
    });
  };

  /**
  * Show info notification
  * @param {string} msg
  */
  showInfo = (msg) => {
    this.growl.show({
      severity: 'info',
      summary: 'Info',
      detail: msg
    });
  };

  componentDidMount() {
    switch (this.props.type) {
      case 'success':
        this.showSuccess(this.props.msg);
        break;
      case 'info':
        this.showInfo(this.props.msg);
        break;
      case 'warn':
        this.showWarning(this.props.msg);
        break;
      case 'error':
        this.showError(this.props.msg);
        break;
      default:
    }
  };

  render() {
    return (
      <React.Fragment>
        <Growl ref={(el) => this.growl = el} />
      </React.Fragment>
    );
  };
};

export default Notification;
