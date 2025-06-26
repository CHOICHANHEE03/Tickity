import { Wallet } from 'ethers';
import fs from 'fs-extra';
import path from 'path';

async function main() {
  const outPath = path.resolve(__dirname, '../config/adminWallet.json');

  // 1) 새 지갑 생성
  const wallet = Wallet.createRandom();
  console.log('🔑 생성된 관리자 지갑:', wallet.address);

  // 2) 저장 폴더(tbd)와 파일 경로 준비
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeJSON(outPath, {
    address: wallet.address,
    privateKey: wallet.privateKey
  }, { spaces: 2, mode: 0o600 });

  console.log('💾 관리자 지갑 정보 저장됨:', outPath);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
/**
ethers.Wallet.createRandom() 으로 랜덤 지갑 생성

JSON 파일(blockchain/config/adminWallet.json)에 { address, privateKey } 형태로 저장

파일 권한은 600 (소유자만 읽기/쓰기) 로 설정
 */