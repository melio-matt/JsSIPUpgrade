/**
 * @format
 */

/*
* SECTION WEBRTC 
* This is required for webrtc compatiblity issues, it's a polyfill.
* It might not all be required with latest versions
* except for the addTrack function but better safe than sorry.
*/ 

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  // RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  // registerGlobals
} from 'react-native-webrtc';

window.RTCPeerConnection = window.RTCPeerConnection || RTCPeerConnection;


// *****
// This is required to comply with react-native media issues
// *****
window.RTCPeerConnection.addTrack = function (track, stream) {
  this.addStream(stream);
};

window.RTCIceCandidate = window.RTCIceCandidate || RTCIceCandidate;
window.RTCSessionDescription =
  window.RTCSessionDescription || RTCSessionDescription;
window.MediaStream = window.MediaStream || MediaStream;
window.MediaStreamTrack = window.MediaStreamTrack || MediaStreamTrack;
window.navigator.mediaDevices = window.navigator.mediaDevices || mediaDevices;
window.navigator.getUserMedia =
  window.navigator.getUserMedia || mediaDevices.getUserMedia;

/*
* END SECTION WEBRTC 
*/

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';


/*
* SECTION SIP 
* This is a demo class about how to connect to a sip server.
*/ 

import JsSIP from 'react-native-jssip';

class Sip {

  constructor() {

    // Set up server config
    let config = {
      // WSS endpoint, like what a Kamailo server would support
      'endpoint': 'wss://rcs.domain.com:8443',
      // SIP username
      'username': 'sip:some_username@some_sip_domain',
      // SIP password
      'password': 'ha1_sip_password',
      // ha1 password is of format: 
      // ha1(username + ':' + realm + ':' + password)
    }
    this.client = null;
    this.config = null;
    this.call = null;

    var socket = new JsSIP.WebSocketInterface(config.endpoint);
    /* Use this if you're using plaing passwords
    var configuration = {
      sockets  : [ socket ],
      uri      : config.username,
      password : config.password
    };
    */

    // Use this if you're using ha1 passwords
    var configuration = {
      sockets  : [ socket ],
      uri      : config.username,      
      ha1      : config.password,
      realm    : 'realmname.domain.com' // See SIP server config for realm
    };

    // Enabable this to see full console logs of SIP traffic
    // It is very verbose, enable only when debugging!
    JsSIP.debug.enable('JsSIP:*');

    var ua = new JsSIP.UA(configuration);

    this.client = ua;

    ua.on('connected', () => {
      console.log('connected');
    });
    ua.on('registered', () => {
      console.log('registered');
    });
    ua.on('unregistered', () => {
      console.log('unregistered');
    });
    ua.on('registrationFailed', () => {
      console.log('registrationFailed');
    });

    ua.on('newRTCSession', (data) => {
      console.log('newRTCSession');
      if (data.originator === 'local') {
        return;
      }
      // New incoming call, 
      // TODO: emit an event that a call is available in this service
      this.call = data.session;
    });
    // Connect to the server
    ua.start();
  }
}


try {
const SipService = new Sip();
} catch (e) {
  console.log(e.message);
}

AppRegistry.registerComponent(appName, () => App);
