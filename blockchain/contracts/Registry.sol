// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Registry
/// @notice 역할 기반 접근제어 예시: DEFAULT_ADMIN_ROLE 과 ADMIN_ROLE 설정
contract Registry is AccessControl {
    /// @dev 운영자 권한(Role) 식별자
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /// @param admin 첫 번째 관리자 주소 (DEFAULT_ADMIN_ROLE, ADMIN_ROLE 동시 부여)
    constructor(address admin) {
        // 1) 유효한 주소인지 체크
        require(admin != address(0), unicode"관리자 주소가 필요합니다");

        // 2) DEFAULT_ADMIN_ROLE(=0x00) 부여
        _grantRole(DEFAULT_ADMIN_ROLE, admin);

        // 3) ADMIN_ROLE 부여
        _grantRole(ADMIN_ROLE, admin);

        // 4) ADMIN_ROLE 의 관리자 역할을 DEFAULT_ADMIN_ROLE 로 설정
        _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
    }

    /// @notice ADMIN_ROLE만 호출 가능한 예시 함수
    function doAdminTask() external onlyRole(ADMIN_ROLE) {
        // 운영자 전용 로직
    }

    /// @notice 누구나 호출 가능하지만, DEFAULT_ADMIN_ROLE만 grant/revoke 할 수 있도록 예시
    function changeAdmin(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newAdmin != address(0), unicode"새 관리자 주소가 필요합니다");
        // 기존 운영자 권한 회수
        _revokeRole(ADMIN_ROLE, msg.sender);
        // 새 운영자 권한 부여
        _grantRole(ADMIN_ROLE, newAdmin);
    }
}
