/**
 * JPE Sims 4 Mod Translator - Mobile App Entry Point
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './package.json';

AppRegistry.registerComponent(appName, () => App);