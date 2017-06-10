//guide questions here
import React from 'react';
import { connect } from 'react-redux';
import { becomeGuideCity } from '../Actions/BecomeAGuideActions.js';
import { StyleSheet, Text, View, Picker, TouchableOpacity } from 'react-native';
import { Button, FormLabel, FormInput, } from 'react-native-elements';
import Autocomplete from 'react-native-autocomplete-input';
import config from '../Config/config.js';
import Axios from 'axios';


class BecomeAGuideQuestions1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      citiesPrediction: []
    }
    this.navigateToNext = this.navigateToNext.bind(this);
  }

  navigateToNext() {
    this.props.navigation.navigate('GuideQuestions2');
  }

  updateCity(city) {
    city = city.query;
    this.props.dispatch(becomeGuideCity(city));
    if(city.length > 3){
      var query = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + city + '&types=(cities)&language=en_US&key=' + config.GOOGLE_PLACES_API_KEY;
      Axios.get(query)
      .then((res) => {
        const cities = res.data.predictions;
        console.log('google search data', res.data.predictions)
        this.setState({ citiesPrediction: cities });
      })
      .catch((err) => {
        console.log(err);
      });
    } else {
      this.setState({ citiesPrediction: [] });
    }
  }
  render() {
    console.log('PROPS', this.props);
    const filterCities = this.state.citiesPrediction.length > 0 && this.state.citiesPrediction[0].description !== this.props.becomeAGuide.city ? this.state.citiesPrediction : [];

    return (
      <View style={{marginTop: 100}}>
        <FormLabel>What city will you be giving a tour in?</FormLabel>
        <Autocomplete
            autoCapitalize="none"
            keyboardShouldPersistTaps={true}
            autoCorrect={false}
            containerStyle={styles.autocompleteContainer}
            data={filterCities}
            defaultValue={this.props.becomeAGuide.city}
            onChangeText={text => this.updateCity({ query: text })}
            placeholder="Enter Destination"
            renderItem={({ description }) => {
              return (
              <TouchableOpacity onPress={() => this.updateCity({ query: description })}>
                <Text style={styles.itemText}>
                  {description}
                </Text>
              </TouchableOpacity>
            )}}
          />
        <View style={{marginTop: 10}}>
          <Button
            small
            raised
            backgroundColor='#FF8C00'
            title='Next'
            onPress={this.navigateToNext}
          />
        </View>
      </View> 
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF',
    flex: 1,
    paddingTop: 25,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 25,
  },
  autocompleteContainer: {
    marginLeft: 10,
    marginRight: 10,
    height: 150
  },
  itemText: {
    fontSize: 15,
    margin: 2
  },
  descriptionContainer: {
    // `backgroundColor` needs to be set otherwise the
    // autocomplete input will disappear on text input.
    backgroundColor: '#F5FCFF',
    marginTop: 8
  }
});

const mapStateToProps = state => (state);

export default connect(mapStateToProps)(BecomeAGuideQuestions1);