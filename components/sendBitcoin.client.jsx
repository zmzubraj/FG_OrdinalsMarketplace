'use client';
import { useState } from "react";
import { sendBtcTransaction } from "sats-connect";

const SendBitcoin = ({ network, address, capabilities }) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(BigInt(0));

  const onSendBtcClick = async () => {
    await sendBtcTransaction({
      payload: {
        network: {
          type: network,
        },
        recipients: [
          {
            address: recipient,
            amountSats: amount,
          },
          // you can add more recipients here
        ],
        senderAddress: address,
      },
      onFinish: (response) => {
        alert(response);
      },
      onCancel: () => alert("Canceled"),
    });
  };

  if (network !== "Testnet") {
    return (
      <div className="container">
        <h3>Send Bitcoin</h3>
        <div>Only available on testnet</div>
      </div>
    );
  }

  if (!capabilities.has("sendBtcTransaction")) {
    return (
      <div className="container">
        <h3>Send Bitcoin</h3>
        <b>The wallet does not support this feature</b>
      </div>
    );
  }

  const sendDisabled = recipient.length === 0;

  return (
    <div className="container">
      <h3>Send Bitcoin</h3>
      <p>
        <b>From address</b>
        <br />
        {address}
      </p>
      <p>
        <b>Recipient address</b>
        <br />
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </p>
      <p>
        <b>Send amount</b>
        <br />
        <input
          type="number"
          value={amount.toString()}
          onChange={(e) => setAmount(BigInt(e.target.value))}
        />
      </p>
      <button onClick={onSendBtcClick} disabled={sendDisabled}>
        Send BTC Transaction
      </button>
    </div>
  );
};

export default SendBitcoin;
