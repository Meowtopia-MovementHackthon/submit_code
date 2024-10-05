// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "../interfaces/IERC404.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title MockMarketplace
 * WARNING: use only for testing and debugging purpose
 */
contract MockMarketplace is Initializable, ReentrancyGuardUpgradeable, OwnableUpgradeable, PausableUpgradeable {
    uint256 mockTime;

    function setCurrentTime(uint256 _time) external {
        mockTime = _time;
    }

    function getCurrentTime() internal view virtual returns (uint256) {
        return mockTime; //block.timestamp;
    }

    using SafeMath for uint256;
    uint256 public index; //auction index

    uint256 private listingFee;
    uint256 private cancelFee;
    uint256 private tradingFeeRate; // percentage
    uint256 public MAX_ROYALTY_FEE;
    uint256 public MIN_ROYALTY_FEE;
    mapping(address => uint256) private royaltyFeeRates; // percentage
    mapping(address => address) private royaltyReceivers; // royalty receiver of collection
    mapping(address => uint256) private minSlips; // mininum slip of collection
    mapping(address => address) private collectionOwners; // owner of collection

    function initialize(uint256 _tradingFeeRate, uint256 _listingFee, uint256 _cancelFee) initializer public {
        tradingFeeRate = _tradingFeeRate;
        listingFee = _listingFee;
        cancelFee = _cancelFee;

        index = 0;
        listingFee = 0.001 ether;
        cancelFee = 0.001 ether;
        MAX_ROYALTY_FEE = 10;
        MIN_ROYALTY_FEE = 0;
        mockTime = 0;
        _marketItemIds = 0;

        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
    }

    function pause() public virtual whenNotPaused onlyOwner {
        super._pause();
    }

    function unpause() public virtual whenPaused onlyOwner {
        super._unpause();
    }

    function setTradingFeeRate(uint256 _tradingFeeRate) external onlyOwner whenNotPaused {
        tradingFeeRate = _tradingFeeRate;
    }

    function getTradingFeeRate() public view returns (uint256) {
        return tradingFeeRate;
    }

    function setListingFee(uint256 _listingFee) external onlyOwner whenNotPaused {
        listingFee = _listingFee;
    }

    function getListingFee() public view returns (uint256) {
        return listingFee;
    }

    function setCancelFee(uint256 _cancelFee) external onlyOwner whenNotPaused {
        cancelFee = _cancelFee;
    }

    function getCancelFee() public view returns (uint256) {
        return cancelFee;
    }

    function setRoyaltyConfig(address _nftContractAddress,uint256 _royaltyFeeRate, address _royaltyReceiver) external whenNotPaused {
        require(collectionOwners[_nftContractAddress] == msg.sender || msg.sender == owner(), "Caller is not the owner of the NFT collection or owner of the contract");
        require(_royaltyFeeRate >= MIN_ROYALTY_FEE && _royaltyFeeRate <= MAX_ROYALTY_FEE, "Invalid royalty fee rate");
        royaltyFeeRates[_nftContractAddress] = _royaltyFeeRate;
        royaltyReceivers[_nftContractAddress] = _royaltyReceiver;
    }

    function setRoyaltyFeeRate(address _nftContractAddress, uint256 _royaltyFeeRate) external whenNotPaused {
        require(collectionOwners[_nftContractAddress] == msg.sender || msg.sender == owner(), "Caller is not the owner of the NFT collection or owner of the contract");
        require(_royaltyFeeRate >= MIN_ROYALTY_FEE && _royaltyFeeRate <= MAX_ROYALTY_FEE, "Invalid royalty fee rate");
        royaltyFeeRates[_nftContractAddress] = _royaltyFeeRate;
    }
    function getRoyaltyFeeRate(address _nftContractAddress) public view returns (uint256) {
        return royaltyFeeRates[_nftContractAddress];
    }

    function setMaxRoyaltyFee(uint256 _maxRoyaltyFee) external onlyOwner whenNotPaused {
        MAX_ROYALTY_FEE = _maxRoyaltyFee;
    }

    function getMaxRoyaltyFee() public view returns (uint256) {
        return MAX_ROYALTY_FEE;
    }

    function setMinRoyaltyFee(uint256 _minRoyaltyFee) external onlyOwner whenNotPaused {
        MIN_ROYALTY_FEE = _minRoyaltyFee;
    }

    function getMinRoyaltyFee() public view returns (uint256) {
        return MIN_ROYALTY_FEE;
    }

    function setMinSlip(address _nftContractAddress, uint256 _minSlip) external whenNotPaused {
        require(collectionOwners[_nftContractAddress] == msg.sender || msg.sender == owner(), "Caller is not the owner of the NFT collection or owner of the contract");
        minSlips[_nftContractAddress] = _minSlip;
    }

    function getMinSlip(address _nftContractAddress) public view returns (uint256) {
        return minSlips[_nftContractAddress];
    }

    function setCollectionOwner(address _nftContractAddress, address _owner) external onlyOwner whenNotPaused {
        collectionOwners[_nftContractAddress] = _owner;
    }

    function _withdraw(address receiver, uint256 amount) internal{
        uint balance = address(this).balance;
        require(amount <= balance, "Not enough balance");  
        payable(receiver).transfer(amount);
    } 

    function withdrawNativeToken(uint256 _amount, address _receiver) external onlyOwner whenNotPaused {
        uint balance = address(this).balance;
        require(_amount <= balance,"transfer failed");
        payable(_receiver).transfer(_amount);
    }

    function witdhrawERC20Token(address _tokenAddress, uint256 _amount, address _receiver) external onlyOwner {
        IERC404 token = IERC404(_tokenAddress);
        uint balance = token.balanceOf(address(this));
        require(_amount <= balance, "Not enough balance");
        token.erc20TransferFrom(address(this),_receiver, _amount);
    }           

    function withdrawERC721Token(address _tokenAddress, uint256 _tokenId, address _receiver) external onlyOwner {
        IERC404 token = IERC404(_tokenAddress);
        token.erc721TransferFrom(address(this),_receiver, _tokenId);
    }

    function witdhrawERC20DefaultToken(address _tokenAddress,uint256 _amount,address _receiver) external onlyOwner{
        IERC20 token = IERC20(_tokenAddress);
        uint balance = token.balanceOf(address(this));
        require(_amount <= balance, "Not enough balance");
        token.transfer(_receiver, _amount);
    }

    function withdrawERC721DefaultToken(address _tokenAddress,uint256 _tokenId,address _receiver) external onlyOwner{
        IERC721 token = IERC721(_tokenAddress);
        token.transferFrom(address(this), _receiver, _tokenId);
    }

    // Structure to define auction properties
    struct Auction {
        uint256 index; // Auction Index
        address addressNFTCollection; // Address of the ERC721 NFT Collection contract
        uint256 nftId; // NFT Id
        uint256 amount; // amount of the NFT <= 1 * 10 ** decimal
        address creator; // Creator of the Auction
        address payable currentBidOwner; // Address of the highest bider
        uint256 currentBidPrice; // Current highest bid for the auction
        uint256 endAuction; // Timestamp for the end day&time of the auction
        uint256 bidCount; // Number of bid placed on the auction
        bool isClaimed;
    }

    // Array will all auctions
    Auction[] private allAuctions;

    // Public event to notify that a new auction has been created
    event NewAuction(
        uint256 index,
        address addressNFTCollection,
        uint256 nftId,
        uint256 amount,
        address creator,
        address currentBidOwner,
        uint256 currentBidPrice,
        uint256 endAuction,
        uint256 bidCount
    );

    // Public event to notify that a new bid has been placed
    event NewBidOnAuction(uint256 auctionIndex,address nftContract, uint256 nftId,uint256 amount, uint256 newBid, address newBidOwner);

    // Public event to notif that winner of an
    // auction claim for his reward
    event NFTClaimed(uint256 auctionIndex, address nftContract, uint256 nftId,uint256 amount, address claimedBy);

    // Public event to notify that the creator of
    // an auction claimed for his money
    event TokensClaimed(uint256 auctionIndex, address nftContract, uint256 nftId,uint256 amount, address claimedBy);

    // Public event to notify that an NFT has been refunded to the
    // creator of an auction
    event NFTRefunded(uint256 auctionIndex,address nftContract, uint256 nftId,uint256 amount, address claimedBy);

    /**
     * Create a new auction of a specific NFT
     * @param _addressNFTCollection address of the ERC721 NFT collection contract
     * @param _nftId Id of the NFT for sale
     * @param _amount amount of the NFT for sale
     * @param _initialBid Inital bid decided by the creator of the auction
     * @param _endAuction Timestamp with the end date and time of the auction
     */
    function createAuction(
        address _addressNFTCollection,
        uint256 _nftId,
        uint256 _amount,
        uint256 _initialBid,
        uint256 _endAuction
    ) external payable nonReentrant whenNotPaused returns (uint256){
        // Check if the endAuction time is valid
        require(_endAuction > getCurrentTime(), "Invalid end date for auction");
        require(msg.value == listingFee, "Price must be equal to listing price");

        // Check if the initial bid price is > 0
        require(_initialBid > 0, "Invalid initial bid price");
        require(SafeMath.mod(_amount, minSlips[_addressNFTCollection]) == 0, "Invalid amount");

        // Get NFT collection contract
        IERC404 nftCollection = IERC404(_addressNFTCollection);

        // Make sure the sender that wants to create a new auction
        // for a specific NFT is the owner of this NFT
        if(_amount > 0 && _amount < 1 * 10 ** nftCollection.decimals()){
            // send erc20 token to smart contract
            nftCollection.erc20TransferFrom(msg.sender, address(this), _amount);
        }else if(_amount == 1 * 10 ** nftCollection.decimals()){
            // send erc721 token to smart contract
            nftCollection.erc721TransferFrom(msg.sender, address(this), _nftId);
        }else {
            revert("Invalid amount");
        }

        // Casting from address to address payable
        address payable currentBidOwner = payable(address(0));
        // Create new Auction object
        Auction memory newAuction = Auction({
            index: index,
            addressNFTCollection: _addressNFTCollection,
            nftId: _nftId,
            amount: _amount,
            creator: msg.sender,
            currentBidOwner: currentBidOwner,
            currentBidPrice: _initialBid,
            endAuction: _endAuction,
            bidCount: 0,
            isClaimed: false
        });

        //update list
        allAuctions.push(newAuction);

        // increment auction sequence
        index++;

        // Trigger event and return index of new auction
        emit NewAuction(
            index,
            _addressNFTCollection,
            _nftId,
            _amount,
            msg.sender,
            currentBidOwner,
            _initialBid,
            _endAuction,
            0
        );
        return index;
    }

    /**
     * Check if an auction is open
     * @param _auctionIndex Index of the auction
     */
    function isOpen(uint256 _auctionIndex) public view returns (bool) {
        Auction storage auction = allAuctions[_auctionIndex];
        if (getCurrentTime() >= auction.endAuction) return false;
        return true;
    }

    /**
     * Return the address of the current highest bider
     * for a specific auction
     * @param _auctionIndex Index of the auction
     */
    function getCurrentBidOwner(
        uint256 _auctionIndex
    ) public view returns (address) {
        require(_auctionIndex < allAuctions.length, "Invalid auction index");
        return allAuctions[_auctionIndex].currentBidOwner;
    }

    /**
     * Return the current highest bid price
     * for a specific auction
     * @param _auctionIndex Index of the auction
     */
    function getCurrentBid(
        uint256 _auctionIndex
    ) public view returns (uint256) {
        require(_auctionIndex < allAuctions.length, "Invalid auction index");
        return allAuctions[_auctionIndex].currentBidPrice;
    }

    /**
     * Place new bid on a specific auction
     * @param _auctionIndex Index of auction
     */
    function bid(
        uint256 _auctionIndex
    ) external payable nonReentrant whenNotPaused returns (bool) {
        require(_auctionIndex < allAuctions.length, "Invalid auction index");
        Auction storage auction = allAuctions[_auctionIndex];

        // check if auction is still open
        require(isOpen(_auctionIndex), "Auction is not open");

        // check if new bid price is higher than the current one
        require(
            msg.value > auction.currentBidPrice,
            "New bid price must be higher than the current bid"
        );

        // check if new bider is not the owner
        require(
            msg.sender != auction.creator,
            "Creator of the auction cannot place new bid"
        );
        // new bid is better than current bid!
        // new bid is valid so must refund the current bid owner (if there is one!)
        if (auction.bidCount > 0) {
            _withdraw(auction.currentBidOwner, auction.currentBidPrice);
        }

        // update auction info
        address payable newBidOwner = payable(msg.sender);
        auction.currentBidOwner = newBidOwner;
        auction.currentBidPrice = msg.value;
        auction.bidCount++;

        // Trigger public event
        emit NewBidOnAuction(_auctionIndex, auction.addressNFTCollection, auction.nftId, auction.amount, msg.value, msg.sender);

        return true;
    }

    /* offer */
    uint256 public _offerIds;
    mapping(uint256 => Offer) private offerIdToOffer;

    struct Offer {
        uint256 offerId;
        address nftContractAddress;
        uint256 nftId;
        address buyer;
        uint256 amount;
        uint256 price;
        bool accepted;
        bool canceled;
    }

    event OfferCreated(
        uint256 indexed offerId,
        address nftContractAddress,
        uint256 nftId,
        address buyer,
        uint256 amount,
        uint256 price,
        bool accepted,
        bool canceled
    );

    event OfferCanceled(
        uint256 indexed offerId,
        address nftContractAddress,
        uint256 nftId,
        address buyer,
        uint256 amount,
        uint256 price
    );

    event OfferAccepted(
        uint256 indexed offerId,
        address nftContractAddress,
        uint256 nftId,
        uint256 amount,
        address owner,
        address buyer,
        uint256 price
    );

    function offer(
        address _nftContractAddress,
        uint256 _nftId,
        uint256 _amount
    ) external payable nonReentrant whenNotPaused {
        require(msg.value > listingFee, "Value must be equal to listing price");
        require(SafeMath.mod(_amount, minSlips[_nftContractAddress]) == 0, "Invalid amount");

        bool isAuction = false;
        for(uint256 i = 0; i < allAuctions.length; i++){
            if(allAuctions[i].addressNFTCollection == _nftContractAddress && allAuctions[i].nftId == _nftId && allAuctions[i].isClaimed == false && allAuctions[i].endAuction <= getCurrentTime()){
                isAuction = true;
            }
        }

        require(!isAuction, "Auction is opened for this NFT");

        bool isMarketItem = false;
        for(uint256 i = 0; i < _marketItemIds; i++){
            if(marketItemIdToMarketItem[i].nftContractAddress == _nftContractAddress && marketItemIdToMarketItem[i].nftId == _nftId && marketItemIdToMarketItem[i].sold == false && marketItemIdToMarketItem[i].canceled == false){
                isMarketItem = true;
            }
        }

        require(!isMarketItem, "Market item is opened for this NFT");
        uint256 offerId = _offerIds;

        offerIdToOffer[offerId] = Offer(
            _offerIds,
            _nftContractAddress,
            _nftId,
            msg.sender,
            _amount,
            msg.value - listingFee,
            false,
            false
        );

        _offerIds++;

        emit OfferCreated(
            offerId,
            _nftContractAddress,
            _nftId,
            msg.sender,
            _amount,
            msg.value - listingFee,
            false,
            false
        );
    }

    function acceptOffer(
        uint256 offerId
    ) external nonReentrant whenNotPaused {
        require(offerId < _offerIds, "Offer does not exist");
        Offer storage currentOffer = offerIdToOffer[offerId];

        require(!currentOffer.accepted, "Offer has been accepted");
        require(!currentOffer.canceled, "Offer has been canceled");

        IERC404 nftCollection = IERC404(currentOffer.nftContractAddress);

        uint256 totalFeeRate = tradingFeeRate + royaltyFeeRates[currentOffer.nftContractAddress];
        
        uint256 maxAmount = 1 * 10 ** nftCollection.decimals();
        if(currentOffer.amount < maxAmount){
            nftCollection.erc20TransferFrom(msg.sender,address(this), currentOffer.amount);
            nftCollection.erc20TransferFrom(address(this), currentOffer.buyer, currentOffer.amount);
        }else if(currentOffer.amount == maxAmount){
            nftCollection.erc721TransferFrom(
                msg.sender,
                address(this),
                currentOffer.nftId
            );
            nftCollection.erc721TransferFrom(
                address(this),
                currentOffer.buyer,
                currentOffer.nftId
            );
        }

        _withdraw(msg.sender, currentOffer.price - currentOffer.price * totalFeeRate / 100);
        _withdraw(royaltyReceivers[currentOffer.nftContractAddress], royaltyFeeRates[currentOffer.nftContractAddress] * currentOffer.price);

        emit OfferAccepted(
            offerId,
            currentOffer.nftContractAddress,
            currentOffer.nftId,
            currentOffer.amount,
            msg.sender,
            currentOffer.buyer,
            currentOffer.price
        );
    }

    function cancelOffer(
        uint256 offerId
    ) external payable nonReentrant whenNotPaused {
        require(offerId < _offerIds, "Offer does not exist");
        Offer storage currentOffer = offerIdToOffer[offerId];

        require(!currentOffer.accepted, "Offer has been accepted");
        require(!currentOffer.canceled, "Offer has been canceled");

        require(msg.sender == currentOffer.buyer, "Only buyer can cancel the offer");
        require(msg.value == cancelFee, "Value must be equal to cancel price");

        _withdraw(msg.sender, currentOffer.price / 100);

        emit OfferCanceled(
            offerId,
            currentOffer.nftContractAddress,
            currentOffer.nftId,
            currentOffer.buyer,
            currentOffer.amount,
            currentOffer.price
        );
    }

    /**
     * Function used by the winner of an auction
     * to withdraw his NFT.
     * When the NFT is withdrawn, the creator of the
     * auction will receive the payment tokens in his wallet
     * @param _auctionIndex Index of auction
     */
    function claimNFT(uint256 _auctionIndex) external nonReentrant whenNotPaused {
        require(_auctionIndex < allAuctions.length, "Invalid auction index");

        // Check if the auction is closed
        require(!isOpen(_auctionIndex), "Auction is still open");

        // Get auction
        Auction storage auction = allAuctions[_auctionIndex];

        // Check if the caller is the winner of the auction
        require(
            auction.currentBidOwner == msg.sender,
            "NFT can be claimed only by the current bid owner"
        );

        // Get NFT collection contract
        IERC404 nftCollection = IERC404(
            auction.addressNFTCollection
        );
        // Transfer NFT from marketplace contract
        // to the winner address
        uint256 maxAmount = 1 * 10 ** nftCollection.decimals();
        if(auction.amount < maxAmount){
            nftCollection.erc20TransferFrom(address(this),auction.currentBidOwner, auction.amount);
        }else if(auction.amount == maxAmount){
            nftCollection.erc721TransferFrom(
                address(this),
                auction.currentBidOwner,
                auction.nftId
            );
        }

        auction.isClaimed = true;

        uint256 totalFeeRate = tradingFeeRate + royaltyFeeRates[auction.addressNFTCollection];

        _withdraw(auction.creator, auction.currentBidPrice - auction.currentBidPrice * totalFeeRate / 100);
        _withdraw(royaltyReceivers[auction.addressNFTCollection], royaltyFeeRates[auction.addressNFTCollection] * auction.currentBidPrice);
        emit NFTClaimed(_auctionIndex,auction.addressNFTCollection, auction.nftId, auction.amount, msg.sender);
    }

    /**
     * Function used by the creator of an auction
     * to withdraw his tokens when the auction is closed
     * When the Token are withdrawn, the winned of the
     * auction will receive the NFT in his walled
     * @param _auctionIndex Index of the auction
     */
    function claimToken(uint256 _auctionIndex) external nonReentrant whenNotPaused {
        require(_auctionIndex < allAuctions.length, "Invalid auction index"); 

        // Check if the auction is closed
        require(!isOpen(_auctionIndex), "Auction is still open");

        // Get auction
        Auction storage auction = allAuctions[_auctionIndex];

        // Check if the auction is closed
        require(!auction.isClaimed, "Auction is already claimed");

        // Check if the caller is the creator of the auction
        require(
            auction.creator == msg.sender,
            "Tokens can be claimed only by the creator of the auction"
        );

        // Get NFT Collection contract
        IERC404 nftCollection = IERC404(
            auction.addressNFTCollection
        );

        uint256 maxAmount = 1 * 10 ** nftCollection.decimals();

        // Transfer NFT from marketplace contract
        // to the winned of the auction
        if(auction.amount < maxAmount){
            nftCollection.erc20TransferFrom(address(this),auction.currentBidOwner, auction.amount);
        }else if(auction.amount == maxAmount){
            nftCollection.erc721TransferFrom(
                address(this),
                auction.currentBidOwner,
                auction.nftId
            );
        }

        // Transfer locked tokens from the market place contract
        // to the wallet of the creator of the auction
        uint256 totalFeeRate = tradingFeeRate + royaltyFeeRates[auction.addressNFTCollection];

        _withdraw(auction.creator, auction.currentBidPrice - auction.currentBidPrice * totalFeeRate / 100);
        _withdraw(royaltyReceivers[auction.addressNFTCollection], royaltyFeeRates[auction.addressNFTCollection] * auction.currentBidPrice);

        emit TokensClaimed(_auctionIndex,auction.addressNFTCollection, auction.nftId,auction.amount, msg.sender);
    }

    /**
     * Function used by the creator of an auction
     * to get his NFT back in case the auction is closed
     * but there is no bider to make the NFT won't stay locked
     * in the contract
     * @param _auctionIndex Index of the auction
     */
    function refund(uint256 _auctionIndex) external payable nonReentrant whenNotPaused {
        require(_auctionIndex < allAuctions.length, "Invalid auction index");

        // Get auction
        Auction storage auction = allAuctions[_auctionIndex];

        // Check if the caller is the creator of the auction
        require(
            auction.creator == msg.sender,
            "Tokens can be claimed only by the creator of the auction"
        );

        require(msg.value == cancelFee, "Value must be equal to cancel price");

        require(
            auction.currentBidOwner == address(0),
            "Existing bider for this auction"
        );

        // Get NFT Collection contract
        IERC404 nftCollection = IERC404(
            auction.addressNFTCollection
        );

        uint256 maxAmount = 1 * 10 ** nftCollection.decimals();
        // Transfer NFT back from marketplace contract
        // to the creator of the auction
        if(auction.amount < maxAmount){
            nftCollection.erc20TransferFrom(address(this), auction.creator, auction.amount);
        }else if(auction.amount == maxAmount){
            nftCollection.erc721TransferFrom(
                address(this),
                auction.creator,
                auction.nftId
            );
        }

        emit NFTRefunded(_auctionIndex,auction.addressNFTCollection, auction.nftId, auction.amount, msg.sender);
    }

    /* buy/sell */
    uint256 public _marketItemIds;
    mapping(uint256 => MarketItem) private marketItemIdToMarketItem;

    struct MarketItem {
        uint256 marketItemId;
        address nftContractAddress;
        uint256 nftId;
        uint256 amount;
        address payable seller;
        uint256 price;
        bool sold;
        bool canceled;
    }

    event MarketItemCreated(
        uint256 indexed marketItemId,
        address nftContract,
        uint256 nftId,
        uint256 amount,
        address seller,
        uint256 price,
        bool sold,
        bool canceled
    );

    event MarketItemCanceled(
        uint256 indexed marketItemId,
        address nftContract,
        uint256 nftId,
        uint256 amount,
        address cancelBy
    );

    event MarketItemSaled(
        uint256 indexed marketItemId,
        address nftContract,
        uint256 nftId,
        uint256 amount,
        address buyer,
        uint256 price
    );

    /**
     * @dev Creates a market item listing, requiring a listing fee and transfering the NFT token from
     * msg.sender to the marketplace contract.
     */
    function createMarketItem(
        address nftContractAddress,
        uint256 nftId,
        uint256 amount,
        uint256 price
    ) public payable nonReentrant whenNotPaused returns (uint256) {
        IERC404 nftCollection = IERC404(nftContractAddress);
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingFee, "Price must be equal to listing price");
        uint256 maxAmount = 1 * 10 ** nftCollection.decimals();
        require(amount > 0 && amount <= maxAmount, "Amount must be (0,1]");
        require(SafeMath.mod(amount, minSlips[nftContractAddress]) == 0, "Invalid amount");
        uint256 marketItemId = _marketItemIds;

        if(amount > 0 && amount < maxAmount){
            nftCollection.erc721TransferFrom(msg.sender, address(this), amount);
        }else if(amount == maxAmount){
            nftCollection.erc721TransferFrom(
                msg.sender,
                address(this),
                nftId
            );
        }else {
            revert("Invalid amount");
        }

        marketItemIdToMarketItem[marketItemId] = MarketItem(
            marketItemId,
            nftContractAddress,
            nftId,
            amount,
            payable(msg.sender),
            price,
            false,
            false
        );

        _marketItemIds++;

        emit MarketItemCreated(
            marketItemId,
            nftContractAddress,    
            nftId,
            amount,
            payable(msg.sender),
            price,
            false,
            false
        );

        return marketItemId;
    }

    /**
     * @dev Cancel a market item
     */
    function cancelMarketItem(address nftContractAddress, uint256 marketItemId) public payable nonReentrant whenNotPaused {
        require(marketItemId < _marketItemIds, "Market item does not exist");
        IERC404 nftCollection = IERC404(nftContractAddress);
        uint256 nftId = marketItemIdToMarketItem[marketItemId].nftId;
        uint256 amount = marketItemIdToMarketItem[marketItemId].amount;
        require(nftId > 0, "Market item has to exist");

        require(marketItemIdToMarketItem[marketItemId].seller == msg.sender, "You are not the seller");
        uint256 maxAmount = 1 * 10 ** nftCollection.decimals();
        require(msg.value == cancelFee, "Price must be equal to cancel price");

        if(amount < maxAmount){
            nftCollection.erc20TransferFrom(address(this),msg.sender, amount);
        }else if(amount == maxAmount){
            nftCollection.erc721TransferFrom(
                address(this),
                msg.sender,
                nftId
            );
        }

        marketItemIdToMarketItem[marketItemId].canceled = true;

        emit MarketItemCanceled(
            marketItemId,
            nftContractAddress,
            nftId,
            amount,
            payable(msg.sender)
        );
    }

    /**
     * @dev Creates a market sale by transfering msg.sender money to the seller and NFT token from the
     * marketplace to the msg.sender. It also sends the listingFee to the marketplace owner.
     */
    function createMarketSale(address nftContractAddress, uint256 marketItemId) public payable nonReentrant whenNotPaused {
        require(marketItemId < _marketItemIds, "Market item does not exist");
        IERC404 nftCollection = IERC404(nftContractAddress);

        uint256 price = marketItemIdToMarketItem[marketItemId].price;
        uint256 nftId = marketItemIdToMarketItem[marketItemId].nftId;
        uint256 amount = marketItemIdToMarketItem[marketItemId].amount;
        require(!marketItemIdToMarketItem[marketItemId].canceled, "Market item has been canceled");
        require(!marketItemIdToMarketItem[marketItemId].sold, "Market item has been sold");
        require(msg.value == price, "Please submit the asking price in order to continue");

        marketItemIdToMarketItem[marketItemId].sold = true;

        uint256 maxAmount = 1 * 10 ** nftCollection.decimals();
        if(amount < maxAmount){
            nftCollection.erc20TransferFrom(address(this), msg.sender, amount);
        }else if(amount == maxAmount){
            nftCollection.erc721TransferFrom(
                address(this), msg.sender, nftId    
            );
        }

        uint256 totalFeeRate = tradingFeeRate + royaltyFeeRates[nftContractAddress];

        marketItemIdToMarketItem[marketItemId].seller.transfer(msg.value - msg.value * totalFeeRate / 100);
        payable(royaltyReceivers[nftContractAddress]).transfer(msg.value * royaltyFeeRates[nftContractAddress] / 100);

        emit MarketItemSaled(marketItemId, nftContractAddress, nftId, amount, msg.sender,  msg.value);
    }

    function createBatchMarketSale(address[] memory nftContractAddresses, uint256[] memory marketItemIds) public payable nonReentrant whenNotPaused {
        require(nftContractAddresses.length == marketItemIds.length, "Invalid input");
        uint256 totalCharge = 0;

        for (uint256 i = 0; i < nftContractAddresses.length; i++) {
            require(marketItemIds[i] < _marketItemIds, "Market item does not exist");
            if(marketItemIdToMarketItem[marketItemIds[i]].sold){
                continue;
            }
            IERC404 nftCollection = IERC404(nftContractAddresses[i]);

            uint256 price = marketItemIdToMarketItem[marketItemIds[i]].price;
            uint256 nftId = marketItemIdToMarketItem[marketItemIds[i]].nftId;
            uint256 amount = marketItemIdToMarketItem[marketItemIds[i]].amount;
            require(msg.value >= price, "Please submit the asking price in order to continue");

            marketItemIdToMarketItem[marketItemIds[i]].sold = true;

            uint256 maxAmount = 1 * 10 ** nftCollection.decimals();
            if(amount < maxAmount){
                nftCollection.erc20TransferFrom(address(this), msg.sender, amount);
            }else if(amount == maxAmount){
                nftCollection.erc721TransferFrom(
                    address(this), msg.sender, nftId    
                );
            }

            totalCharge += price;

            uint256 totalFeeRate = tradingFeeRate + royaltyFeeRates[nftContractAddresses[i]];

            marketItemIdToMarketItem[marketItemIds[i]].seller.transfer(msg.value - msg.value * totalFeeRate / 100);
            payable(royaltyReceivers[nftContractAddresses[i]]).transfer(msg.value * royaltyFeeRates[nftContractAddresses[i]] / 100);

            emit MarketItemSaled(marketItemIds[i], nftContractAddresses[i], nftId, amount, msg.sender,  price);
        }

        if(msg.value > totalCharge){
            payable(msg.sender).transfer(msg.value - totalCharge);
        }
    }

    function getContractDecimals(address nftContractAddress) public view returns (uint256) {
        IERC404 nftCollection = IERC404(nftContractAddress);

        return nftCollection.decimals();
    }

    function getMarketItem(uint256 marketItemId) public view returns (MarketItem memory) {
        return marketItemIdToMarketItem[marketItemId];
    }
}