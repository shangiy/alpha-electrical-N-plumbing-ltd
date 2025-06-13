const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.get("/verify/:ref", async (req, res) => {
  const reference = req.params.ref;
  try {
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });
    const data = await verifyRes.json();

    if (data.data.status === "success") {
      console.log("✅ Payment Verified:", data.data);
      res.json({ status: "Success", details: data.data });
    } else {
      console.log("❌ Payment Failed or Incomplete:", data.data);
      res.json({ status: "Failed", details: data.data });
    }
  } catch (err) {
    console.error("Error verifying transaction:", err.message);
    res.status(500).json({ status: "Error", message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
