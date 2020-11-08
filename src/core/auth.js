const { random } = require("../helpers");
const sha256 = require("crypto-js/sha256");
const Base64 = require("crypto-js/enc-base64");
const uuid = require("uuid");
const cheerio = require("cheerio");
const nodeFetch = require("../helpers/customFetch");
const tough = require("tough-cookie");
const fetch = require("fetch-cookie")(nodeFetch, new tough.CookieJar());
const FormData = require("form-data");
const { URLSearchParams } = require("url");
const {
  AUTH_HOST,
  API_HOST,
  AUTH_USER_AGENT_SPOOF,
  APP_USER_AGENT_SPOOF,
  APP_CLIENT_ID_IOS,
} = require("../helpers/constants");

const helpers = {
  base64URL(string) {
    return string
      .toString(Base64)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  },
  generateSessionData() {
    const verifier = random.hex(64);
    const challenge = helpers.base64URL(sha256(verifier));
    const sessionUuid = uuid.v4();
    return {
      verifier,
      challenge,
      uuid: sessionUuid,
    };
  },
  getFormData(html, formName) {
    const $ = cheerio.load(html);

    let csrf = $("input#csrf").val();
    let relayState = $("input#input_relayState").val();
    let hmac = $("input#hmac").val();
    let action = $(`form#${formName}`).attr("action");

    return {
      csrf,
      relayState,
      hmac,
      action,
    };
  },
};

const session = helpers.generateSessionData();

const getLoginForm = async () => {
  try {
    const url = `${API_HOST}/oidc/v1/authorize?redirect_uri=car-net%3A%2F%2F%2Foauth-callback&scope=openid&prompt=login&code_challenge=${session.challenge}%3D&state=${session.uuid}&response_type=code&client_id=${APP_CLIENT_ID_IOS}`;

    const response = await fetch(url);
    const html = await response.text();

    const { csrf, relayState, hmac, action } = helpers.getFormData(
      html,
      "emailPasswordForm"
    );

    return { csrf, relayState, hmac, action };
  } catch (e) {
    console.log(e);
    console.log("Step 1 error");
  }
};

const getPasswordForm = async ({ csrf, relayState, hmac, action }, email) => {
  try {
    const form = new FormData();

    form.append("_csrf", csrf);
    form.append("relayState", relayState);
    form.append("hmac", hmac);
    form.append("email", email);

    const options = {
      method: "POST",
      body: form,
      headers: {
        ...form.getHeaders(),
        "user-agent": AUTH_USER_AGENT_SPOOF,
        "accept-language": "en-us",
        accept: "*/*",
      },
    };

    const request = await fetch(`${AUTH_HOST}${action}`, options);
    const html = await request.text();
    const { hmac: nextHmac, action: nextAction } = helpers.getFormData(
      html,
      "credentialsForm"
    );

    return {
      csrf,
      relayState,
      hmac: nextHmac,
      action: nextAction,
      email,
    };
  } catch (e) {
    console.log(e);
    console.log("Step 2 Error");
  }
};

const getAppAuthToken = async (
  { csrf, relayState, hmac, action, email },
  password
) => {
  try {
    const form = new FormData();

    form.append("_csrf", csrf);
    form.append("relayState", relayState);
    form.append("hmac", hmac);
    form.append("email", email);
    form.append("password", password);

    const options = {
      method: "POST",
      body: form,
      headers: {
        ...form.getHeaders(),
        "user-agent": AUTH_USER_AGENT_SPOOF,
        "accept-language": "en-us",
        accept: "*/*",
      },
    };

    const { url } = await fetch(`${AUTH_HOST}${action}`, options);

    const params = url.replace("car-net:///oauth-callback", "");

    const parsedParams = new URLSearchParams(params);

    return parsedParams.get("code");
  } catch (e) {
    console.log(e);
    console.log("Step 3 Error");
  }
};

const getToken = async (code) => {
  try {
    const form = new URLSearchParams();

    form.append("grant_type", "authorization_code");
    form.append("code", code);
    form.append("client_id", APP_CLIENT_ID_IOS);
    form.append("redirect_uri", "car-net:///oauth-callback");
    form.append("code_verifier", session.verifier);

    const options = {
      method: "POST",
      body: form,
      headers: {
        "user-agent": APP_USER_AGENT_SPOOF,
        "content-type": "application/x-www-form-urlencoded",
        "accept-language": "en-us",
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br",
      },
    };

    const request = await nodeFetch(`${API_HOST}/oidc/v1/token`, options);

    const tokens = await request.json();

    return {
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
    };
  } catch (e) {
    console.log(e);
    console.log("Step 4 Error");
  }
};

module.exports = async (email, password) => {
  return await getLoginForm()
    .then((response) => getPasswordForm(response, email))
    .then((response) => getAppAuthToken(response, password))
    .then((response) => getToken(response));
};
