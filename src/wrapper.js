import React, { Component, PropTypes } from 'react';

export default class Wrapper extends Component {
  render() {
    return (
      <div>
        { this.props.children }
      </div>
    );
  }
}