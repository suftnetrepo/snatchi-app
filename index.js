/**
 * @format
 */
import 'react-native-get-random-values'
import {AppRegistry} from 'react-native';
import './sentry.config'
import App from './App';
import * as Sentry from '@sentry/react-native';
import {name as appName} from './app.json';

const Root = Sentry.wrap(App);  
AppRegistry.registerComponent(appName, () => Root);
