// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MileysTCRegistries {
    enum Status { Pending, Approved, Rejected }

    enum Party { Proposer, Challenger }

    enum DisputeStatus { Pending, Resolved }

    /// @param requester The address of the user who made the request.
    struct Proposal {
        address requester;
        uint88 totalDeposit;
        uint8 exists;
        string data;
    }

    struct Item {
        uint256 challengeExpiration;
        address requester;
        string data;
    }

    struct Challenge {
        address challenger;
        uint96 exists;
        bytes32 itemId;
        Status status;
        string data;
    }

    struct Vote {
        uint256 totalProposer;
        uint256 totalChallenger;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    address public token;

    uint256 public constant PROPOSAL_COST = 1 ether;
    uint256 public constant CHALLENGE_COST = 0.1 ether;
    uint256 public constant VOTE_COST = 0.1 ether;

    uint256 public challengeDuration = 30 days;

    mapping(bytes32 => Proposal) public proposals;

    mapping(bytes32 => Challenge) public challenges;
    
    mapping(bytes32 => Item) public items;
    mapping(bytes32 => Vote) public votes;


    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/
    event ProposalSubmitted(bytes32 indexed proposalId, address indexed requester, string indexed data);
    event ItemAdded(bytes32 indexed proposalId, bytes32 indexed itemId, string indexed data);
    event ItemChallenged(
        address challenger,
        bytes32 indexed proposalId,
        bytes32 indexed itemId,
        bytes32 indexed data
    );

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    error ProposalDoesNotExist();
    error ProposalAlreadyExists();
    
    error ChallengeDoesNotExist();
    error ChallengeAlreadyExists();
    error ChallengerCanNotBeItemRequester();
    
    error ItemApproved();  

    error NotAuthorized();
    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address _tokenAddress) {
        token = _tokenAddress;
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
    function propose(string memory data) external { 
        bytes32 proposalId = keccak256(abi.encode(data));
        if (existingProposal(proposalId)) revert ProposalAlreadyExists();

        uint256 cost = PROPOSAL_COST;

        proposals[proposalId] = Proposal({
            requester: msg.sender,
            totalDeposit: uint88(cost),
            exists: 1,
            data: data
        });

        IERC20(token).transferFrom(msg.sender, address(this), cost);

        emit ProposalSubmitted(proposalId, msg.sender, data);
    }

    function addItem(bytes32 proposalId, string calldata data) external {
        if (proposals[proposalId].exists != 1) revert ProposalDoesNotExist();

        bytes32 itemId = keccak256(abi.encodePacked(proposalId, data));
        items[itemId] = Item({
            challengeExpiration: block.timestamp + challengeDuration,
            requester: msg.sender,
            data: data
        });

        emit ItemAdded(proposalId, itemId, data);
    }

    /*//////////////////////////////////////////////////////////////
                            CHALLENGE LOGIC
    //////////////////////////////////////////////////////////////*/
    /// @notice Challenge an existing item
    function challengeItem(bytes32 itemId, string calldata data) external payable {
        if (block.timestamp > items[itemId].challengeExpiration) revert ItemApproved();

        if (items[itemId].requester == msg.sender) revert ChallengerCanNotBeItemRequester();

        bytes32 challengeId = keccak256(abi.encodePacked(itemId, data));
        if (existingChallenge(challengeId)) revert ChallengeAlreadyExists();

        challenges[challengeId] = Challenge({
            challenger: msg.sender,
            exists: 1,
            itemId: itemId,
            status: Status.Pending,
            data: data
        });

        require(IERC20(token).transferFrom(msg.sender, address(this), CHALLENGE_COST));
    }

    function resolveChallenge(bytes32 challengeId) external authorizedUsers(challengeId) {

    }

    function existingProposal(bytes32 proposalId) public view returns (bool) {
        return(proposals[proposalId].exists == 1);
    }

    function existingChallenge(bytes32 challengeId) public view returns (bool) {
        return(challenges[challengeId].exists == 1);
    }
}


