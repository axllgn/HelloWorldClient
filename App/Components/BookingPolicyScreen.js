import React from 'react';
import { Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { PricingCard, Card } from 'react-native-elements';
import stripe from 'tipsi-stripe';
import axios from '../axios.js';
import config from '../Config/config';

stripe.init({
  publishableKey: config.STRIPE_API_KEY
});

class BookingPolicyScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      token: null
    };

    this.navigateToConfirmation = this.navigateToConfirmation.bind(this);
    this.bookTour = this.bookTour.bind(this);
  }

  bookTour() {
    const options = {
      travelerId: this.props.userProfile.profile.userId,
      guideFacebookId: this.props.profileSelection.selectedProfile.user.facebook_id,
      city: this.props.search.city,
      startDateHr: `${this.props.search.date}, ${this.props.search.fromHour}:00`,
      endDateHr: `${this.props.search.date}, ${this.props.search.toHour}:00`,
      date: this.props.search.date
    };
    
    axios.post('api/bookings', options)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  navigateToConfirmation() {
    this.bookTour();
    this.props.navigation.navigate('BookingConfirmation');
  }

  render() {
    console.log('PROPS', this.props);

    const handleCardPayPress = async () => {
      try {
        this.setState({
          loading: true,
          token: null
        });
        const token = await stripe.paymentRequestWithCardForm({
          smsAutofillDisabled: true,
          requiredBillingAddressFields: 'full',
          managedAccountCurrency: 'usd',
        });

        axios.post('api/payments', { stripeToken: token })
          .then(res => {
            console.log(res);
          })
          .catch(err => {
            console.log(err);
          });

        console.log('RESULT', token);
        this.setState({
          loading: false,
          token,
        });

        this.navigateToConfirmation();
      } catch (error) {
        console.log('ERROR', error);
        this.setState({
          loading: false,
        });
      }
    };

    const { loading, token } = this.state;
    const hourlyRate = this.props.profileSelection.selectedProfile.availabilities[0].hourly_rate;

    return (
      <ScrollView>
        <PricingCard
          color='#FF8C00'
          title='Your Total Cost'
          price={`$${hourlyRate * (this.props.search.toHour - this.props.search.fromHour)}`}
          info={[`$${hourlyRate} Per Hour`, `${this.props.search.fromHour} - ${this.props.search.toHour}`, 'Authorize Only', 'Payment Will Be Made When Trip Is Confirmed']}
          button={{ title: 'Confirm and Request a Tour!', icon: 'check-circle' }}
          onButtonPress={handleCardPayPress}
        />
        <Card
          title='Terms & Conditions'
        >
          <Text style={{ marginBottom: 10 }}>
            HelloWorld enforces terms to protect both tourist(s) and guide alike. Tourist(s) may cancel and review any penalties by viewing their travel plans and then clicking ‘Cancel’ on the appropriate reservation.
          </Text>
        </Card>
      </ScrollView>
    );
  }
}

const mapStateToProps = state => (state);

export default connect(mapStateToProps)(BookingPolicyScreen);
          

          // <Button
          //   small
          //   raised
          //   icon={{ name: 'check-circle' }}
          //   backgroundColor='#FF8C00'
          //   title='Confirm and Request a Tour!'
          //   buttonStyle={{ marginTop: 10 }}
          //   onPress={this.navigateToConfirmation}
          // />
