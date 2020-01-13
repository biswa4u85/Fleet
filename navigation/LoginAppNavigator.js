
import { createAppContainer, createSwitchNavigator, createStackNavigator } from 'react-navigation';
import HomeScreen from '../screens/HomeScreen';
import VehicleDetails from '../screens/VehicleDetails';
import LoginForm from '../screens/LoginForm';
import Maintenance from '../screens/Maintenance';

export default createAppContainer(
  createStackNavigator({
    Main: HomeScreen,
    VehicleDetails : VehicleDetails,
    LoginForm : LoginForm,
    Maintenance: Maintenance
  },
  {
    headerMode: "none"
  })
);
