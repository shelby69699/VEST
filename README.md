# Vesting Smart Contract on Cardano

This repository contains a working vesting contract for the Cardano blockchain based on the [MeshJS vesting contract](https://meshjs.dev/smart-contracts/vesting) and the accompanying open source implementation in the MeshJS repository.  A vesting contract allows an owner to lock funds for a beneficiary until a given timestamp.  The owner can always recover the funds, but the beneficiary may only claim them after the lock up period has expired.

## Repository structure

The project is organised into two parts:

| Path                       | Purpose                                                                      |
| ------------------------- | ----------------------------------------------------------------------------- |
| `aiken/`                  | Contains the on‑chain code for the vesting contract and its compiled blueprint.  The `validators/vesting.ak` file implements the validator logic and `lib/vesting/types.ak` defines the datum used by the validator.  `plutus.json` is the CIP‑0057 blueprint containing the compiled Plutus V2 script. |
| `src/`                    | Off‑chain scripts for interacting with the contract.  They demonstrate how to deposit funds into the contract and how to withdraw locked funds. |
| `.env`                    | Configuration file holding your Blockfrost API key.  This repository already contains the mainnet key provided by the user.  **Never commit secret keys to public repositories in production.** |
| `owner.addr`              | Bech32 address of the contract owner.  When depositing funds the owner uses this address to pay fees and provide collateral. |

## On‑chain code (Aiken)

The on‑chain validator is written in [Aiken](https://aiken-lang.org/) and can be found in `aiken/validators/vesting.ak`.  It defines a datum type containing three fields:

1. `lock_until` – POSIX timestamp in milliseconds specifying when the funds become claimable by the beneficiary.
2. `owner` – public key hash of the owner.
3. `beneficiary` – public key hash of the beneficiary.

The validator allows spending the locked UTxO if **either** of the following conditions hold:

* The transaction is signed by the owner (allowing the owner to reclaim the funds at any time)【72387169569321†L231-L242】.
* The transaction is signed by the beneficiary **and** the current slot is after the `lock_until` timestamp【190119097908062†L486-L500】.  Time is enforced via the transaction’s validity interval.

The compiled validator is included as a CIP‑0057 blueprint in `aiken/plutus.json`【147289029598871†L27-L40】.  If you wish to recompile the contract yourself you’ll need to install the [Aiken compiler](https://aiken-lang.org/) and run `aiken build` inside the `aiken/` directory.

## Off‑chain scripts (Node.js)

The `src` directory contains two Node scripts demonstrating how to interact with the vesting contract using the [@meshsdk](https://github.com/MeshJS/mesh) libraries:

* **`deposit.js`** – Locks a specified amount of ADA in the vesting contract for a beneficiary until a future timestamp.  The script constructs the transaction, signs it with the owner’s key and submits it to the network.  Usage:

  ```sh
  node src/deposit.js <beneficiary-address> <amount-in-ADA> <lock-seconds>
  ```

  For example, to lock 5 ADA for one hour:

  ```sh
  node src/deposit.js addr1... 5 3600
  ```

* **`withdraw.js`** – Withdraws funds from the vesting contract.  Given the deposit transaction hash it looks up the UTxO at the contract, constructs the spending transaction, signs it with the beneficiary’s key and submits it.  Usage:

  ```sh
  node src/withdraw.js <deposit-tx-hash>
  ```

These scripts rely on the `@meshsdk/core` and `@meshsdk/contracts` packages.  Install dependencies with:

```sh
npm install @meshsdk/core @meshsdk/contracts dotenv
```

> **Note:** NPM installations may require access to the public registry.  If your environment restricts outbound network access you can copy the relevant packages from the [MeshJS GitHub repository](https://github.com/MeshJS/mesh/).

## Configuration

The `.env` file stores the Blockfrost API key.  The default value is the mainnet key provided by the user:

```
BLOCKFROST_API_KEY=mainnetRphtobeMUfaH1ulbeDPsDntux1ESWh9r
```

The `owner.addr` file contains the bech32 address of the contract owner:

```
addr1qy7y5lp0r2xk2k8tcmv3h5jvth2zw7r2ml2qrjy7c0pa6h064lgvr0hm0vruvtgw2wcv9f0wj0dax3ktzlsedregg6fsg3dhpl
```

You should create a corresponding `owner.sk` file containing the owner’s root signing key in [Bech32](https://cips.cardano.org/cip/cip8/) format.  This secret key is necessary to sign transactions.  Never commit secret keys to a public repository.

Similarly, the beneficiary must have their own signing key available locally when running `withdraw.js`.

## Running the examples

1. Copy your Blockfrost API key into `.env` and ensure the `owner.addr` and `owner.sk` files are present.  Generate keys with `@meshsdk/core` or any Cardano wallet.
2. Install dependencies: `npm install`.
3. Lock funds into the contract using `deposit.js`.  Record the returned transaction hash.
4. After the lock period expires (or immediately if you are the owner), unlock funds using `withdraw.js` and the recorded transaction hash.

These scripts illustrate a simple way to interact with the vesting contract off‑chain; you are free to integrate the validator in your own dApp or backend.
