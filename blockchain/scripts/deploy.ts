import { ethers } from "hardhat";
import * as fs from "fs-extra";
import * as path from "path";

async function main() {
  // 1) 관리자 지갑 주소 로드
  const adminWalletPath = path.resolve(__dirname, "../config/adminWallet.json");
  if (!fs.existsSync(adminWalletPath)) {
    throw new Error(
      `관리자 지갑 정보를 찾을 수 없습니다. 먼저 'npm run init:admin' 을 실행하세요: ${adminWalletPath}`
    );
  }
  const { address: adminAddress } = await fs.readJSON(adminWalletPath);

  // 2) 컨트랙트 팩토리 생성
  const Factory = await ethers.getContractFactory("SoulboundTicket");

  // 3) 배포
  console.log(`📦 SoulboundTicket 배포 시작 (admin: ${adminAddress})`);
  const contract = await Factory.deploy(adminAddress);
  await contract.deployed();

  // 4) 배포 주소 출력
  console.log(`✅ SoulboundTicket 배포 완료: ${contract.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
