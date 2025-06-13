const axios = require("axios");
const moment = require("moment");

// 🟡 Safaricom Daraja Sandbox Credentials
const consumerKey = "obnYOb05TJuiPavbi52A8bC3QZnjFcDBhTysR4DA52cfPdTA";
const consumerSecret = "26vnmAGz6HbUdsQBU5bLEjyTyE4SSOokFvmPYO9iLHdaCmieGYCd3XJRUd1rNqeC";
const shortCode = "174379";
const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2c2c3fd3";

// ✅ Set this to your real or ngrok callback URL
const callbackURL = "https://887f-102-0-10-160.ngrok-free.app/api/callback";

// 🔐 Get Access Token
async function getAccessToken() {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  try {
    const { data } = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    return data.access_token;
  } catch (error) {
    console.error("Access Token Error:", error.response?.data || error.message);
    throw new Error("Failed to get access token");
  }
}

// ✅ Format phone number to 2547XXXXXXXX
function formatPhone(phone) {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // If it starts with 0, replace with 254
  if (cleaned.startsWith("0")) {
    return "254" + cleaned.substring(1);
  }

  // If it already starts with 254, return as-is
  if (cleaned.startsWith("254")) {
    return cleaned;
  }

  // Invalid format
  throw new Error("Invalid phone number format");
}

// 📲 STK Push Logic
async function initiateSTKPush(phone, amount) {
  try {
    const formattedPhone = formatPhone(phone);
    const token = await getAccessToken();
    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

    const stkPushRequest = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackURL,
      AccountReference: "AlphaElectricals",
      TransactionDesc: "Website Purchase",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkPushRequest,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("STK Push Error:", error.response?.data || error.message);
    throw new Error("Failed to initiate STK Push");
  }
}

module.exports = initiateSTKPush;
