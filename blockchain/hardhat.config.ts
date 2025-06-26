import { HardhatUserConfig } from "hardhat/config";
// ethers v5 연동
import "@nomiclabs/hardhat-ethers";
// Waffle/Chai 매처 연결
import "@nomiclabs/hardhat-waffle";
import "@nomicfoundation/hardhat-network-helpers";
import * as fs from 'fs-extra';
import * as path from 'path';

const adminWalletPath = path.resolve(__dirname, './config/adminWallet.json');
if (!fs.existsSync(adminWalletPath)) {
  throw new Error(
    `관리자 지갑 정보가 없습니다. \`npm run init:admin\` 을 먼저 실행하세요.`
  );
}

const { privateKey: adminPrivateKey } = fs.readJSONSync(adminWalletPath);

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",         // 컨트랙트의 pragma와 맞추세요
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,             // 최적화 정도 (기본값 200)
      },
    },
  },
  paths: {
    sources: "./contracts",    // 솔리디티 소스 위치
    tests:   "./test",         // 테스트 파일 위치
    cache:   "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: {
        accounts: [
        {
          privateKey: adminPrivateKey,
          balance:    '1000000000000000000000', // 1 000 ETH
        },
        // 필요 시 추가 테스트 계정 여기에 삽입
      ]
    },
  },
};

export default config;
