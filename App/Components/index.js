import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import SearchNavigator from './SearchNavigator';
// import OnboardingNavigator from './navigationOnboarding'
// import MainNavigator from './navigationMain'
// import SigningUpNavigator from './navigationSigning'

class Navigator extends React.Component {
  render() {
    console.log('GIVE ME THE PROPS', this.props);
    return (
      <SearchNavigator />
    );
  }
}

const mapStateToProps = state => (state);

export default connect(mapStateToProps, {})(Navigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
