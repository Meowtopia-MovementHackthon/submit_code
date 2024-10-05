//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC1155} from "@openzeppelin/contracts/interfaces/IERC1155.sol";

interface IMaterialItem is IERC1155 {
    function mint(address to, uint256 id, uint256 amount, bytes memory data) external;
    function setLandContract(address _landContract) external;
}