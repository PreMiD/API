var braintree = require("braintree");

var gateway = new braintree.BraintreeGateway({
	environment: braintree.Environment.Sandbox,
	merchantId: process.env.BrainTree_Merchant_Id,
	publicKey: process.env.BrainTree_Public_Key,
	privateKey: process.env.BrainTree_Private_Key,
});

gateway.transaction.sale(
	{
		amount: "5.00",
		paymentMethodNonce: "nonce-from-the-client",
		options: {
			submitForSettlement: true,
		},
	},
	function (err, result) {
		if (err) {
			console.error(err);
			return;
		}

		if (result.success) {
			console.log("Transaction ID: " + result.transaction.id);
		} else {
			console.error(result.message);
		}
	}
);
