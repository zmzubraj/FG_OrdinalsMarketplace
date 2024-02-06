const { base64, hex } = require("@scure/base");
const btc = require("@scure/btc-signer");
const { BitcoinNetworkType } = require("sats-connect");

const getUTXOs = async (network, address) => {
  const networkSubpath = network === BitcoinNetworkType.Testnet ? "/testnet" : "";
  const url = `https://mempool.space${networkSubpath}/api/address/${address}/utxo`;
  const response = await fetch(url);
  return response.json();
};

const createPSBT = async (
  networkType,
  paymentPublicKeyString,
  ordinalsPublicKeyString,
  paymentUnspentOutputs,
  ordinalsUnspentOutputs,
  recipient1,
  recipient2
) => {
  const network = networkType === BitcoinNetworkType.Testnet ? btc.TEST_NETWORK : btc.NETWORK;
  const paymentOutput = paymentUnspentOutputs[0];
  const ordinalOutput = ordinalsUnspentOutputs[0];
  const paymentPublicKey = hex.decode(paymentPublicKeyString);
  const ordinalPublicKey = hex.decode(ordinalsPublicKeyString);
  const tx = new btc.Transaction({ allowUnknownOutputs: true });
  const p2wpkh = btc.p2wpkh(paymentPublicKey, network);
  const p2sh = btc.p2sh(p2wpkh, network);
  const p2tr = btc.p2tr(ordinalPublicKey, undefined, network);
  const fee = 300n; 
  const recipient1Amount = BigInt(Math.min(paymentOutput.value, 3000)) - fee;
  const recipient2Amount = BigInt(Math.min(ordinalOutput.value, 3000));
  const total = recipient1Amount + recipient2Amount;
  const changeAmount = BigInt(paymentOutput.value) + BigInt(ordinalOutput.value) - total - fee;

  tx.addInput({
    txid: paymentOutput.txid,
    index: paymentOutput.vout,
    witnessUtxo: {
      script: p2sh.script ? p2sh.script : Buffer.alloc(0),
      amount: BigInt(paymentOutput.value),
    },
    redeemScript: p2sh.redeemScript ? p2sh.redeemScript : Buffer.alloc(0),
    witnessScript: p2sh.witnessScript,
    sighashType: btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY,
  });

  tx.addInput({
    txid: ordinalOutput.txid,
    index: ordinalOutput.vout,
    witnessUtxo: {
      script: p2tr.script,
      amount: BigInt(ordinalOutput.value),
    },
    tapInternalKey: ordinalPublicKey,
    sighashType: btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY,
  });

  tx.addOutputAddress(recipient1, recipient1Amount, network);
  tx.addOutputAddress(recipient2, recipient2Amount, network);
  tx.addOutputAddress(recipient2, changeAmount, network);

  tx.addOutput({
    script: btc.Script.encode([
      "HASH160",
      "DUP",
      new TextEncoder().encode("SP1KSN9GZ21F4B3DZD4TQ9JZXKFTZE3WW5GXREQKX"),
    ]),
    amount: 0n,
  });

  const psbt = tx.toPSBT(0);
  const psbtB64 = base64.encode(psbt);
  return psbtB64;
};

module.exports = { getUTXOs, createPSBT };
