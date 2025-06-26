import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('SoulboundTicket', () => {
  let admin: any;
  let user: any;
  let ticketAdmin: any;
  let ticketUser: any;

  beforeEach(async () => {
    [admin, user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('SoulboundTicket', admin);

    // 1) admin 서명자로 배포
    ticketAdmin = await Factory.deploy(admin.address);
    await ticketAdmin.deployed();

    // 2) user 서명자도 명시적으로 연결
    ticketUser = ticketAdmin.connect(user);
  });

  it('mintTicket: 올바른 금액으로 mint 되고, fee가 admin에게 전송된다', async () => {
    const priceWei = ethers.utils.parseEther('0.05');
    const fee      = priceWei.mul(1).div(1000);
    const net      = priceWei.sub(fee);

    const balBefore = await admin.getBalance();
    await ticketUser.mintTicket(1, 'A-01', 'uri', priceWei, {
      value: priceWei,
    });
    const balAfter = await admin.getBalance();
    expect(balAfter.sub(balBefore)).to.equal(fee);

    expect(await ticketAdmin.ownerOf(1)).to.equal(user.address);
    const info = await ticketAdmin.tickets(1);
    expect(info.price).to.equal(net);
    expect(await ticketAdmin.tokenURI(1)).to.equal('uri');
  });

  it('approve, transfer가 불가능해야 한다', async () => {
    const priceWei = ethers.utils.parseEther('0.05');
    await ticketUser.mintTicket(2, 'B-02', 'uri2', priceWei, {
      value: priceWei,
    });

    await expect(
      ticketUser.approve(user.address, 2)
    ).to.be.revertedWith('SBT: approval disabled');
    await expect(
      ticketUser.transferFrom(user.address, admin.address, 2)
    ).to.be.revertedWith('SBT: transfer disabled');
  });

  it('onlyOwner 역할 함수들(registerFaceHash → markFaceVerified → markAsUsed) 동작 확인', async () => {
    const priceWei = ethers.utils.parseEther('0.05');
    await ticketUser.mintTicket(3, 'C-03', 'uri3', priceWei, {
      value: priceWei,
    });

    // 일반 사용자는 실패
    await expect(
      ticketUser.registerFaceHash(1, ethers.utils.formatBytes32String('h'))
    ).to.be.revertedWith('Ownable: caller is not the owner');

    // owner만 성공
    await ticketAdmin.registerFaceHash(1, ethers.utils.formatBytes32String('h'));
    await ticketAdmin.markFaceVerified(1);
    await ticketAdmin.markAsUsed(1);

    const t = await ticketAdmin.tickets(1);
    expect(t.isFaceVerified).to.be.true;
    expect(t.isUsed).to.be.true;
  });
});
