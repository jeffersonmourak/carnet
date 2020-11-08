# carnet

### Unofficial Javascript Wrapper for VW's CarNet API.

This package is based on [thomasesmith](https://github.com/thomasesmith/vw-car-net-api) Api documentation.

## Installing

Install using your favorite package manager.
`$ npm install carnet`
`$ yarn add carnet`

## Regional Support

Like [thomasesmith PHP Wrapper](https://github.com/thomasesmith/php-vw-car-net) this code has been tested only in **USA VW car-net account** for the E-Golf ONLY, if you want to add another car support you can create a new pull request with your changes.

## Coding!

### Authenticating

The code below authenticates you with Car Net API retreiving the tokens necessary for perform the actions on you car.

```javascript
const CarNet = require("carnet");
// email = Email to log into car net app
// password = Password to log into car net app
const carNet = new CarNet(email, password);

await carNet.authenticate();
```

### Retreiving your cars.

```javascript
const [car] = await carNet.vehicles();
```

This will return an array of Vehicle Classes.

### Connecting to your car.

```javascript
const carController = await carNet.connectToCar(car);
// pin = Car-Net pin of your car.
await carController.authenticate(pin);
```

### Retreiving your car status

```javascript
await carController.status();
```

## Vehicle Methods.

- `lockDoor()` Locks the door of your car.
- `unlockDoor()` Unlocks the door of your car.
- `horn()` Horn and turn the hazard until you unlock the car.
- `charging(active)` Enables and Disables the charging of your car if it's connected to the charger.
- `setMaxChargingCurrent(current)` Set the max current your car can accept from the charger. you can use`5, 10, 13 or "max"` as value for `current`
- `getClimate()` returns the climate status of your car.
- `climate.enableUnpluggedClimate(enabled)` enable/disable you car to turn the climate while unplugged.
- `climate.defrost(active)` Turn defrost on/off
- `climate.start(temperature)` Turn on the climate with a given temperature.
- `climate.stop()` Turn the car climate off.

## Disclaimer

No affiliation or sponsorship is to be implied between the developers of this package and Volkswagen AG. Any trademarks, service marks, brand names or logos are the properties of their respective owners and are used on this site for educational purposes only.
