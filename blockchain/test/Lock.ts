import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Lock', () => {
  let lock: any;
  let owner: any;
  let nonOwner: any;
  const ONE_DAY = 24 * 60 * 60;

  beforeEach(async () => {
    [owner, nonOwner] = await ethers.getSigners();
    // ① on-chain 현재 시간 조회
    const now = (await ethers.provider.getBlock('latest')).timestamp;
    const unlockTime = now + ONE_DAY;

    const Factory = await ethers.getContractFactory('Lock', owner);
    lock = await Factory.deploy(unlockTime, {
      value: ethers.utils.parseEther('1'),
    });
    await lock.deployed();
  });

  it('constructor: unlockTime은 미래여야 한다', async () => {
    // 생성자 실패 케이스도 on-chain 시간 기준
    const { timestamp: now } = await ethers.provider.getBlock('latest');
    await expect(
      (await ethers.getContractFactory('Lock')).deploy(now - 1, {
        value: ethers.utils.parseEther('1'),
      })
    ).to.be.revertedWith('Unlock time should be in the future');
  });

  it('constructor: 예치한 ETH가 컨트랙트에 쌓인다', async () => {
    const bal = await ethers.provider.getBalance(lock.address);
    expect(bal).to.equal(ethers.utils.parseEther('1'));
  });

  describe('withdraw', () => {
    it('unlockTime 이전에는 출금 불가', async () => {
      await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet");
    });

    it('unlockTime 이후 소유자는 인출 가능', async () => {
      await ethers.provider.send('evm_increaseTime', [ONE_DAY + 1]);
      await ethers.provider.send('evm_mine', []);
      await expect(lock.withdraw())
        .to.emit(lock, 'Withdrawal')
        .withArgs(await owner.getAddress(), ethers.utils.parseEther('1'));
    });

    it('unlockTime 이후 소유자가 아니면 출금 불가', async () => {
      await ethers.provider.send('evm_increaseTime', [ONE_DAY + 1]);
      await ethers.provider.send('evm_mine', []);
      await expect(lock.connect(nonOwner).withdraw()).to.be.revertedWith(
        "You aren't the owner"
      );
    });
  });
});
