import { useState } from "react";
import { createInscription } from "sats-connect";

const CreateTextInscription = ({ network, capabilities }) => {
  const [suggestedMinerFeeRate, setSuggestedMinerFeeRate] = useState(8);
  const [content, setContent] = useState(`<html>...</html>`);
  const [contentType, setContentType] = useState("text/html");

  const onCreateClick = async () => {
    try {
      await createInscription({
        payload: {
          network: {
            type: network,
          },
          contentType,
          content,
          payloadType: "PLAIN_TEXT",
          suggestedMinerFeeRate,
        },
        onFinish: (response) => {
          alert(response.txId);
        },
        onCancel: () => alert("Canceled"),
      });
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
    }
  };

  if (!capabilities.has("createInscription")) {
    return (
      <div className="container">
        <h3>Create file inscription</h3>
        <b>The wallet does not support this feature</b>
      </div>
    );
  }

  return (
    <div className="container">
      <h3>Create text inscription</h3>
      <p>
        Creates an inscription with the desired text and content type. The
        inscription will be sent to your ordinals address.
      </p>
      <p>
        A service fee and service fee address can be added to the inscription
        request as part of the payload if desired.
      </p>
      <div>
        <p>
          <b>Content type</b>
          <br />
          <input
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          />
        </p>
        <p>
          <b>Content</b>
          <br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </p>
        <p>
          <b>Fee rate</b>
          <br />
          <input
            value={suggestedMinerFeeRate}
            onChange={(e) => {
              const newFeeRate = Number(e.target.value);
              setSuggestedMinerFeeRate(
                Number.isNaN(newFeeRate) ? 0 : newFeeRate
              );
            }}
          />
        </p>
        <button onClick={onCreateClick}>Create inscription</button>
      </div>
    </div>
  );
};

export default CreateTextInscription;
