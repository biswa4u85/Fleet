import React, { Component } from "react";
import { Header, Button, Left, Right, Icon, Container, Form, Textarea } from "native-base";

import {
  Dimensions,
  Platform,
  StatusBar,
  Modal,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image
} from "react-native";
var deviceHeight = Dimensions.get("window").height;
var deviceWidth = Dimensions.get("window").width;
const theme_color = "#f58936";
// @inject("routerActions")
class BaseHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.navigate = this.props.navigation.navigate;
  }
 
  render() {
    const navigation = this.props.navigation;
    return (
      <View style={{width:deviceWidth,paddingVertical:10, marginTop: Platform.OS == "ios" ? 25 : StatusBar.currentHeight, backgroundColor:theme_color}}>
<View style={{flexDirection:"row", width:deviceWidth}}>
<View style={{width:"70%"}}>
<View style={{flexDirection:"row"}}>

<TouchableOpacity
style={{marginLeft:10}}
onPress={() => this.props.navigation.goBack(null)}
>
              <Icon
                style={{color: "#fff" }}
                name="ios-arrow-back"
              />

</TouchableOpacity>
<View>
<TouchableOpacity
style={{marginLeft:30}}
// onPress={() => this.props.navigation.goBack()}
>
<Text style={{fontSize:20, fontWeight:"bold", color:"#fff"}}>{this.props.title}</Text>

</TouchableOpacity>

 
</View>
</View>


</View>
<View style={{width:"30%"}}>
<View style={{flexDirection:"row"}}>
<View style={{width:"50%"}}>

    <Icon style={{color:"#fff"}} name="search"/>
</View>
<View style={{width:"50%"}}>

    <Icon style={{color:"#fff"}} name="notifications"/>
</View>
</View>
</View>

</View>

      </View>
     );
  }
}


export default BaseHeader;
