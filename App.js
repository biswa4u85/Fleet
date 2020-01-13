import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { Component } from 'react';
import { Platform, StatusBar, StyleSheet, View, AsyncStorage, AppRegistry } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppNavigator from './navigation/AppNavigator';
import LoginAppNavigator from './navigation/LoginAppNavigator';


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading : true,
      loggedIn : false,
    }
    this.state = { loading: true };
  }
  async componentWillMount() {
    
    
    AsyncStorage.getItem("userID").then(user_data => {
      const val = JSON.parse(user_data);
      console.log(val)
      if(val){
        // this.setState({
        //   loggedIn: true,
        // });
      }
    });
    await Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
        require('./assets/images/logo1.png'),
        require('./assets/images/message.png'),
        require('./assets/images/password.png'),
        require('./assets/images/truck.png'),
        require('./assets/images/crane.png'),
        require('./assets/images/default.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free to
        // remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
    setTimeout(() => {
      AsyncStorage.getItem("remember").then(remember_data => {
        const isTrue = JSON.parse(remember_data);
        console.log(isTrue)
        if(isTrue){
  
          this.setState({
            loggedIn: true,
          });
        

        }
        this.setState({ loading: false });
      });
    }, 5000)
  }

  render() {
    if (this.state.loading) {
      return (
        // <Root>
          <AppLoading />
        // {/* </Root> */}
      );
    }
    if(this.state.loggedIn){
     
      console.log("first")
      console.log(this.state.remember)
        return (
          <LoginAppNavigator />
        );
    }
    else{
      console.log("2nd")
      console.log(this.state.remember)
      console.log(this.state.loggedIn)
      return (
        <AppNavigator />
      );
    }
 
    
  }
}
AppRegistry.registerComponent('Fleet', () => App);


function handleLoadingError(error) {
  // In this case, you might want to report the error to your error reporting
  // service, for example Sentry
  console.warn(error);
}

function handleFinishLoading(setLoadingComplete) {
  setLoadingComplete(true);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
