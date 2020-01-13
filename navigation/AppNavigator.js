
import { createAppContainer, createSwitchNavigator, createStackNavigator } from 'react-navigation';
import HomeScreen from '../screens/HomeScreen';
import VehicleDetails from '../screens/VehicleDetails';
import LoginForm from '../screens/LoginForm';
import Maintenance from '../screens/Maintenance';

export default createAppContainer(
  createStackNavigator({
    LoginForm : LoginForm,
    VehicleDetails : VehicleDetails,
    Main: HomeScreen,
    Maintenance: Maintenance
  },
  {
    headerMode: "none"
  })
);
