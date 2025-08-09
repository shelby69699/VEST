#!/usr/bin/env node
/*
 * withdraw.js
 *
 * This script unlocks funds from the vesting contract.  Provide the deposit
 * transaction hash as the sole argument.  The script fetches the UTxO
 * locked in the contract, constructs a spending transaction, signs it with
 * the beneficiary’s secret key and submits it to the network.
 *
 * Usage:
 *   node src/withdraw.js <deposit-tx-hash>
 */

import 'dotenv/config';
import fs from 'node:fs';
import { BlockfrostProvider, MeshTxBuilder, MeshWallet } from '@meshsdk/core';
import { MeshVestingContract } from '@meshsdk/contracts';

async function main() {
  const [txHash] = process.argv.slice(2);
  if (!txHash) {
    console.error('Usage: node withdraw.js <deposit-tx-hash>');
    process.exit(1);
  }
  const apiKey = process.env.BLOCKFROST_API_KEY;
  if (!apiKey) {
    throw new Error('BLOCKFROST_API_KEY not set in .env');
  }
  // Read beneficiary secret key from file or env
  let beneficiaryKey;
  if (fs.existsSync('beneficiary.sk')) {
    beneficiaryKey = fs.readFileSync('beneficiary.sk', 'utf8').trim();
  } else if (process.env.BENEFICIARY_ROOT_KEY) {
    beneficiaryKey = process.env.BENEFICIARY_ROOT_KEY;
  } else {
    throw new Error('Beneficiary secret key not found.  Provide beneficiary.sk file or set BENEFICIARY_ROOT_KEY in environment');
  }
  // Initialise provider and tx builder
  const provider = new BlockfrostProvider(apiKey);
  const meshTxBuilder = new MeshTxBuilder({
    fetcher: provider,
    submitter: provider,
  });
  const beneficiaryWallet = new MeshWallet({
    networkId: 1,
    key: {
      type: 'root',
      bech32: beneficiaryKey,
    },
  });
  // Instantiate contract
  const vestingContract = new MeshVestingContract({
    mesh: meshTxBuilder,
    fetcher: provider,
    wallet: beneficiaryWallet,
    networkId: 1,
  });
  // Fetch UTxO locked at contract address by deposit
  console.log('Looking up UTxO from deposit transaction...');
  const utxo = await vestingContract.getUtxoByTxHash(txHash);
  if (!utxo) {
    throw new Error('UTxO not found for transaction hash: ' + txHash);
  }
  console.log('Constructing withdrawal transaction...');
  // Build withdrawal transaction (unsigned)
  const unsignedTxHex = await vestingContract.withdrawFund(utxo);
  // Sign and submit
  const signedTx = await beneficiaryWallet.signTx(unsignedTxHex);
  const withdrawalHash = await beneficiaryWallet.submitTx(signedTx);
  console.log('Withdrawal transaction submitted successfully:', withdrawalHash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
