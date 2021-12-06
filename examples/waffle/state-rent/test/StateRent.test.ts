import { Signer, TestAccountSigningKey, evmChai } from '@acala-network/bodhi';
import { createTestPairs } from '@polkadot/keyring/testingPairs';
import { expect, use } from 'chai';
import { deployContract, solidity } from 'ethereum-waffle';
import { Contract, BigNumber } from 'ethers';
import StateRent from '../build/StateRent.json';
import ADDRESS from '@acala-network/contracts/utils/Address';
import { getTestProvider } from '../../utils';

use(solidity);
use(evmChai);

const provider = getTestProvider();

const testPairs = createTestPairs();

const formatAmount = (amount: String) => {
  return amount.replace(/_/g, '');
};

const transfer = async (contract: string, new_maintainer: string) => {
  return new Promise((resolve) => {
    provider.api.tx.evm.transferMaintainer(contract, new_maintainer).signAndSend(testPairs.alice.address, (result) => {
      if (result.status.isFinalized || result.status.isInBlock) {
        resolve(undefined);
      }
    });
  });
};

describe('StateRent', () => {
  let wallet: Signer;
  let walletTo: Signer;
  let stateRent: Contract;

  before(async () => {
    [wallet, walletTo] = await provider.getWallets();
    stateRent = await deployContract(wallet as any, StateRent);
  });

  after(async () => {
    provider.api.disconnect();
  });

  it('stateRent works', async () => {
    if (!process.argv.includes('--with-ethereum-compatibility')) {
      expect((await stateRent.newContractExtraBytes()).toString()).to.equal(formatAmount('10_000'));

      expect((await stateRent.storageDepositPerByte()).toString()).to.equal(formatAmount('100_000_000_000_000'));

      expect((await stateRent.developerDeposit()).toString()).to.equal(formatAmount('1_000_000_000_000_000_000'));

      expect((await stateRent.deploymentFee()).toString()).to.equal(formatAmount('1_000_000_000_000_000_000'));

      await provider.api.tx.evm.deploy(stateRent.address).signAndSend(testPairs.alice.address);
    } else {
      expect(await stateRent.newContractExtraBytes()).to.equal(0);

      expect(await stateRent.storageDepositPerByte()).to.equal(0);

      expect(await stateRent.developerDeposit()).to.equal(0);

      expect(await stateRent.deploymentFee()).to.equal(0);
    }

    expect(await stateRent.maintainerOf(stateRent.address)).to.equal(await wallet.getAddress());

    // The contract created by the user cannot be transferred through the contract,
    // only through the evm dispatch call `transfer_maintainer`.
    await expect(stateRent.transferMaintainer(stateRent.address, await walletTo.getAddress())).to.be.reverted;

    await transfer(stateRent.address, await walletTo.getAddress());

    expect(await stateRent.maintainerOf(stateRent.address)).to.equal(await walletTo.getAddress());
  });
});
