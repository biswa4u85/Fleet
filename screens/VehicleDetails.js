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
import { Icon, Tab, Tabs, Content, Button, Container } from "native-base";
import CalendarStrip from 'react-native-calendar-strip';
import moment from "moment";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import DatePicker from "react-native-datepicker";
import { ScrollView } from "react-native-gesture-handler";
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

const theme_color = "#f58936";
export default class VehicleDetails extends Component {
  constructor(props) {
    super(props);
    this.data = this.props.navigation.state.params;
    this.state = {
      userID: 0,
      token: "",
      vehicle_data: this.data.vehicle_data,
      history_data: [],
      maintenance_data: [],
      events_data: [],
      graph_data: [],
      bar_data: [],
      refreshing: false,
      date_required: "",
      loading: false,
      events_loading: true,
      loadingGraph: false,
      fetchingData: false,
      currentHour: 1,
      currentTab: 0,
    };
    // console.log("Detail Page")
    // console.log(this.state.vehicle_data)
    // console.log(this.state.vehicle_data.position.latitude)
    // console.log(this.state.vehicle_data.position.longitude)
  }
  componentWillMount() {
    AsyncStorage.getItem("userID").then(user_data => {
      const val = JSON.parse(user_data);

      this.setState({ userID: val.id, token: val.token });

      this.fetchEventsSession(val.token);
      
    });
    //
  }
  fetchEventsSession = async token => {
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
        this.fetchHistory("");
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
          this.setState({events_loading:false})
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
    console.log(this.data.vehicle_data.position.deviceId) 
       await fetch("http://207.180.244.96:8082/api/reports/events?deviceId="+this.data.vehicle_data.position.deviceId+"&type=maintenance&from="+moment(current_time).subtract(30,"days").toISOString()+"&to="+current_time, {
          method: "GET",
          headers:{
            "Content-Type" : "application/json",
          },
          credentials:"include",
        })
          .then(res => res.json())
          .then(async response => {
            // console.log("Events Response")
            // console.log(response)
            this.setState({events_data: response})
    
            let events_arr = [];
            events_arr.push(response);
            this.state.events_data.forEach(currentItem => {
              // console.log("currentItem.maintenanceId")
              // console.log(currentItem.maintenanceId)
              const result = this.state.events_data.findIndex(task => task === currentItem.maintenanceId);
              var indexOfItem = this.state.maintenance_data.find(
                task => task.id === currentItem.maintenanceId
              );
              
              currentItem["maintenance"] = indexOfItem;
              this.setState({events_data : this.state.events_data})
            })
    
            if(this.state.events_data.length != 0){
    console.log("Empty")
              this.setState({events_loading:false, events_data: this.state.events_data})
            }
            // console.log(this.state.events_data)
          
          })
          .catch(error => {
           console.log(error)
            this.SessionExpired();
          });
      
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
    this.setState({ loading: true });
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
        //  console.log("Session Store");
        //  console.log(response);
        this.fetchHistory();
      })
      .catch(error => {
        console.log(error);
        this.SessionExpired();
      });
  };
  fetchHistory = async (required_date) => {
let to_date = "";
    if(!required_date){
      required_date = moment().hours(0).minutes(0).seconds(0).toISOString();
      to_date = moment().add(1,"days").hours(0).minutes(0).seconds(0).toISOString();
    }
    else{
      required_date = moment(required_date).hours(0).minutes(0).seconds(0).milliseconds(0).toISOString();
      // required_date = moment(required_date).hours(0).minutes(0).seconds(0).toISOString();
      to_date = moment(required_date).hours(0).minutes(0).seconds(0).add(1,"days").milliseconds(0).toISOString();
    }
    console.log("Date From");
    console.log(required_date);
    console.log("Date To");
      console.log(to_date);
      console.log("Date new");
      console.log(moment().toISOString());
      console.log("Date new 2");
      console.log(moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"));
    //console.log("Date Now");
    //   console.log(moment().toISOString());
    //   console.log("Date From");
    //   console.log(moment().subtract(1,"days").toISOString());
console.log("required_date : " + required_date)
console.log("Date To : " + required_date)
    await fetch(
      "http://207.180.244.96:8082/api/reports/summary?deviceId=" +
        this.state.vehicle_data.position.deviceId +
        "&from=" +
        required_date +
        "&to=" +
        to_date,
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
        // console.log("History Data");
        // console.log(this.state.history_data);
        this.setState({ history_data: response, loading: false });
        // console.log("History Data");
        // console.log(this.state.history_data);
        this.fetchGraph(required_date,to_date);
      })
      .catch(error => {
        console.log(error);
        this.setState({ isLoading: false });
        this.SessionExpired();
      });
  };
  fetchGraph = async (required_date,to_date) => {
this.setState({loadingGraph:true,fetchingData:true})
    console.log("From:")
    console.log(required_date)
    console.log("To:")
    console.log(to_date)  
   let current_time = moment(this.state.date_required).toISOString();
  //  console.log("hh Format current Time");
  //  console.log(moment(current_time).format("HH.mm"));
  //  console.log("Device ID from :") 
  //  console.log(this.state.vehicle_data.position.deviceId) 
   
   await fetch("http://207.180.244.96:8082/api/reports/route?deviceId="+
   this.state.vehicle_data.position.deviceId+
   "&from="+required_date+
   "&to="+to_date, {
      method: "GET",
      headers:{
        "Content-Type" : "application/json",
      },
      credentials:"include",
    })
      .then(res => res.json())
      .then(async response => {
        
        this.setState({graph_data: response, loading:false,loadingGraph:false,fetchingData:false})
        console.log("Graph Data");
        
        // console.log(this.state.graph_data);
      //   let xaxis_data = [];
      //   let bar_data = [];
      // // let i =  moment(this.state.graph_data[0].serverTime).format("HH.mm");
      // // xaxis_data.push(i);
      // let obj = {};
      //   this.state.graph_data.forEach(element => {
      //     console.log("New Line")
      //     console.log(moment(element.serverTime).format("HH.m"))
      //     let hour = moment(element.serverTime).format("HH.m");
      //     const result = bar_data.findIndex(task => task.x === hour);
          
      //     if(element.type == "ignitionOn"){
      //       obj = {x:hour,y:1};
      //       bar_data.push(obj);
      //     } 
      //     else{
      //       obj = {x:hour,y:0};
      //       bar_data.push(obj);
      //     }
          
      //     // console.log("find")
      //     // console.log(result)
          
         
      //   });
      // console.log(bar_data)
      // this.setState({bar_data: bar_data})
      })
      .catch(error => {
       console.log(error)
        this.setState({isLoading:false})
        this.SessionExpired();
      });
  
  }
  submit = async () => {
    if (this.state.date_required == "") {
      Alert.alert("Sorry", "Date can't be empty. Thanks", [{ text: "OK" }], {
        cancelable: true
      });
    } else {
      this.fetchSession(this.state.token);
    }
  };
  render() {
    const { navigate } = this.props.navigation;
    let sampleData = this.state.bar_data;
    let maxDate = moment().toISOString();
    let countTrue1 = 0;
    let countFalse1 = 0;   
    
    let countTrue2 = 0;
    let countFalse2 = 0; 
    let countTrue3 = 0;
    let countFalse3 = 0; 
    let countTrue4 = 0;
    let countFalse4 = 0; 
    let countTrue5 = 0;
    let countFalse5 = 0; 
    let countTrue6 = 0;
    let countFalse6 = 0; 
    let countTrue7 = 0;
    let countFalse7 = 0; 
    let countTrue8 = 0;
    let countFalse8 = 0; 
    let countTrue9 = 0;
    let countFalse9 = 0; 
    let countTrue10 = 0;
    let countFalse10 = 0; 
    let countTrue11 = 0;
    let countFalse11 = 0; 
    let countTrue12 = 0;
    let countFalse12 = 0;
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
            {/* <View style={{ width: "20%", paddingLeft: 20, paddingTop: 20 }}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Maintenance",{
                vehicle_data : this.state.vehicle_data
              })}>
                <Image
                  style={{ width: 30, height: 30, resizeMode: "contain" }}
                  source={require("../assets/images/maintenance.png")}
                />
              </TouchableOpacity>
            </View> */}
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
              heading="Location"
              tabStyle={{ backgroundColor: "#424242" }}
              textStyle={{ color: "#fff", fontSize: 14 }}
              activeTabStyle={{ backgroundColor: "#424242" }}
              activeTextStyle={{ color: "#FFC000", fontWeight: "normal", fontSize: 16 }}
            >
             <View
          style={{
            width: "100%",
            height: "100%",
            // borderBottomColor: "#808080",
            // borderBottomWidth: 2
          }}
        >
          <MapView
            provider={PROVIDER_GOOGLE}
            ref={map => {
              this.map = map;
            }}
            mapType={"satellite"}
            style={{ height: "100%" }}
            showsUserLocation={false}
            showsCompass={true}
            
            initialRegion={
              this.state.vehicle_data
                ? {
                    latitude: parseFloat(
                      this.state.vehicle_data.position.latitude
                    ),
                    longitude: parseFloat(
                      this.state.vehicle_data.position.longitude
                    ),
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.002
                  }
                : null
            }
          >
            {this.state.vehicle_data.position.latitude &&
            this.state.vehicle_data.position.longitude ? (
              <Marker
                coordinate={{
                  latitude: parseFloat(
                    this.state.vehicle_data.position.latitude
                  ),
                  longitude: parseFloat(
                    this.state.vehicle_data.position.longitude
                  )
                }}
              >
                <Icon style={{ color: "#FFC000" }} name="pin" />
              </Marker>
            ) : null}
          </MapView>
        </View>
       
            </Tab>
            <Tab
              heading="Utilization"
              tabStyle={{ backgroundColor: "#424242" }}
              textStyle={{ color: "#fff", fontSize:14 }}
              activeTabStyle={{ backgroundColor: "#424242" }}
              activeTextStyle={{ color: "#FFC000", fontWeight: "normal", fontSize: 16 }}
            >
<Content>
          <View style={{ paddingBottom: 100 }}>
            <View
              style={{
                width: "100%",
                alignItems: "center",
                alignContent: "center"
              }}
            >
            <View style={{width:"100%"}}>
            <CalendarStrip
      calendarAnimation={{type: 'sequence', duration: 30}}
                    daySelectionAnimation={{type: 'border', duration: 200, borderWidth: 1, borderHighlightColor: 'white'}}
                    style={{height: 100, paddingTop: 20, paddingBottom: 10}}
                    calendarHeaderStyle={{color: 'white'}}
                    calendarColor={'#FFC000'}
                    dateNumberStyle={{color: 'white'}}
                    dateNameStyle={{color: 'white'}}
                    highlightDateNumberStyle={{color: '#000'}}
                    highlightDateNameStyle={{color: '#000'}}
                    disabledDateNameStyle={{color: 'grey'}}
                    disabledDateNumberStyle={{color: 'grey'}}
                    onDateSelected = {Date => {this.fetchHistory(Date)}}
                    maxDate = {maxDate}
                    iconContainer={{flex: 0.1}}
    />
            </View>
              <View style={{ width: "90%" }}>
                <View style={{ flexDirection: "row", paddingVertical: 5 }}>
                  <View style={{ width: "60%" }}>
                    <View style={{ width: 50, height: 50, borderRadius: 40 }}>
                      {this.state.vehicle_data.category ? (
                        this.state.vehicle_data.category == "truck" ? (
                          <Image
                            style={{
                              width: "100%",
                              height: "100%",
                              resizeMode: "contain"
                            }}
                            source={require("../assets/images/truck.png")}
                          />
                        ) : (
                          <Image
                            style={{
                              width: "100%",
                              height: "100%",
                              resizeMode: "contain"
                            }}
                            source={require("../assets/images/crane.png")}
                          />
                        )
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
                  </View>
                  <View
                    style={{
                      width: "40%",
                      alignContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <View>
                      {this.state.vehicle_data.position ? (
                        this.state.vehicle_data.position.attributes.hours ? (
                          <View style={{ flexDirection: "row" }}>
                            <Text
                              style={{ fontSize: 20, fontFamily: "space-mono" }}
                            >
                              {
                                Math.trunc(moment.duration(this.state.vehicle_data.position.attributes
                                  .hours).asHours())}{" "}
                              h{" "}
                            </Text>
                            <Text
                              style={{ fontSize: 20, fontFamily: "space-mono" }}
                            >
                              {
                                moment.duration(this.state.vehicle_data.position.attributes
                                  .hours).minutes()
                              }{" "}
                              m
                            </Text>
                          </View>
                        ) : (
                          <Text
                            style={{ fontSize: 26, fontFamily: "space-mono" }}
                          >
                            0 Hours
                          </Text>
                        )
                      ) : (
                        <Text
                          style={{ fontSize: 26, fontFamily: "space-mono" }}
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
                        {moment(this.state.vehicle_data.lastUpdate).fromNow(
                          true
                        )}{" "}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View
              style={{
                width: deviceWidth,
                borderColor: "#C9C9C9",
                borderBottomWidth: 0.7,
                marginTop: 10
              }}
            ></View>

            <View
              style={{
                width: "100%",
                alignContent: "center",
                alignItems: "center"
              }}
            >
              <View style={{ width: "60%", marginTop: 20 }}>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: "bold"
                  }}
                >
                  Utilization History
                </Text>
              </View>
             
            </View>
            {this.state.history_data.length != 0 ? (
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  alignContent: "center"
                }}
              >
                <View style={{ width: "90%" }}>
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={{
                        width: "50%",
                        alignContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <View style={[styles.Bigbox, styles.shadow2]}>
                        <Text
                          style={{ fontSize: 16, fontWeight:"bold" }}
                        >
                          Engine Hours
                        </Text>
                        <View style={{ marginTop: 20 }}>
                          <Text
                            style={{
                              textAlign: "right",
                              fontSize: 16,
                              color: "#808080",
                              fontFamily: "space-mono"
                            }}
                          >
                           {
                                Math.trunc(moment.duration(this.state.history_data[0].engineHours ).asHours())}{" "}
                            h{" "}
                            {
                              moment.duration(this.state.history_data[0].engineHours).minutes()
                                 }{" "}
                            m
                          </Text>
                          {/* <Text style={{textAlign:"right", fontSize:12, color:"#808080", fontFamily:"space-mono"}}></Text> */}
                        </View>
                      </View>
                    </View>
                    <View
                      style={{
                        width: "50%",
                        alignContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <View style={[styles.Bigbox, styles.shadow2]}>
                        <Text
                          style={{ fontSize: 16, fontWeight:"bold" }}
                        >
                          Distance
                        </Text>
                        <View style={{ marginTop: 20 }}>
                          <Text
                            style={{
                              textAlign: "right",
                              fontSize: 16,
                              color: "#808080",
                              fontFamily: "space-mono"
                            }}
                          >
                            {parseInt(
                              this.state.history_data[0].distance / 1000
                            )}
                            {" "}
                            Km
                             
                          </Text>
                          {/* <Text style={{textAlign:"right", fontSize:12, color:"#808080", fontFamily:"space-mono"}}></Text> */}
                        </View>
                      </View>
                    </View>
                  </View>
                  {/* ................FUEL................. */}
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={{
                        width: "100%",
                        alignContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <View style={[styles.Bigbox, styles.shadow2]}>
                        <Text
                          style={{ fontSize: 16, fontWeight:"bold" }}
                        >
                          Spent Fuel
                        </Text>
                        <View style={{ marginTop: 20 }}>
                          <Text
                            style={{
                              textAlign: "right",
                              fontSize: 16,
                              color: "#808080",
                              fontFamily: "space-mono"
                            }}
                          >
                         {this.state.history_data[0].spentFuel}
                         l
                          </Text>
                          {/* <Text style={{textAlign:"right", fontSize:12, color:"#808080", fontFamily:"space-mono"}}></Text> */}
                        </View>
                      </View>
                    </View>
                     </View>
                </View>
              </View>
            ) : null}
            
            {this.state.graph_data.length != 0 && !this.state.fetchingData ? (
              

<View style={{marginTop:10, paddingTop:20}}>
<View style={{width:"100%", height:100, backgroundColor:"#eaeaea", borderBottomColor:"#808080", borderBottomWidth:0.5}}>
<View style={{flexDirection:"row", marginTop:"auto"}}>
<View style={{flexDirection:"row",  width:"8.3%", overflow:"hidden"}}>

{ this.state.graph_data.map((item,index)=>{
  let a = moment(item.serverTime).format("HH");
  {/* console.log("Hour : ")
  console.log(a) */}
  if (a == "00" || a == "01"){

    if(item.attributes.ignition == true){
    
    if(countTrue1 <= 5){
      countTrue1 = countTrue1 + 1;
      return(

<View key={index} style={{height:80, borderRightColor:"blue", borderRightWidth:1}}></View>
     )
    }
    else{
      return;
    }
    
     

    }
     else{
      if(countFalse1 <= 5){
        countFalse1 = countFalse1 + 1;
        countTrue1 = 0;
      return(

<View key={index} style={{height:80, borderRightColor:"#eaeaea", borderRightWidth:1}}></View>
     )
      }else{
        return;
      }
     }
  }
  else{
    return;
  }
    
})}
  
</View>

<View style={{flexDirection:"row",  width:"8.3%", overflow:"hidden"  }}>
{this.state.graph_data.map((item,index)=>{
  let a = moment(item.serverTime).format("HH");
  {/* console.log("Hour : ")
  console.log(a) */}
  if (a == "02" || a == "03"){

    if(item.attributes.ignition == true){
    
    if(countTrue2 <= 5){
      countTrue2 = countTrue2 + 1;
      return(

<View key={index} style={{height:80, borderRightColor:"blue", borderRightWidth:1}}></View>
     )
    }
    else{
      return;
    }
    
     

    }
     else{
      if(countFalse2 <= 5){
        countFalse2 = countFalse2 + 1;
        countTrue2 = 0;
      return(

<View key={index} style={{height:80, borderRightColor:"#eaeaea", borderRightWidth:1}}></View>
     )
      }else{
        return;
      }
     }
  }
  else{
    return;
  }
    
})}

</View>
<View style={{flexDirection:"row",  width:"8.3%", overflow:"hidden"  }}>
{this.state.graph_data.map((item,index)=>{
  let a = moment(item.serverTime).format("HH");
  {/* console.log("Hour : ")
  console.log(a) */}
  if (a == "04" || a == "05"){

    if(item.attributes.ignition == true){
    
    if(countTrue3 <= 5){
      countTrue3 = countTrue3 + 1;
      return(

<View key={index} style={{height:80, borderRightColor:"blue", borderRightWidth:1}}></View>
     )
    }
    else{
      return;
    }
    
     

    }
     else{
      if(countFalse3 <= 5){
        countFalse3 = countFalse3 + 1;
        countTrue3 = 0;
      return(

<View key={index} style={{height:80, borderRightColor:"#eaeaea", borderRightWidth:1}}></View>
     )
      }else{
        return;
      }
     }
  }
  else{
    return;
  }
    
})}
</View>
  <View style={{flexDirection:"row",  width:"8.3%", overflow:"hidden" }}>
  {this.state.graph_data.map((item,index)=>{
  let a = moment(item.serverTime).format("HH");
  {/* console.log("Hour : ")
  console.log(a) */}
  if (a == "06" || a == "07"){

    if(item.attributes.ignition == true){
    
    if(countTrue4 <= 5){
      countTrue4 = countTrue4 + 1;
      return(

<View key={index} style={{height:80, borderRightColor:"blue", borderRightWidth:1}}></View>
     )
    }
    else{
      return;
    }
    
     

    }
     else{
      if(countFalse4 <= 5){
        countFalse4 = countFalse4 + 1;
        countTrue4 = 0;
      return(

<View key={index} style={{height:80, borderRightColor:"#eaeaea", borderRightWidth:1}}></View>
     )
      }else{
        return;
      }
     }
  }
  else{
    return;
  }
    
})}
</View>
 <View style={{flexDirection:"row",  width:"8.3%", overflow:"hidden" }}>
 {this.state.graph_data.map((item,index)=>{
  let a = moment(item.serverTime).format("HH");
  {/* console.log("Hour : ")
  console.log(a) */}
  if (a == "08" || a == "09"){

    if(item.attributes.ignition == true){
    
    if(countTrue5 <= 5){
      countTrue5 = countTrue5 + 1;
      return(

<View key={index} style={{height:80, borderRightColor:"blue", borderRightWidth:1}}></View>
     )
    }
    else{
      return;
    }
    
     

    }
     else{
      if(countFalse5 <= 5){
        countFalse5 = countFalse5 + 1;
        countTrue5 = 0;
      return(

<View key={index} style={{height:80, borderRightColor:"#eaeaea", borderRightWidth:1}}></View>
     )
      }else{
        return;
      }
     }
  }
  else{
    return;
  }
    
})}
</View>
 <View style={{flexDirection:"row",  width:"8.3%", overflow:"hidden" }}>
 {this.state.graph_data.map((item,index)=>{
  let a = moment(item.serverTime).format("HH");
  {/* console.log("Hour : ")
  console.log(a) */}
  if (a == "10" || a == "11"){

    if(item.attributes.ignition == true){
    
    if(countTrue6 <= 5){
      countTrue6 = countTrue6 + 1;
      return(

<View key={index} style={{height:80, borderRightColor:"blue", borderRightWidth:1}}></View>
     )
    }
    else{
      return;
    }
    
     

    }
     else{
      if(countFalse6 <= 5){
        countFalse6 = countFalse6 + 1;
        countTrue6 = 0;
      return(

<View key={index} style={{height:80, borderRightColor:"#eaeaea", borderRightWidth:1}}></View>
     )
      }else{
        return;
      }
     }
  }
  else{
    return;
  }
    
})}
</View>
<View style={{flexDirection:"row",  width:"8.3%", overflow:"hidden" }}>
{this.state.graph_data.map((item,index)=>{
  let a = moment(item.serverTime).format("HH");
  {/* console.log("Hour : ")
  console.log(a) */}
  if (a == "12" || a == "13"){

    if(item.attributes.ignition == true){
    
    if(countTrue7 <= 5){
      countTrue7 = countTrue7 + 1;
      return(

<View key={index} style={{height:80, borderRightColor:"blue", borderRightWidth:1}}></View>
     )
    }
    else{
      return;
    }
    
     

    }
     else{
      if(countFalse7 <= 5){
        countFalse7 = countFalse7 + 1;
        countTrue7 = 0;
      return(

<View key={index} style={{height:80, borderRightColor:"#eaeaea", borderRightWidth:1}}></View>
     )
      }else{
        return;
      }
     }
  }
  else{
    return;
  }
    
})}
</View>
<View style={{flexDirection:"row",  width:"8.3%", overflow:"hidden" }}>
{this.state.graph_data.map((item,index)=>{
  let a = moment(item.serverTime).format("HH");
  {/* console.log("Hour : ")
  console.log(a) */}
  if (a == "14" || a == "15"){

    if(item.attributes.ignition == true){
    
    if(countTrue8 <= 5){
      countTrue8 = countTrue8 + 1;
      return(

<View key={index} style={{height:80, borderRightColor:"blue", borderRightWidth:1}}></View>
     )
    }
    else{
      return;
    }
    
     

    }
     else{
      if(countFalse8 <= 5){
        countFalse8 = countFalse8 + 1;
        countTrue8 = 0;
      return(

<View key={index} style={{height:80, borderRightColor:"#eaeaea", borderRightWidth:1}}></View>
     )
      }else{
        return;
      }
     }
  }
  else{
    return;
  }
    
})}
</View>

<View style={{flexDirection:"row",  width:"8.3%", overflow:"hidden" }}>
{this.state.graph_data.map((item,index)=>{
  let a = moment(item.serverTime).format("HH");
  {/* console.log("Hour : ")
  console.log(a) */}
  if (a == "16" || a == "17"){

    if(item.attributes.ignition == true){
    
    if(countTrue9 <= 5){
      countTrue9 = countTrue9 + 1;
      return(

<View key={index} style={{height:80, borderRightColor:"blue", borderRightWidth:1}}></View>
     )
    }
    else{
      return;
    }
    
     

    }
     else{
      if(countFalse9 <= 5){
        countFalse9 = countFalse9 + 1;
        countTrue9 = 0;
      return(

<View key={index} style={{height:80, borderRightColor:"#eaeaea", borderRightWidth:1}}></View>
     )
      }else{
        return;
      }
     }
  }
  else{
    return;
  }
    
})}
</View>
<View style={{flexDirection:"row",  width:"8.3%", overflow:"hidden" }}>
{this.state.graph_data.map((item,index)=>{
  let a = moment(item.serverTime).format("HH");
  {/* console.log("Hour : ")
  console.log(a) */}
  if (a == "18" || a == "19"){

    if(item.attributes.ignition == true){
    
    if(countTrue10 <= 5){
      countTrue10 = countTrue10 + 1;
      return(

<View key={index} style={{height:80, borderRightColor:"blue", borderRightWidth:1}}></View>
     )
    }
    else{
      return;
    }
    
     

    }
     else{
      if(countFalse10 <= 5){
        countFalse10 = countFalse10 + 1;
        countTrue10 = 0;
      return(

<View key={index} style={{height:80, borderRightColor:"#eaeaea", borderRightWidth:1}}></View>
     )
      }else{
        return;
      }
     }
  }
  else{
    return;
  }
    
})}
</View>
<View style={{flexDirection:"row",  width:"8.3%", overflow:"hidden" }}>
{this.state.graph_data.map((item,index)=>{
  let a = moment(item.serverTime).format("HH");
  {/* console.log("Hour : ")
  console.log(a) */}
  if (a == "20" || a == "21"){

    if(item.attributes.ignition == true){
    
    if(countTrue11 <= 5){
      countTrue11 = countTrue11 + 1;
      return(

<View key={index} style={{height:80, borderRightColor:"blue", borderRightWidth:1}}></View>
     )
    }
    else{
      return;
    }
    
     

    }
     else{
      if(countFalse11 <= 5){
        countFalse11 = countFalse11 + 1;
        countTrue11 = 0;
      return(

<View key={index} style={{height:80, borderRightColor:"#eaeaea", borderRightWidth:1}}></View>
     )
      }else{
        return;
      }
     }
  }
  else{
    return;
  }
    
})}
</View>
<View style={{flexDirection:"row",  width:"8.3%", overflow:"hidden" }}>
{this.state.graph_data.map((item,index)=>{
  let a = moment(item.serverTime).format("HH");
  {/* console.log("Hour : ")
  console.log(a) */}
  if (a == "22" || a == "23"){

    if(item.attributes.ignition == true){
    
    if(countTrue12 <= 5){
      countTrue12 = countTrue12 + 1;
      return(

<View key={index} style={{height:80, borderRightColor:"blue", borderRightWidth:1}}></View>
     )
    }
    else{
      return;
    }
    
     

    }
     else{
      if(countFalse12 <= 5){
        countFalse12 = countFalse12 + 1;
        countTrue12 = 0;
      return(

<View key={index} style={{height:80, borderRightColor:"#eaeaea", borderRightWidth:1}}></View>
     )
      }else{
        return;
      }
     }
  }
  else{
    return;
  }
    
})}
</View>

</View>

</View>
<View style={{width:"100%"}}>
{/* <View style={{flexDirection:"row",  width:"4.3%",  borderColor:"#000", borderWidth:1, borderColor:"#000", borderWidth:1 }}>

</View> */}
  <View style={{flexDirection:"row"}}>
<View style={{width:"6%"}}>

    <Text>00</Text>
</View>
<View style={{width:"8.4%"}}>

<Text>02</Text>
</View>
<View style={{width:"8.4%"}}>

<Text>04</Text>
</View>
<View style={{width:"8.4%"}}>

<Text>06</Text>
</View>
<View style={{width:"8.4%"}}>

<Text>08</Text>
</View><View style={{width:"8.4%"}}>

<Text>10</Text>
</View><View style={{width:"8%"}}>

<Text>12</Text>
</View><View style={{width:"8.4%"}}>

<Text>14</Text>
</View><View style={{width:"8%"}}>

<Text>16</Text>
</View>
<View style={{width:"8%"}}>

<Text>18</Text>
</View>
<View style={{width:"8%"}}>

<Text>20</Text>
</View>
<View style={{width:"8%"}}>

<Text>22</Text>
</View>
<View style={{width:"7.5%"}}>

<Text>24</Text>
</View>
  
    {/* <View style={{width:13}}></View>
    <Text>06</Text>
    <View style={{width:13}}></View>
    <Text>08</Text>
    <View style={{width:13}}></View>
    <Text>10</Text>
    <View style={{width:13}}></View>
    <Text>12</Text>
    <View style={{width:13}}></View>
    <Text>14</Text>
    <View style={{width:13}}></View>
    <Text>16</Text>
    <View style={{width:13}}></View>
    <Text>18</Text>
    <View style={{width:13}}></View>
    <Text>20</Text>
    <View style={{width:13}}></View>
    <Text>22</Text>
    <View style={{width:13}}></View>
    <Text>24</Text> */}


 
  </View>
</View>

</View>
) : (
  <View style={{width:"100%", alignContent:"center", alignItems:"center"}}>
  <View style={{paddingVertical:10}}>
    <Text style={{fontSize:22, fontFamily:"space-mono", color:"#808080"}}>Fetching Graph...</Text>
  </View>
    <ActivityIndicator size={"large"}/>
  </View>
)}

          </View>
        </Content>

            </Tab>
            <Tab
              heading="Maintenance"
              tabStyle={{ backgroundColor: "#424242" }}
              textStyle={{ color: "#fff", fontSize:14 }}
              activeTabStyle={{ backgroundColor: "#424242" }}
              activeTextStyle={{ color: "#FFC000", fontWeight: "normal", fontSize: 14 }}
            >

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
                {this.state.events_loading ? (
            <View style={{width:"100%", alignContent:"center", alignItems:"center"}}>
  <View style={{paddingVertical:10}}>
    <Text style={{fontSize:22, fontFamily:"space-mono", color:"#808080"}}>Fetching Events...</Text>
  </View>
    <ActivityIndicator size={"large"}/>
  </View>
          ): this.state.events_data.length != 0 ? this.state.events_data.map((item,index)=>{
           
            return(

              <View key={index} style={{ width: "90%", borderBottomWidth:1, borderBottomColor:"#808080", paddingVertical:10 }}>
                <View style={{ flexDirection: "row", paddingVertical: 5 }}>
                  <View style={{ width: "100%" }}>
                  {item.maintenance ? (
                  <Text style={{fontSize:22, fontWeight:"bold"}}>{item.maintenance.name}</Text>

                  ):(
<ActivityIndicator size={"small"}/>
                  )}
                  {item.maintenance ? (
                  <Text style={{fontSize:12, color:"#808080", marginTop:3}}>{ moment(item.serverTime).format("YYYY-MM-DD HH:mm:ss") }</Text>

                  ):(
<ActivityIndicator size={"small"}/>
                  )}
                    </View>
                   
                  </View>
              </View>
            )
          }).reverse() : (
            <View style={{width:"100%", alignContent:"center", alignItems:"center"}}>
<Text style={{fontSize:24, fontWeight:"500", color:"#808080"}}> No Events Yet</Text>
            </View>
          )
          }
            </View>
           
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
    width: "90%",
    paddingVertical: 10,
    alignItems: "center",
    alignContent: "center",
    borderRadius: 8,
    backgroundColor: "white",
    marginTop: 30
  }
});
