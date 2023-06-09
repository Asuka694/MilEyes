// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { MileysTCRVoting } from "./MileysTCRVoting.sol";

contract MileysTCRegistries {
    enum Status { Pending, Approved, Rejected }

    /// @param requester The address of the user who made the request.
    struct Proposal {
        address requester;
        uint88 totalDeposit;
        uint8 exists;
        string data;
        bytes32[] itemsId;
    }

    struct Item {
        uint88 challengeExpiration;
        uint8 pendingChallenge;
        address requester;
        string data;
        bytes32[] challengesId;
    }

    struct Challenge {
        address challenger;
        uint96 exists;
        bytes32 itemId;
        Status status;
        string data;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    address public token;
    MileysTCRVoting public voting;

    uint256 public constant PROPOSAL_COST = 1 ether;
    uint256 public constant ITEM_COST = 0.1 ether;
    uint256 public constant CHALLENGE_COST = 0.1 ether;
    uint256 public constant VOTE_COST = 0.1 ether;

    uint256 public challengeDuration = 30 days;

    mapping(bytes32 => Proposal) public proposals;

    mapping(bytes32 => Challenge) public challenges;
    
    mapping(bytes32 => Item) public items;

    bytes32[] public proposalsId;
    bytes32[] public itemsId;
    bytes32[] public challengesId;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/
    event ProposalSubmitted(bytes32 indexed proposalId, address indexed requester, string indexed data);
    event ItemAdded(bytes32 indexed proposalId, bytes32 indexed itemId, string indexed data);
    event ItemChallenged(
        address challenger,
        bytes32 indexed proposalId,
        bytes32 indexed itemId,
        string indexed data
    );

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    error ProposalDoesNotExist();
    error ProposalAlreadyExists();
    
    error ChallengeDoesNotExist();
    error ChallengeAlreadyExists();
    error ItemHasPendingChallenge();

    error ChallengerIsItemRequester();
    error LengthMismatch();
    
    error ItemChallengeExpired();
    error ItemAlreadyExist();
    error ItemDoesNotExist();


    error LengthExceeded();

    error NotAuthorized();
    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address _tokenAddress, address _voting) {
        token = _tokenAddress;
        voting = MileysTCRVoting(_voting);
    }

    /// @dev Checks if the caller is the challenger or the item requester, reverts if not
    modifier authorizedUsers(bytes32 challengeId) {
        Challenge memory currentChallenge = challenges[challengeId];
        if (
            currentChallenge.challenger != msg.sender ||
            items[currentChallenge.itemId].requester != msg.sender
        ) revert NotAuthorized();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                             PROPOSAL LOGIC
    //////////////////////////////////////////////////////////////*/
    /// @notice Add a new proposal to the registries list
    /// @dev The caller has to deposit the proposal cost
    /// @param data The CID of the proposal dataset
    function propose(string memory data) external { 
        bytes32 proposalId = keccak256(abi.encode(data));
        if (existingProposal(proposalId)) revert ProposalAlreadyExists();

        uint256 cost = PROPOSAL_COST;

        Proposal storage proposal = proposals[proposalId];
        proposal.requester = msg.sender;
        proposal.totalDeposit = uint88(cost);
        proposal.exists = 1;
        proposal.data = data;

        IERC20(token).transferFrom(msg.sender, address(this), cost);
        proposalsId.push(proposalId);

        emit ProposalSubmitted(proposalId, msg.sender, data);
    }

    /*//////////////////////////////////////////////////////////////
                               ITEM LOGIC
    //////////////////////////////////////////////////////////////*/
    /// @param proposalId keccak256(abi.encode(proposalCID))
    /// @param datas The CIDs of the items datasets
    function addItems(bytes32 proposalId, string[] calldata datas) external {
        if (datas.length > 10) revert LengthExceeded();
        for (uint256 i = 0; i < datas.length; i++) {
            _addItem(proposalId, datas[i]);
        }

        require(IERC20(token).transferFrom(msg.sender, address(this), ITEM_COST));
    }

    function _addItem(bytes32 proposalId, string calldata data) internal {
        if (proposals[proposalId].exists != 1) revert ProposalDoesNotExist();

        bytes32 itemId = keccak256(abi.encodePacked(proposalId, data));
        if (existingItem(itemId)) revert ItemAlreadyExist();

        Item storage item = items[itemId];
        item.challengeExpiration = uint88(block.timestamp + challengeDuration);
        item.pendingChallenge = 0;
        item.requester = msg.sender;
        item.data = data;

        proposals[proposalId].itemsId.push(itemId);
        itemsId.push(itemId);

        emit ItemAdded(proposalId, itemId, data);
    }

    /*//////////////////////////////////////////////////////////////
                            CHALLENGE LOGIC
    //////////////////////////////////////////////////////////////*/
    /// @param itemIds keccak256(abi.encodePacked(proposalId, itemCID));
    function challengeItems(bytes32[] calldata itemIds, string[] calldata data) external {
        if (itemIds.length > 10) revert LengthExceeded();
        if (itemIds.length != data.length) revert LengthMismatch();
        for (uint256 i = 0; i < itemIds.length; i++) {
            _challengeItem(itemIds[i], data[i]);
        }
    }

    /// @notice Challenge an existing item
    function _challengeItem(bytes32 itemId, string calldata data) internal {
        if (existingItem(itemId) == false) revert ItemDoesNotExist();
        if (block.timestamp > items[itemId].challengeExpiration) revert ItemChallengeExpired();
        if (items[itemId].pendingChallenge == 1) revert ItemHasPendingChallenge();
        if (items[itemId].requester == msg.sender) revert ChallengerIsItemRequester();

        bytes32 challengeId = keccak256(abi.encodePacked(itemId, data));
        if (existingChallenge(challengeId)) revert ChallengeAlreadyExists();

        Challenge storage challenge = challenges[challengeId];
        challenge.challenger = msg.sender;
        challenge.exists = 1;
        challenge.itemId = itemId;
        challenge.status = Status.Pending;
        challenge.data = data;

        items[itemId].pendingChallenge = 1;
        items[itemId].challengesId.push(challengeId);
        
        voting.startPoll(challengeId);
        require(IERC20(token).transferFrom(msg.sender, address(this), CHALLENGE_COST));

        challengesId.push(challengeId);
        
        emit ItemChallenged(msg.sender, itemId, challengeId, data);
    }

    function existingProposal(bytes32 proposalId) public view returns (bool) {
        return(proposals[proposalId].exists == 1);
    }

    function existingItem(bytes32 itemId) public view returns (bool) {
        return(items[itemId].requester != address(0));
    }

    function existingChallenge(bytes32 challengeId) public view returns (bool) {
        return(challenges[challengeId].exists == 1);
    }

    function challengesLength() external view returns (uint256) {
        return challengesId.length;
    }

    function getChallengesLengthFromItem(bytes32 itemId) external view returns (uint256) {
        return items[itemId].challengesId.length;
    }

    function itemsLength() external view returns (uint256) {
        return itemsId.length;
    }

    function proposalsLength() external view returns (uint256) {
        return proposalsId.length;
    }

    function getItemsLengthFromProposal(bytes32 proposalId) external view returns (uint256) {
        return proposals[proposalId].itemsId.length;
    }
}


