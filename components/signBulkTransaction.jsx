import { useState } from "react";
import { BitcoinNetworkType, signMultipleTransactions } from "sats-connect";
import * as btc from "@scure/btc-signer";
import { createPSBT, getUTXOs } from "../app/utils";

const SignBulkTransaction = ({
  network,
  ordinalsAddress,
  paymentAddress,
  paymentPublicKey,
  ordinalsPublicKey,
  capabilities,
}) => {
  const [loading, setLoading] = useState(false);

  const onSignBulkTransactionClick = async () => {
    setLoading(true);

    try {
      const [paymentUnspentOutputs, ordinalsUnspentOutputs] = await Promise.all([
        getUTXOs(network, paymentAddress),
        getUTXOs(network, ordinalsAddress),
      ]);

      let canContinue = true;

      if (paymentUnspentOutputs.length === 0) {
        alert("No unspent outputs found for payment address");
        canContinue = false;
      }

      if (ordinalsUnspentOutputs.length === 0) {
        alert("No unspent outputs found for ordinals address");
        canContinue = false;
      }

      if (paymentUnspentOutputs.length < 3) {
        alert("Not enough unspent outputs found for payment address");
        canContinue = false;
      }

      if (ordinalsUnspentOutputs.length < 3) {
        alert("Not enough unspent outputs found for ordinals address");
        canContinue = false;
      }

      if (!canContinue) {
        setLoading(false);
        return;
      }

      const outputRecipient1 = ordinalsAddress;
      const outputRecipient2 = paymentAddress;

      const psbtsBase64 = await Promise.all([
        createPSBT(network, paymentPublicKey, ordinalsPublicKey, paymentUnspentOutputs, ordinalsUnspentOutputs, outputRecipient1, outputRecipient2),
        createPSBT(network, paymentPublicKey, ordinalsPublicKey, paymentUnspentOutputs.slice(1), ordinalsUnspentOutputs.slice(1), outputRecipient1, outputRecipient2),
        createPSBT(network, paymentPublicKey, ordinalsPublicKey, paymentUnspentOutputs.slice(2), ordinalsUnspentOutputs.slice(2), outputRecipient1, outputRecipient2)
      ]);

      await signMultipleTransactions({
        payload: {
          network: {
            type: network,
          },
          message: "Sign Transaction",
          psbts: psbtsBase64.map((psbtBase64) => ({
            psbtBase64,
            inputsToSign: [
              {
                address: paymentAddress,
                signingIndexes: [0],
                sigHash: btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY,
              },
              {
                address: ordinalsAddress,
                signingIndexes: [1],
                sigHash: btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY,
              },
            ],
          }))
        },
        onFinish: (response) => {
          console.log('Bulk tx signing response:', response);
          setLoading(false);
        },
        onCancel: () => {
          alert("Canceled");
          setLoading(false);
        },
      });
    } catch (error) {
      console.error('Error signing bulk transaction:', error);
      setLoading(false);
    }
  };

  if (!capabilities.has("signMultipleTransactions")) {
    return (
      <div className="container">
        <h3>Sign transaction</h3>
        <b>The wallet does not support this feature</b>
      </div>
    );
  }

  return (
    <div className="container">
      <h3>Sign bulk transaction</h3>
      <p>
        Creates a PSBT sending the first, second and third UTXO from each of the payment and
        ordinal addresses to the other address, with the change going to the
        payment address.
      </p>
      <div>
        <button disabled={loading} onClick={onSignBulkTransactionClick}>
          {loading ? 'Signing...' : 'Sign Bulk Transaction'}
        </button>
      </div>
    </div>
  );
};

export default SignBulkTransaction;
