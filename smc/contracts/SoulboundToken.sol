// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract SoulboundERC20 is ERC20, Ownable, ReentrancyGuard, Pausable {
    using SafeMath for uint256;

    mapping(address => bool) public whitelists;
    address public catNftAddress;

    constructor(string memory name, string memory symbol, address _catNftAddress) ERC20(name, symbol) {
        catNftAddress = _catNftAddress;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override
    {
        require(from == address(0) || whitelists[from] || to == address(0) || whitelists[to], "Soulbound tokens are not transferable");
        super._beforeTokenTransfer(from, to, amount);
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == owner() || msg.sender == catNftAddress, "You do not have permission");
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }

    function addWhitelist(address account) public onlyOwner {
        whitelists[account] = true;
    }

    function withdrawNativeToken(uint256 _amount, address _receiver) external onlyOwner {
        uint balance = address(this).balance;
        require(_amount <= balance, "invalid amount");
        payable(_receiver).transfer(_amount);
    }

    function withdrawERC20Token(address _tokenAddress, uint256 _amount, address _receiver) external onlyOwner {
        IERC20 token = IERC20(_tokenAddress);
        uint balance = token.balanceOf(address(this));
        require(_amount <= balance, "Not enough balance");
        token.transfer(_receiver, _amount);
    }           
}