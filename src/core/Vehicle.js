const Api = require("../core/Api");

class Vehicle {
  constructor(credentials, user, vehicle) {
    this.vehicle = vehicle;
    this.user = user;
    this.credentials = credentials;
    this.api = new Api(credentials.accessToken, credentials.idToken);
    this.api.userId = user.userId;
  }

  _defaultBody() {
    return {
      tsp_token: this.tsp.tspToken,
      email: this.user.email,
      vw_id: this.user.vwId,
    };
  }

  async authenticate(tspPin) {
    this.tsp = await this.api.post(
      `/ss/v1/user/${this.user.userId}/vehicle/${this.vehicle.vehicleId}/session`,
      {
        accountNumber: this.vehicle.rolesAndRights.tspAccountNum,
        idToken: this.credentials.idToken,
        tspPin,
        tsp: this.vehicle.vehicle.tspProvider,
      }
    );
  }

  async status() {
    return await this.api.get(`/rvs/v1/vehicle/${this.vehicle.vehicleId}`);
  }

  async lockDoor() {
    return await this.api.put(
      `/mps/v1/vehicles/${this.vehicle.rolesAndRights.tspAccountNum}/status/exterior/doors`,
      {
        ...this._defaultBody(),
        lock: true,
      }
    );
  }

  async unlockDoor() {
    return await this.api.put(
      `/mps/v1/vehicles/${this.vehicle.rolesAndRights.tspAccountNum}/status/exterior/doors`,
      {
        ...this._defaultBody(),
        lock: false,
      }
    );
  }

  async horn() {
    return await this.api.put(
      `/mps/v1/vehicles/${this.vehicle.rolesAndRights.tspAccountNum}/status/exterior/horn_and_lights`,
      {
        ...this._defaultBody(),
        horn: true,
        lights: true,
      }
    );
  }

  async charging(active) {
    return await this.api.patch(
      `/mps/v1/vehicles/${this.vehicle.rolesAndRights.tspAccountNum}/status/charging`,
      {
        ...this._defaultBody(),
        active,
      }
    );
  }

  async setMaxChargingCurrent(current) {
    const acceptedCurrentValues = [5, 10, 13, "max"];

    if (current && !acceptedCurrentValues.includes(current)) {
      throw new Error(
        `The value ${current} is not valid, use one of these ${acceptedCurrentValues.join(
          ","
        )}`
      );
    }

    return await this.api.put(
      `/mps/v1/vehicles/${this.vehicle.rolesAndRights.tspAccountNum}/settings/max_charge_current`,
      {
        ...this._defaultBody(),
        max_charge_current: current,
      }
    );
  }

  async getClimate() {
    return await this.api.put(
      `/mps/v1/vehicles/${this.vehicle.rolesAndRights.tspAccountNum}/status/climate/details`,
      {
        ...this._defaultBody(),
      }
    );
  }

  climate = {
    async enableUnpluggedClimate(enabled) {
      return await this.api.put(
        `/mps/v1/vehicles/${this.vehicle.rolesAndRights.tspAccountNum}/settings/unplugged_climate_control`,
        {
          ...this._defaultBody(),
          enabled,
        }
      );
    },
    async defrost(active) {
      return await this.api.put(
        `/mps/v1/vehicles/${this.vehicle.rolesAndRights.tspAccountNum}/status/defrost`,
        {
          ...this._defaultBody(),
          active,
        }
      );
    },
    async start(temperature) {
      return await this.api.put(
        `/mps/v1/vehicles/${this.vehicle.rolesAndRights.tspAccountNum}/status/climate`,
        {
          ...this._defaultBody(),
          active: true,
          target_temperature: temperature,
        }
      );
    },
    async stop() {
      return await this.api.put(
        `/mps/v1/vehicles/${this.vehicle.rolesAndRights.tspAccountNum}/status/climate`,
        {
          ...this._defaultBody(),
          active: false,
          target_temperature: 77,
        }
      );
    },
  };
}

module.exports = Vehicle;
