//import React from 'react';
import React, { Component } from "react";
import {
  StyleSheet,
  StatusBar,
  Text,
  View,
  Dimensions,
  AsyncStorage,
  ImageBackground,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import Constants from "expo-constants";
import { URL } from "../constants/API";
import { TextField } from "react-native-material-textfield";
import { Container, Button, Content, CheckBox } from "native-base";

var deviceHeight = Dimensions.get("window").height;
var deviceWidth = Dimensions.get("window").width;

export default class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      username_err: "",
      password_err: "",
      remember: false,
      isLoading: false
    };
  }

  submit = () => {
    const { username, password } = this.state;
    if (username == "" && password == "") {
      this.setState({
        username_err: "username should not be empty",
        password_err: "Password should not be empty"
      });
    }

    if (username == "") {
      this.setState({ username_err: "Required" });
    } else {
      this.setState({
        username_err: ""
      });
    }
    if (password == "") {
      this.setState({ password_err: "Required" });
    } else {
      this.setState({
        password_err: ""
      });
    }
    if (username != "" && password != "") {
      this.login_form(username, password);
    }
  };
  login_form = (username, password) => {
    this.setState({ isLoading: true });
    var params = {
      email: this.state.username.toString(),
      password: this.state.password.toString()
    };
    var formBody = [];
    for (var property in params) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(params[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    console.log(encodedKey);
    fetch(URL + "session", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formBody
    })
      .then(res => res.json())
      .then(async response => {
        console.log(response);
        AsyncStorage.setItem("userID", JSON.stringify(response));
        AsyncStorage.setItem("remember", JSON.stringify(this.state.remember));
        this.setState({ isLoading: false });
        this.props.navigation.push("Main");
      })
      .catch(error => {
        Alert.alert(
          "Sorry",
          "Username or Password is incorrect.",
          [{ text: "OK" }],
          { cancelable: true }
        );
        this.setState({ isLoading: false });
      });
  };
  checkedRemember = () => {
    if (this.state.remember) {
      this.setState({ remember: false });
    } else {
      this.setState({ remember: true });
    }
  };
  render() {
    const { navigation } = this.props.navigation;
    const { username, password } = this.state;
    const fontColor = "#fff";
    return (
      <Container style={{ backgroundColor: "#424242" }}>
        <View
          style={{
            width: "100%",
            height: deviceHeight / 3,
            alignContent: "center",
            alignItems: "center",
            paddingTop: 80
          }}
        >
          <View style={{ width: "50%" }}>
            <Image
              style={{
                width: "100%",
                height: deviceHeight / 3,
                resizeMode: "contain"
              }}
              source={require("../assets/images/logo1.png")}
            />
          </View>
        </View>

        <Content>
          <ScrollView style={{ paddingBottom: deviceHeight / 2 }}>
            <View
              style={{
                width: "100%",
                alignItems: "center",
                alignContent: "center"
              }}
            >
              <View style={{ width: "90%" }}>
                <View style={{ flexDirection: "row", paddingTop: 50 }}>
                  <View style={{ width: "20%", paddingTop: 30 }}>
                    <Image
                      style={{
                        width: "100%",
                        height: 30,
                        resizeMode: "contain"
                      }}
                      source={require("../assets/images/message.png")}
                    />
                  </View>
                  <View style={{ width: "75%" }}>
                    <TextField
                      labelPadding={1}
                      keyboardType={"default"}
                      autoCorrect={false}
                      returnKeyType={"done"}
                      blurOnSubmit={true}
                      label="Username"
                      tintColor={"#fff"}
                      textColor={"#eaeaea"}
                      baseColor="#fff"
                      error={this.state.username_err}
                      onChangeText={username => this.setState({ username })}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: "row" }}>
                  <View style={{ width: "20%", paddingTop: 30 }}>
                    <Image
                      style={{
                        width: "100%",
                        height: 30,
                        resizeMode: "contain"
                      }}
                      source={require("../assets/images/password.png")}
                    />
                  </View>
                  <View style={{ width: "75%" }}>
                    <TextField
                      secureTextEntry={true}
                      // labelPadding={1}
                      autoCorrect={false}
                      returnKeyType={"done"}
                      blurOnSubmit={true}
                      label="Password"
                      tintColor={"#fff"}
                      baseColor="#fff"
                      error={this.state.password_err}
                      onChangeText={password => this.setState({ password })}
                    />
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    paddingHorizontal: "20%",
                    marginTop: 20
                  }}
                >
                  <View style={{ paddingVertical: 3 }}>
                    <Text style={{ fontSize: 14, color: "#fff" }}>
                      Remember me
                    </Text>
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <CheckBox
                      color={"#FFC000"}
                      checked={this.state.remember}
                      onPress={this.checkedRemember}
                    />
                  </View>
                </View>
              </View>
              <View style={{ width: "80%", marginTop: 30 }}>
                {this.state.isLoading ? (
                  <Button
                    bordered
                    style={{
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      borderColor: "#FFC000",
                      borderRadius: 5,
                      backgroundColor: "#FFC000",
                      height: 50
                    }}
                  >
                    <ActivityIndicator size={"small"} />
                  </Button>
                ) : (
                  <Button
                    bordered
                    onPress={this.submit}
                    style={{
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      borderColor: "#FFC000",
                      borderRadius: 5,
                      backgroundColor: "#FFC000",
                      height: 50
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#fff",
                        fontSize: 22,
                        fontWeight: "bold"
                      }}
                    >
                      Login
                    </Text>
                  </Button>
                )}
              </View>
            </View>
          </ScrollView>
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  statusBar: {
    backgroundColor: "#565656",
    width: "100%",
    height: Constants.statusBarHeight
  }
});
