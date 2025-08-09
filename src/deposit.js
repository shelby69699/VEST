src/#!/usr/bin/env node
/*
 * deposit.js
 *
 * This script locks funds into the vesting contract.  It expects three
 * command‑line arguments: beneficiary address, amount in ADA and lock
 * duration in seconds.  The script constructs and signs a transaction
 * depositing the specified amount to the vesting contract with an
 * inline datum containing the unlock timestamp and the public key
 * hashes of the owner and beneficiary.  The transaction is then
 * submitted to the network via Blockfrost.
 *
 * Usage:
 *   node src/deposit.js <beneficiary-address> <amount-ada> <lock-seconds>
 */

import 'dotenv/config';
import fs from 'node:fs';
import { BlockfrostProvider, MeshTxBuilder, MeshWallet } from '@meshsdk/core';
import { MeshVestingContract } from '@meshsdk/contracts';

async function main() {
  const [beneficiaryAddr, amountAdaStr, lockSecondsStr] = process.argv.slice(2);
  if (!beneficiaryAddr || !amountAdaStr || !lockSecondsStr) {
    console.error('Usage: node deposit.js <beneficiary-address> <amount-ada> <lock-seconds>');
    process.exit(1);
  }

  const apiKey = process.env.BLOCKFROST_API_KEY;
  if (!apiKey) {
    throw new Error('BLOCKFROST_API_KEY not set in .env');
  }

  // Read the owner root secret key (Bech32 encoded xprv) from file or env
  let ownerKey;
  if (fs.existsSync('owner.sk')) {
    ownerKey = fs.readFileSync('owner.sk', 'utf8').trim();
  } else if (process.env.OWNER_ROOT_KEY) {
    ownerKey = process.env.OWNER_ROOT_KEY;
  } else {
    throw new Error('Owner secret key not found.  Provide owner.sk file or set OWNER_ROOT_KEY in environment');
  }

  const amountAda = Number(amountAdaStr);
  if (Number.isNaN(amountAda) || amountAda <= 0) {
    throw new Error('Amount must be a positive number of ADA');
  }
  const lockSeconds = Number(lockSecondsStr);
  if (Number.isNaN(lockSeconds) || lockSeconds <= 0) {
    throw new Error('Lock seconds must be a positive integer');
  }
  // Convert ADA to lovelace (1 ADA = 1_000_000 lovelace)
  const amount = [
    {
      unit: 'lovelace',
      quantity: (BigInt(Math.floor(amountAda * 1e6))).toString(),
    },
  ];
  // Compute unlock timestamp in milliseconds
  const lockUntilTimestampMs = Date.now() + lockSeconds * 1000;

  // Initialise Blockfrost provider
  const provider = new BlockfrostProvider(apiKey);

  // Create transaction builder
  const meshTxBuilder = new MeshTxBuilder({
    fetcher: provider,
    submitter: provider,
  });

  // Create owner wallet using the root key; networkId 1 is Cardano mainnet
  const ownerWallet = new MeshWallet({
    networkId: 1,
    key: {
      type: 'root',
      bech32: ownerKey,
    },
  });

  // Instantiate vesting contract
  const vestingContract = new MeshVestingContract({
    mesh: meshTxBuilder,
    fetcher: provider,
    wallet: ownerWallet,
    networkId: 1,
  });

  console.log('Constructing deposit transaction...');
  // Build deposit transaction (unsigned)
  const unsignedTxHex = await vestingContract.depositFund(
    amount,
    lockUntilTimestampMs,
    beneficiaryAddr,
  );
  // Sign and submit
  const signedTx = await ownerWallet.signTx(unsignedTxHex);
  const txHash = await ownerWallet.submitTx(signedTx);
  console.log('Deposit transaction submitted successfully:', txHash);
  console.log('Remember this transaction hash; it will be needed to withdraw the funds.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});deposit.js
