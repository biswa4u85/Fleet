import React, { Component } from "react";
import {
  StyleSheet,
  Platform,
  StatusBar,
  Text,
  View,
  RefreshControl,
  Dimensions,
  AsyncStorage,
  ImageBackground,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
import { Icon, Tab, Tabs, Content, Button } from "native-base";
import moment from "moment";
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel
} from "react-native-simple-radio-button";
import { ScrollView } from "react-native-gesture-handler";
import { URL } from "../constants/API";
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
var radio_props = [{ label: "", value: 0 }];
const theme_color = "#f58936";
export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: 0,
      token: "",
      vehicles_data: [],
      complete_data: [],
      positions: [],
      currentTab: 0,
      refreshing: false,
      isLoading: true
    };
  }

  componentWillMount() {
    AsyncStorage.getItem("userID").then(user_data => {
      const val = JSON.parse(user_data);

      this.setState({ userID: val.id, token: val.token });

      console.log("Token async");
      console.log(val.token);
      this.fetchSession(val.token);
    });
    //
  }
  fetchRefresh = async () => {
    AsyncStorage.getItem("userID").then(user_data => {
      const val = JSON.parse(user_data);
      this.setState({ userID: val.id, token: val.token });
      console.log("Token async");
      console.log(val.token);
      this.fetchSession(val.token);
    });
  };
  fetchSession = async token => {
    await fetch(
      "http://207.180.244.96:8082/api/session?token=" + this.state.token.toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        credentials: "include"
      }
    )
      .then(res => res.json())
      .then(async response => {
        console.log("Session Store");
        console.log(response);
        this.fetchVehicles();
      })
      .catch(error => {
        console.log(error);
        this.SessionExpired();
      });
  };
  fetchVehicles = async () => {
    console.log("User Id:");
    console.log(this.state.userID);
    await fetch(
      "http://207.180.244.96:8082/api/devices?userId=" + parseInt(this.state.userID),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      }
    )
      .then(res => res.json())
      .then(async response => {
        console.log("Vehicle Data");
        console.log(response);

        this.setState({ vehicles_data: response });
        this.fetchPositions();
      })
      .catch(error => {
        console.log(error);

        this.setState({ isLoading: false });
        this.SessionExpired();
      });
  };
  fetchPositions = async () => {
    // console.log("User Id:")
    // console.log(this.state.userID)
    await fetch("http://207.180.244.96:8082/api/positions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    })
      .then(res => res.json())
      .then(async response => {
        console.log("positions");
        this.setState({ positions: response });

        this.state.vehicles_data.forEach(element => {
          // console.log(element.id);
          var indexOfItem = this.state.positions.find(
            task => task.deviceId === element.id
          );
          var indexOfVehicleItem = this.state.vehicles_data.find(
            task => task.id === element.id
          );
          indexOfVehicleItem["position"] = indexOfItem;
          this.setState({
            complete_data: this.state.vehicles_data,
            isLoading: false
          });
          console.log(this.state.complete_data)
        });
      })
      .catch(error => {
        console.log(error);
        this.setState({ isLoading: false });
        this.SessionExpired();
      });
  };
  confirmLogout = async () => {
    await fetch(URL + "session", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .then(async response => {
        AsyncStorage.clear();
        this.props.navigation.push("LoginForm");
      })
      .catch(error => console.log(error));
  }
  logout = async () => {
    Alert.alert(
      'Note',
      'Are you sure you want to logout?',
      [
        {text: 'Yes', onPress: () => this.confirmLogout()},
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        }
        
      ],
      {cancelable: false},
    );

  };
  SessionExpired = async () => {
    await fetch(URL + "session", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
      .then(async response => {
        AsyncStorage.clear();
        this.props.navigation.push("LoginForm");
      })
      .catch(error => console.log(error));
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View
        style={{
          width: deviceWidth,
          height: deviceHeight,
          backgroundColor: "#fff"
        }}
      >
        <View
          style={{
            width: deviceWidth,
            height: Platform.OS == "ios" ? 25 : StatusBar.currentHeight,
            backgroundColor: "#424242"
          }}
        ></View>
        <View style={{ width: "100%", backgroundColor: "#424242" }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: "40%", paddingLeft: 20 }}>
              <Image
                style={{ width: "100%", height: 70, resizeMode: "contain" }}
                source={require("../assets/images/logo1.png")}
              />
            </View>
            <View style={{ marginLeft: "auto" }}>
              <View style={{ paddingHorizontal: 20, marginTop: 15 }}>
                <TouchableOpacity onPress={this.logout.bind(this)}>
                  <Image
                    style={{ width: 25, height: 25, resizeMode: "contain" }}
                    source={require("../assets/images/logout.png")}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <View style={{ width: "100%", height: "100%" }}>
          <Tabs
            tabBarUnderlineStyle={{
              borderBottomWidth: 2,
              backgroundColor: "#FFC000",
              borderColor: "#FFC000"
            }}
            initialPage={this.state.currentTab}
          >
            <Tab
              heading="Equipments"
              tabStyle={{ backgroundColor: "#424242" }}
              textStyle={{ color: "#fff", fontSize:18 }}
              activeTabStyle={{ backgroundColor: "#424242" }}
              activeTextStyle={{ color: "#FFC000", fontWeight: "normal" }}
            >
              <Content
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this.fetchRefresh}
                  />
                }
              >
                <View
                  style={{
                    width: deviceWidth,
                    alignContent: "center",
                    alignItems: "center",
                    paddingBottom: 100
                  }}
                >
                  {this.state.isLoading ? (
                    <View
                      style={{
                        width: deviceWidth,
                        height: deviceHeight - 100,
                        alignContent: "center",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <ActivityIndicator size={"large"} />
                    </View>
                  ) : this.state.complete_data.length == 0 ? (
                    <View
                      style={{
                        width: deviceWidth,
                        height: deviceHeight - deviceHeight - 3,
                        alignContent: "center",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "#808080"
                        }}
                      >
                        You have no Devices
                      </Text>
                    </View>
                  ) : (
                    this.state.complete_data.map((item, index) => {
                      return (
                        <View key={index} style={{ width: "90%" }}>
                          <View style={[styles.Bigbox, styles.shadow2]}>
                            <TouchableOpacity
                              style={{ width: "100%" }}
                              onPress={() =>
                                this.props.navigation.navigate(
                                  "VehicleDetails",
                                  {
                                    vehicle_data: item
                                  }
                                )
                              }
                            >
                              <View style={{ width: "100%", marginTop: 20 }}>
                                <View style={{ flexDirection: "row" }}>
                                  <View
                                    style={{ width: "60%", paddingLeft: 10 }}
                                  >
                                    <View>
                                      <Text
                                        style={{
                                          fontSize: 24,
                                          fontWeight: "500",
                                          color: "#000"
                                        }}
                                      >
                                        {item.name}
                                      </Text>
                                    </View>
                                    <View style={{ paddingLeft: 5 }}>
                                      <Text
                                        style={{ fontSize: 14, color: "#000" }}
                                      >
                                        Model :{" "}
                                        {item.model ? (
                                          <Text style={{ color: "#808080" }}>
                                            {item.model}
                                          </Text>
                                        ) : (
                                          <Text style={{ color: "#808080" }}>
                                            NILL
                                          </Text>
                                        )}
                                      </Text>
                                    </View>
                                    <View
                                      style={{ paddingLeft: 5, marginTop: 15 }}
                                    >
                                      <View style={{ flexDirection: "row" }}>
                                        {item.position ? (
                                          item.position.attributes.ignition ? (
                                            <View
                                              style={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: "red",
                                                marginTop: 5
                                              }}
                                            ></View>
                                          ) : (
                                            <View
                                              style={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: "#808080",
                                                marginTop: 5
                                              }}
                                            ></View>
                                          )
                                        ) : (
                                          <Text style={{ color: "#808080" }}>
                                            ---
                                          </Text>
                                        )}
                                        <Text
                                          style={{
                                            fontSize: 14,
                                            color: "#000",
                                            marginLeft: 10
                                          }}
                                        >
                                          Ignition :{" "}
                                          {item.position ? (
                                            item.position.attributes
                                              .ignition ? (
                                              <Text
                                                style={{ color: "#808080" }}
                                              >
                                                Yes
                                              </Text>
                                            ) : (
                                              <Text
                                                style={{ color: "#808080" }}
                                              >
                                                No
                                              </Text>
                                            )
                                          ) : (
                                            <Text style={{ color: "#808080" }}>
                                              ---
                                            </Text>
                                          )}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>
                                  <View
                                    style={{
                                      width: "40%",
                                      alignItems: "center",
                                      alignContent: "center"
                                    }}
                                  >
                                    <View
                                      style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 40
                                      }}
                                    >
                                      {item.category == "truck" ? (
                                        <Image
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            resizeMode: "contain"
                                          }}
                                          source={require("../assets/images/truck.png")}
                                        />
                                      ) : item.category == "crane" ? (
                                        <Image
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            resizeMode: "contain"
                                          }}
                                          source={require("../assets/images/crane.png")}
                                        />
                                      ) : (
                                        <Image
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            resizeMode: "contain"
                                          }}
                                          source={require("../assets/images/default.png")}
                                        />
                                      )}
                                    </View>
                                    <View>
                                      {item.position ? (
                                        item.position.attributes.hours ? (
                                          <View
                                            style={{ flexDirection: "row" }}
                                          >
                                            <Text
                                              style={{
                                                fontSize: 20,
                                                fontFamily: "space-mono"
                                              }}
                                            >
                                              {
                                                Math.trunc(moment.duration(item.position.attributes
                                                  .hours).asHours())
                                              }{" "}
                                              h
                                            </Text>
                                            <View style={{ paddingLeft: 5 }}>
                                              <Text
                                                style={{
                                                  fontSize: 20,
                                                  fontFamily: "space-mono"
                                                }}
                                              >
                                                {
                                                  moment.duration(item.position.attributes
                                                    .hours).minutes()
                                                }{" "}
                                                m
                                              </Text>
                                            </View>
                                          </View>
                                        ) : (
                                          <Text
                                            style={{
                                              fontSize: 20,
                                              fontFamily: "space-mono"
                                            }}
                                          >
                                            0 Hours
                                          </Text>
                                        )
                                      ) : (
                                        <Text
                                          style={{
                                            fontSize: 20,
                                            fontFamily: "space-mono"
                                          }}
                                        >
                                          0 Hours
                                        </Text>
                                      )}
                                    </View>
                                    <View>
                                      <Text
                                        style={{
                                          fontSize: 8,
                                          color: "#808080",
                                          fontFamily: "space-mono"
                                        }}
                                      >
                                        Last Reported{" "}
                                        {moment(item.lastUpdate).fromNow(true)}{" "}
                                        ago
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </Content>
            </Tab>
             </Tabs>
        </View>
        {/* ...........BODY................ */}
      </View>
    );
  }
}
function elevationShadowStyle(elevation) {
  return {
    elevation,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0.5 * elevation },
    shadowOpacity: 0.3,
    shadowRadius: 0.8 * elevation
  };
}
const styles = StyleSheet.create({
  shadow1: elevationShadowStyle(5),
  shadow2: elevationShadowStyle(10),
  shadow3: elevationShadowStyle(20),
  Bigbox: {
    width: "100%",
    // height:deviceHeight/4,
    borderRadius: 8,
    backgroundColor: "white",
    marginTop: 30,
    paddingBottom: 20,
    paddingRight: 3
  }
});
