const auth = require("./auth");
const Api = require("./Api");
const Vehicle = require("./Vehicle");

const { throws } = require("assert");
const moment = require("moment");

class CarNet {
  constructor(email, password) {
    this.credentials = null;
    this.email = email;
    this.password = password;
  }

  async authenticate() {
    this.credentials = await auth(this.email, this.password);

    const { accessToken, idToken } = this.credentials;

    this.api = new Api(accessToken, idToken);
  }

  async status() {
    if (!this.credentials || !this.api) {
      throw new Error(`Invalid Credentrials, please try again later`);
    }

    this._statusCache = {
      data: await this.api.get(
        `/account/v1/enrollment/status?idToken=${this.credentials.idToken}`
      ),
      timestamp: moment(),
    };

    return;
  }

  async _extractCustomer({ customer }) {
    this.userId = customer.userId;
    this.vwId = customer.vwId;

    return customer;
  }

  async customer() {
    const now = moment();

    if (
      !this._statusCache ||
      now.diff(this._statusCache.timestamp, "minutes") > 2
    ) {
      await this.status();
    }

    return this._extractCustomer(this._statusCache.data);
  }

  async _extractVehicles({ vehicleEnrollmentStatus }) {
    this._vehicles = vehicleEnrollmentStatus;

    return vehicleEnrollmentStatus;
  }

  async vehicles() {
    const now = moment();

    if (
      !this._statusCache ||
      now.diff(this._statusCache.timestamp, "minutes") > 2
    ) {
      await this.status();
    }
    return this._extractVehicles(this._statusCache.data);
  }

  async connectToCar(vehicle) {
    const customer = await this.customer();
    return new Vehicle(this.credentials, customer, vehicle);
  }
}

module.exports = CarNet;
