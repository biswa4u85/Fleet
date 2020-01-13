import React, { Component } from "react";
import {
  StyleSheet,
  Platform,
  StatusBar,
  Text,
  View,
  Dimensions,
  AsyncStorage,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
import { Content } from "native-base";
import moment from "moment";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

const theme_color = "#f58936";
export default class Maintenance extends Component {
  constructor(props) {
    super(props);
    this.data = this.props.navigation.state.params;
    this.state = {
      userID: 0,
      token: "",
      vehicle_data: this.data.vehicle_data,
      events_data: [],
      maintenance_data: [],
      graph_data: [],
      bar_data: [],
      refreshing: false,
      date_required: "",
      loading: true,
      currentHour: 1
    };
  
  }
  componentDidMount() {
    AsyncStorage.getItem("userID").then(user_data => {
      const val = JSON.parse(user_data);
      this.setState({ userID: val.id, token: val.token });
      this.fetchSession(val.token);
    });
    //
  }
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
       
        this.fetchEventsDetail();
        
        
    
      })
      .catch(error => {
        console.log(error);
        this.SessionExpired();
      });
  };

 
  fetchEventsDetail = async () => {
   

    await fetch(
      "http://207.180.244.96:8082/api/maintenance?deviceId=" + this.data.vehicle_data.position.deviceId,
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
      
        this.setState({ maintenance_data: response });
        console.log("maintenance Data");
        console.log(this.state.maintenance_data);
        if(this.state.maintenance_data.length != 0){
          this.fetchEventsLogs();
        }else{
          this.setState({loading:false})
        }
      })
      .catch(error => {
        console.log(error);
        this.SessionExpired();
      });
  };
  fetchEventsLogs = async () => {
let current_time = moment().toISOString();
console.log("---------current time-------------");
console.log(current_time);
console.log(moment(current_time).subtract(30,"days")) 
   await fetch("http://207.180.244.96:8082/api/reports/events?deviceId="+this.state.vehicle_data.position.deviceId+"&type=maintenance&from="+moment(current_time).subtract(30,"days").toISOString()+"&to="+current_time, {
      method: "GET",
      headers:{
        "Content-Type" : "application/json",
      },
      credentials:"include",
    })
      .then(res => res.json())
      .then(async response => {
        
        this.setState({events_data: response})

        this.state.events_data.forEach(currentItem => {
          const result = this.state.events_data.findIndex(task => task === currentItem.maintenanceId);
          var indexOfItem = this.state.maintenance_data.find(
            task => task.id === currentItem.maintenanceId
          );
          currentItem["maintenance"] = indexOfItem;
          this.setState({events_data : this.state.events_data})
        })

        if(this.state.events_data.length != 0){

          this.setState({loading:false})
        }
        console.log(this.state.events_data)
      
      })
      .catch(error => {
       console.log(error)
        this.SessionExpired();
      });
  
  }

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
        <View
          style={{
            width: "100%",
            backgroundColor: "#424242",
            paddingBottom: 10
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: "20%", paddingLeft: 20, paddingTop: 20 }}>
              <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                <Image
                  style={{ width: 30, height: 30, resizeMode: "contain" }}
                  source={require("../assets/images/back.png")}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                width: "60%",
                alignContent: "center",
                alignItems: "center",
                paddingTop: 15
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "400",
                  color: "#fff",
                  fontFamily: "space-mono"
                }}
              >
                {this.state.vehicle_data.name}
              </Text>
              {this.state.vehicle_data.model ? (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "400",
                    color: "#fff",
                    fontFamily: "space-mono"
                  }}
                >
                  {this.state.vehicle_data.model}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
        <View
              style={{
                width: "100%",
                alignItems: "center",
                alignContent: "center",
                backgroundColor:"#eaeaea"
              }}
            >
              <View style={{ width: "90%",paddingVertical:15 }}>
                <View style={{ flexDirection: "row", paddingVertical: 5 }}>
                  <View style={{ width: "20%" }}>
                  <Image
                  style={{ width: 30, height: 30, resizeMode: "contain" }}
                  source={require("../assets/images/main_maintaince.png")}
                />
                    </View>
                    <View style={{ width: "80%" }}>
                    <Text style={{fontSize:22}}>Maintenance</Text>
                    </View>
                  </View>
                  </View>
                  </View>
        <Content>
          <View style={{ paddingBottom: 100 }}>
        
            <View
              style={{
                width: "100%",
                alignItems: "center",
                alignContent: "center"
              }}
            >
                {this.state.loading ? (
            <View style={{width:"100%", alignContent:"center", alignItems:"center"}}>
  <View style={{paddingVertical:10}}>
    <Text style={{fontSize:22, fontFamily:"space-mono", color:"#808080"}}>Fetching Events...</Text>
  </View>
    <ActivityIndicator size={"large"}/>
  </View>
          ): this.state.events_data.map((item,index)=>{
            return(

              <View key={index} style={{ width: "90%", borderBottomWidth:1, borderBottomColor:"#808080", paddingVertical:10 }}>
                <View style={{ flexDirection: "row", paddingVertical: 5 }}>
                  <View style={{ width: "100%" }}>
                  <Text style={{fontSize:22, fontWeight:"bold"}}>{item.maintenance.name}</Text>
                  <Text style={{fontSize:12, color:"#808080", marginTop:3}}>{ moment(item.serverTime).format("YYYY-MM-DD HH:mm:ss") }</Text>
                    </View>
                   
                  </View>
              </View>
            )
          })
          }
            </View>
           
          </View>
        </Content>

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
    width: "90%",
    paddingVertical: 10,
    alignItems: "center",
    alignContent: "center",
    borderRadius: 8,
    backgroundColor: "white",
    marginTop: 30
  }
});
