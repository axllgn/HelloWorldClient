import React, { Component } from 'react';
import { Button, Card, Text, ScrollView, StyleSheet, View, Dimensions, Modal } from 'react-native';
import { Divider} from 'react-native-elements';
import { connect } from 'react-redux';
import SwipeOut from 'react-native-swipeout';
import axios from '../axios';
import MapView from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import config from '../Config/config';

Geocoder.setApiKey(config.GOOGLE_MAPS_API_KEY)

const { width, height } = Dimensions.get('window');

const SCREEN_HEIGHT = height;
const SCREEN_WIDTH = width;
const ASPECT_RATIO = width/height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const DEFAULT_PADDING = { top: 40, right: 40, bottom: 40, left: 40 };

class GuideItineraryScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialPosition: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0
      },
      markerPosition: {
        latitude: 0,
        longitude: 0
      },
      pointsOfInterestNames: [
        'Golden Gate Bridge', 
        'Golden Gate Park',
        'AT&T Park'
        ],
      //GG Bridge, GG Park, ATT Park
      pointsOfInterest: [
        {
          latitude: 37.8199, 
          longitude: -122.4783
        }, 
        {
          latitude: 37.7786,
          longitude: -122.3893
        },
        {
          latitude: 37.7694,
          longitude: -122.4862
        }
      ],
      modalVisible: false,
    }
    this.deleteEvent = this.deleteEvent.bind(this);
    this.initialisePosition = this.initialisePosition.bind(this);
    this.fitAllMarkers = this.fitAllMarkers.bind(this);
    this.getCoordsFromLocation = this.getCoordsFromLocation.bind(this);
    this.setModalVisible = this.setModalVisible.bind(this);
  }

  watchID: ?number = null

  componentDidMount() {
    axios.get(`/api/events/booking/${this.props.navigation.state.params.bookingId}`)
    .then(pointsOfInterest => {
      // Get names of events
      let pointsOfInterestNames = pointsOfInterest.data.map(pointOfInterest => {
        return pointOfInterest.event_name
      });
      // Get coordinates of events
      let pointsOfInterestCoordinates = pointsOfInterest.data.map(pointOfInterest => {
        return {
          coordinates: {
            longitude: pointOfInterest.latitude,
            latitude: pointOfInterest.longitude,
          },
          eventName: pointOfInterest.event_name
        }
      });
      this.setState({
        pointsOfInterestNames: pointsOfInterestNames,
        pointsOfInterest: pointsOfInterestCoordinates,
      });
      this.initialisePosition();
    })
    .catch(error => {
      console.error('error', error)
    })
  }

  initialisePosition() {
    navigator.geolocation.getCurrentPosition((position) =>{
      let lat = parseFloat(position.coords.latitude);
      let long = parseFloat(position.coords.longitude);

      let initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }

      this.setState({initialPosition: initialRegion});
      this.setState({markerPosition: initialRegion});
    }, 
    (error) => alert(JSON.stringify(error)),
    {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000});

    this.watchID = navigator.geolocation.watchPosition((position) => {
      let lat = parseFloat(position.coords.latitude);
      let long = parseFloat (position.coords.longitude);

      let lastRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }

      this.setState({initialPosition: lastRegion});
      this.setState({markerPosition: lastRegion});
    });
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  fitAllMarkers() {
    this.map.fitToCoordinates(this.state.pointsOfInterest, {
      edgePadding: DEFAULT_PADDING,
      animated: true,
    });
  }

  getCoordsFromLocation() {
    this.state.pointsOfInterestNames.forEach(point => {
      Geocoder.getFromLocation(point).then(
        json => {
          let poiLocation = {
            latitude: json.results[0].geometry.location.lat,
            longitude: json.results[0].geometry.location.lng
          };
          
          let poiList = []

          console.log(poiLocation);
        },
        error => {
          alert(error);
        }
      );      
    });
  }

  deleteEvent(index) {
    let newPointsOfInterestNames = this.state.pointsOfInterestNames.slice();
    newPointsOfInterestNames.splice(index, 1);
    this.setState({
      pointsOfInterestNames: newPointsOfInterestNames
    });
    // Axios put method to update booking in database.
  }

  setModalVisible(boolean) {
    this.setState({
      modalVisible: boolean
    })
  }


  render() {
    console.log('this.props ITINERARY SCREEN', this.props, this.state.pointsOfInterestNames);
    return (
      <View>
        <View style={styles.header}>
          <Text style={styles.title}>Itinerary</Text>
        </View>
        <View style={styles.list}>
          <Divider style={styles.swipeOut} />
          {this.state.pointsOfInterestNames.map((event, index) => {
            let swipeButtons = [{
              text: 'Delete',
              backgroundColor: 'red',
              underlayColor: 'rgba(0, 0, 0, 1.6)',
              onPress: () => this.deleteEvent(index)
            }];
            return (
              <SwipeOut
                right={swipeButtons}
                autoClose={true}
                backgroundColor='transparent'
                key={index}
              >
                <View>
                  <View>
                    <Text>{event}</Text>
                    <Divider style={styles.swipeOut} />
                  </View>
                </View>
              </SwipeOut>
            )
          })}
        </View>



        <View style={styles.container}>
          <Modal
            animationType={"slide"}
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {alert("Modal has been closed.")}}
          >
            <MapView
              ref={ref => { this.map = ref; }}
              style={styles.map}
              region={this.state.initialPosition}>
              <MapView.Marker
                coordinate={this.state.markerPosition}>
                  <View style={styles.radius}>
                    <View style={styles.marker}/>
                  </View>
              </MapView.Marker>
                {this.state.pointsOfInterest.map(point => {
                  // console.log('---point---', point)
                  return (
                    <MapView.Marker
                      ref={ref=> {this.marker = ref}}
                      coordinate={point.coordinates}
                      title={point.eventName}
                      />
                  );
                })}
            </MapView>
            <View style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
              <Button
                small
                raised
                backgroundColor='#FF8C00'
                title='Points of Interest'
                onPress={()=>this.fitAllMarkers()}
                // onPress={()=>this.getCoordsFromLocation()}
              />
              <Button
                title='Back to Itinerary'
                onPress={() => this.setModalVisible(!this.state.modalVisible)}
              />
            </View>
          </Modal>
          <View style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
            <Button
              small
              raised
              backgroundColor='#FF8C00'
              title='Map'
              onPress={() => this.setModalVisible(true)}
            />
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center'
  },
  title: {
    fontSize: 15
  },
  list: {
    height: 550
  },
  swipeOut: {
    height: 20,
    borderBottomColor: '#000',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  radius: {
    height: 40,
    width: 40,
    borderRadius: 40/2,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  marker: {
    height: 15,
    width: 15,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 15/2,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 122, 255, 0.3)'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  map: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute' 
  },
  button: {
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 0
  }
});

const mapStateToProps = state => state;

export default connect(mapStateToProps)(GuideItineraryScreen);