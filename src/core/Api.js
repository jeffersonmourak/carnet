const { API_HOST } = require("../helpers/constants");
const fetch = require("../helpers/customFetch");
const uuid = require("uuid");

class Api {
  constructor(accessToken, idToken) {
    this.baseUrl = API_HOST;
    this.accessToken = accessToken;
    this.idToken = idToken;
  }

  _buildRequestOptions(method, body, customHeaders = {}) {
    const headers = {
      ...customHeaders,
      authorization: `Bearer ${this.accessToken}`,
      "content-type": "application/json;charset=UTF-8",
      "x-app-uuid": uuid.v4(),
      "x-user-agent": "mobile-ios",
    };

    if (this.userId) {
      headers["x-user-id"] = this.userId;
    }

    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return options;
  }

  async get(url) {
    const options = this._buildRequestOptions("GET");
    const response = await fetch(`${this.baseUrl}${url}`, options);

    const { data } = await response.json();

    return data;
  }

  async post(url, body) {
    const options = this._buildRequestOptions("POST", body);
    const response = await fetch(`${this.baseUrl}${url}`, options);

    const { data } = await response.json();

    return data;
  }

  async put(url, body) {
    const options = this._buildRequestOptions("PUT", body);
    const response = await fetch(`${this.baseUrl}${url}`, options);

    const { data } = await response.json();

    return data;
  }

  async patch(url, body) {
    const options = this._buildRequestOptions("PATCH", body);
    const response = await fetch(`${this.baseUrl}${url}`, options);

    const { data } = await response.json();

    return data;
  }
}

module.exports = Api;
