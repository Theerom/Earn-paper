const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.handleMyLeadReward = functions.https.onRequest(async (req, res) => {
  try {
    // MyLead sends these parameters in their postback
    const {
      user_id, // Your user ID
      reward, // Amount to be credited
      status // Transaction status
    } = req.query;

    // Basic validation
    if (!user_id || !reward || status !== "completed") {
      res.status(400).send("Invalid parameters");
      return;
    }

    // Update user's credits in Firestore
    const userRef = db.collection("users").doc(user_id);
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const currentCredits = userDoc.data().credits || 0;
      const newCredits = currentCredits + parseFloat(reward);
      
      transaction.update(userRef, {
        credits: newCredits,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error processing reward:", error);
    res.status(500).send("Internal server error");
  }
});
