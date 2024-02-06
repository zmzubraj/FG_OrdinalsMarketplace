'use client';
import React, { useState } from 'react';
import { BitcoinNetworkType, createRepeatInscriptions } from 'sats-connect';

const CreateRepeatInscriptions = ({ network, capabilities }) => {
  const [suggestedMinerFeeRate, setSuggestedMinerFeeRate] = useState(8);

  const [content, setContent] = useState(
    '{"p":"brc-20","op":"mint","tick":"doge","amt":"4200"}'
  );
  const [contentType, setContentType] = useState('application/json');
  const [repeat, setRepeat] = useState('12');
  const onCreateClick = async () => {
    try {
      await createRepeatInscriptions({
        payload: {
          network: {
            type: network,
          },
          repeat: Number(repeat),
          contentType,
          content,
          payloadType: 'PLAIN_TEXT',
          suggestedMinerFeeRate,
        },
        onFinish: (response) => {
          alert(response.txId);
        },
        onCancel: () => alert('Canceled'),
      });
    } catch (error) {
      alert(`An error ocurred: ${error.message}`);
    }
  };

  if (!capabilities.has('createRepeatInscriptions')) {
    return (
      <div className="container">
        <h3>Create repeat inscriptions</h3>
        <b>The wallet does not support this feature. Please update your wallet</b>
      </div>
    );
  }

  return (
    <div className="container">
      <h3>Create repeat inscriptions</h3>
      <p>
        Creates a repeat inscription with the desired text and content type. The
        inscription will be sent to your ordinals address.
      </p>
      <p>
        A service fee and service fee address can be added to the inscription
        request as part of the payload if desired.
      </p>
      <div>
        <p>
          <b>Repeat</b>
          <br />
          <input
            type="number"
            min={1}
            max={24}
            step={1}
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
          />
        </p>
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

export default CreateRepeatInscriptions;
