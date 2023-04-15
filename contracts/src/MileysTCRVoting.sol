// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { MileysTCRegistries } from "./MileysTCRegistries.sol";

import { AttributeStore } from "./lib/AttributeStore.sol";
import { DLL } from "./lib/DLL.sol";

/// @notice Forked and adapted from https://github.com/ConsenSys/PLCRVoting/blob/master/contracts/PLCRVoting.sol
contract MileysTCRVoting {
    using AttributeStore for AttributeStore.Data;
    using DLL for DLL.Data;

    enum Party { Requester, Challenger }

    struct Poll {
        bytes32 challengeId;
        uint256 commitEndDate;
        uint256 revealEndDate;
        uint256 quorum;
        uint256 votesForChallenger;
        uint256 votesForRequester;
        mapping(address => bool) userCommitted;
        mapping(address => bool) userRevealed;
        mapping(address => Party) userVote;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    IERC20 public token;
    MileysTCRegistries public registry;

    AttributeStore.Data store;
    mapping(address => DLL.Data) dllMap;

    uint256 public minQuorum = 100;
    uint256 public commitDuration = 14 days;
    uint256 public revealDuration = 7 days;

    uint256 public pollId;

    mapping(uint256 => Poll) public polls;
    mapping(address => uint256) public voteTokenBalance;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/
    event PollStarted(uint256 id, bytes32 indexed challengeId);
    event VotingRightsGranted(uint256 amount, address indexed user);
    event VotingRightsWithdrawn(uint256 amount, address indexed user);
    event TokensRescued(uint indexed pollID, address indexed voter);

    event VoteCommitted(uint indexed pollID, uint numTokens, address indexed voter);
    event VoteRevealed(
        uint indexed pollID, 
        uint numTokens, 
        uint votesFor, 
        uint votesAgainst, 
        Party indexed choice, 
        address indexed voter, 
        uint salt
    );

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    error PollAlreadyStarted();

    modifier onlyRegistry {
        require(msg.sender == address(registry), "Only registry can call this function");
        _;
    }

    constructor(address _token, address _registry) {
        token = IERC20(_token);
        registry = MileysTCRegistries(_registry);
        pollId = 1;
    }

    /// @notice Loads amount ERC20 tokens into the voting contract for one-to-one voting rights
    /// @dev Assumes that msg.sender has approved voting contract to spend on their behalf
    /// @param amount The number of votingTokens desired in exchange for ERC20 tokens
    function requestVotingRights(uint amount) public {
        require(token.balanceOf(msg.sender) >= amount);
        voteTokenBalance[msg.sender] += amount;
        require(token.transferFrom(msg.sender, address(this), amount));
        emit VotingRightsGranted(amount, msg.sender);
    }

    /// @dev Unlocks tokens locked in unrevealed vote where poll has ended
    /// @param _pollID Integer identifier associated with the target poll
    function rescueTokens(uint _pollID) public {
        require(isExpired(polls[_pollID].revealEndDate));
        require(dllMap[msg.sender].contains(_pollID));

        dllMap[msg.sender].remove(_pollID);
        emit TokensRescued(_pollID, msg.sender);
    }

    /// @dev Unlocks tokens locked in unrevealed votes where polls have ended
    /// @param _pollIDs Array of integer identifiers associated with the target polls
    function rescueTokensInMultiplePolls(uint[] calldata _pollIDs) public {
        // loop through arrays, rescuing tokens from all
        for (uint i = 0; i < _pollIDs.length; i++) {
            rescueTokens(_pollIDs[i]);
        }
    }

    /// @notice Withdraw amount ERC20 tokens from the voting contract, revoking these voting rights
    /// @param amount The number of ERC20 tokens desired in exchange for voting rights
    function withdrawVotingRights(uint amount) external {
        uint256 availableTokens = voteTokenBalance[msg.sender] - getLockedTokens(msg.sender);
        require(availableTokens >= amount);
        voteTokenBalance[msg.sender] -= amount;
        require(token.transfer(msg.sender, amount));
        emit VotingRightsWithdrawn(amount, msg.sender);
    }

    function startPoll(bytes32 _challengeId) external onlyRegistry {
        uint256 currentPollId = pollId;
        if (polls[currentPollId].commitEndDate != 0) revert PollAlreadyStarted();

        uint256 currentTimestamp = block.timestamp;

        Poll storage currentPoll = polls[currentPollId];

        currentPoll.challengeId = _challengeId;
        currentPoll.commitEndDate = currentTimestamp + commitDuration;
        currentPoll.revealEndDate = currentTimestamp + commitDuration + revealDuration;
        currentPoll.quorum = minQuorum;

        currentPollId++;
        pollId = currentPollId;

        emit PollStarted(currentPollId, _challengeId);
    }

    /// @notice                 Commits votes using hashes of choices and secret salts to conceal votes until reveal
    /// @param _pollIDs         Array of integer identifiers associated with target polls
    /// @param _secretHashes    Array of commit keccak256 hashes of voter's choices and salts (tightly packed in this order)
    /// @param _numsTokens      Array of numbers of tokens to be committed towards the target polls
    /// @param _prevPollIDs     Array of IDs of the polls that the user has voted the maximum number of tokens in which is still less than or equal to numTokens
    function commitVotes(uint[] calldata _pollIDs, bytes32[] calldata _secretHashes, uint[] calldata _numsTokens, uint[] calldata _prevPollIDs) external {
        // make sure the array lengths are all the same
        require(_pollIDs.length == _secretHashes.length);
        require(_pollIDs.length == _numsTokens.length);
        require(_pollIDs.length == _prevPollIDs.length);

        // loop through arrays, committing each individual vote values
        for (uint i = 0; i < _pollIDs.length; i++) {
            commitVote(_pollIDs[i], _secretHashes[i], _numsTokens[i], _prevPollIDs[i]);
        }
    }

    /// @notice Commits vote using hash of choice and secret salt to conceal vote until reveal
    /// @param _pollID Integer identifier associated with target poll
    /// @param _secretHash Commit keccak256 hash of voter's choice and salt (tightly packed in this order)
    /// @param _numTokens The number of tokens to be committed towards the target poll
    /// @param _prevPollID The ID of the poll that the user has voted the maximum number of tokens in which is still less than or equal to numTokens
    function commitVote(uint _pollID, bytes32 _secretHash, uint _numTokens, uint _prevPollID) public {
        require(commitPeriodActive(_pollID));

        // if msg.sender doesn't have enough voting rights,
        // request for enough voting rights
        if (voteTokenBalance[msg.sender] < _numTokens) {
            uint remainder = _numTokens - voteTokenBalance[msg.sender] ;
            requestVotingRights(remainder);
        }

        // make sure msg.sender has enough voting rights
        require(voteTokenBalance[msg.sender] >= _numTokens);
        // prevent user from committing to zero node placeholder
        require(_pollID != 0);
        // prevent user from committing a secretHash of 0
        require(_secretHash != 0);

        // Check if _prevPollID exists in the user's DLL or if _prevPollID is 0
        require(_prevPollID == 0 || dllMap[msg.sender].contains(_prevPollID));

        uint nextPollID = dllMap[msg.sender].getNext(_prevPollID);

        // edge case: in-place update
        if (nextPollID == _pollID) {
            nextPollID = dllMap[msg.sender].getNext(_pollID);
        }

        require(validPosition(_prevPollID, nextPollID, msg.sender, _numTokens));
        dllMap[msg.sender].insert(_prevPollID, _pollID, nextPollID);

        bytes32 UUID = attrUUID(msg.sender, _pollID);

        store.attachAttribute(UUID, "numTokens", _numTokens);
        store.attachAttribute(UUID, "commitHash", uint(_secretHash));

        polls[_pollID].userCommitted[msg.sender] = true;
        emit VoteCommitted(_pollID, _numTokens, msg.sender);
    }

    /// @notice Checks if the commit period is still active for the specified poll
    /// @dev Checks isExpired for the specified poll's commitEndDate
    /// @param _pollID Integer identifier associated with target poll
    /// @return Boolean indication of isCommitPeriodActive for target poll
    function commitPeriodActive(uint _pollID) public view returns (bool) {
        require(pollExists(_pollID));

        return !isExpired(polls[_pollID].commitEndDate);
    }

    /// @dev Compares previous and next poll's committed tokens for sorting purposes
    /// @param _prevID Integer identifier associated with previous poll in sorted order
    /// @param _nextID Integer identifier associated with next poll in sorted order
    /// @param _voter Address of user to check DLL position for
    /// @param _numTokens The number of tokens to be committed towards the poll (used for sorting)
    /// @return valid Boolean indication of if the specified position maintains the sort
    function validPosition(
        uint _prevID, 
        uint _nextID, 
        address _voter, 
        uint _numTokens
    ) public view returns (bool) {
        bool prevValid = (_numTokens >= getNumTokens(_voter, _prevID));
        // if next is zero node, _numTokens does not need to be greater
        bool nextValid = (_numTokens <= getNumTokens(_voter, _nextID) || _nextID == 0);
        return prevValid && nextValid;
    }

    /// @notice Reveals vote with choice and secret salt used in generating commitHash to attribute committed tokens
    /// @param _pollID Integer identifier associated with target poll
    /// @param _voteOption Vote choice used to generate commitHash for associated poll
    /// @param _salt Secret number used to generate commitHash for associated poll
    function revealVote(uint _pollID, Party _voteOption, uint _salt) public {
        // Make sure the reveal period is active
        require(revealPeriodActive(_pollID));
        require(polls[_pollID].userCommitted[msg.sender]);                         // make sure user has committed a vote for this poll
        require(!polls[_pollID].userRevealed[msg.sender]);                        // prevent user from revealing multiple times
        require(keccak256(abi.encodePacked(_voteOption, _salt)) == getCommitHash(msg.sender, _pollID)); // compare resultant hash from inputs to original commitHash

        uint numTokens = getNumTokens(msg.sender, _pollID);

        if (_voteOption == Party.Challenger) { // apply numTokens to appropriate poll choice
            polls[_pollID].votesForChallenger += numTokens;
        } else {
            polls[_pollID].votesForRequester += numTokens;
        }

        dllMap[msg.sender].remove(_pollID); // remove the node referring to this vote upon reveal
        polls[_pollID].userRevealed[msg.sender] = true;
        polls[_pollID].userVote[msg.sender] = _voteOption;

        emit VoteRevealed(
            _pollID, 
            numTokens, 
            polls[_pollID].votesForChallenger, 
            polls[_pollID].votesForRequester, 
            _voteOption, 
            msg.sender, 
            _salt
        );
    }

    /// @notice             Reveals multiple votes with choices and secret salts used in generating commitHashes to attribute committed tokens
    /// @param _pollIDs     Array of integer identifiers associated with target polls
    /// @param _voteOptions Array of vote choices used to generate commitHashes for associated polls
    /// @param _salts       Array of secret numbers used to generate commitHashes for associated polls
    function revealVotes(uint[] calldata _pollIDs, Party[] calldata _voteOptions, uint[] calldata _salts) external {
        // make sure the array lengths are all the same
        require(_pollIDs.length == _voteOptions.length);
        require(_pollIDs.length == _salts.length);

        // loop through arrays, revealing each individual vote values
        for (uint i = 0; i < _pollIDs.length; i++) {
            revealVote(_pollIDs[i], _voteOptions[i], _salts[i]);
        }
    }

    /// @notice Checks if the reveal period is still active for the specified poll
    /// @dev Checks isExpired for the specified poll's revealEndDate
    /// @param _pollID Integer identifier associated with target poll
    function revealPeriodActive(uint _pollID) public view returns (bool) {
        require(pollExists(_pollID));

        return !isExpired(polls[_pollID].revealEndDate) && !commitPeriodActive(_pollID);
    }

    
    /// @dev Gets the total winning votes for reward distribution purposes
    /// @param _pollID Integer identifier associated with target poll
    /// @return Total number of votes committed to the winning option for specified poll
    function getTotalNumberOfTokensForWinningOption(uint _pollID) public view returns (uint) {
        require(pollEnded(_pollID));

        if (isPassed(_pollID))
            return polls[_pollID].votesForChallenger;
        else
            return polls[_pollID].votesForRequester;
    }

    
    /// @notice Determines if proposal has passed
    /// @dev Check if votesFor out of totalVotes exceeds votesQuorum (requires pollEnded)
    /// @param _pollID Integer identifier associated with target poll
    function isPassed(uint _pollID) public view returns (bool passed) {
        require(pollEnded(_pollID));

        Poll storage poll = polls[_pollID];
        return (100 * poll.votesForChallenger) > (poll.quorum * (poll.votesForChallenger + poll.votesForRequester));
    }

    
    /// @notice Determines if poll is over
    /// @dev Checks isExpired for specified poll's revealEndDate
    /// @return Boolean indication of whether polling period is over
    function pollEnded(uint _pollID) public view returns (bool) {
        require(pollExists(_pollID));

        return isExpired(polls[_pollID].revealEndDate);
    }

    
    /// @dev Checks if an expiration date has been reached
    /// @param _terminationDate Integer timestamp of date to compare current timestamp with
    /// @return expired Boolean indication of whether the terminationDate has passed
    function isExpired(uint _terminationDate) public view returns (bool) {
        return (block.timestamp > _terminationDate);
    }

    
    /// @dev Checks if a poll exists
    /// @param _pollID The pollID whose existance is to be evaluated.
    /// @return Boolean Indicates whether a poll exists for the provided pollID
    function pollExists(uint _pollID) public view returns (bool) {
        return (_pollID != 0 && _pollID <= pollId);
    }

    /// @dev Gets the bytes32 commitHash property of target poll
    /// @param _voter Address of user to check against
    /// @param _pollID Integer identifier associated with target poll
    /// @return Bytes32 hash property attached to target poll
    function getCommitHash(address _voter, uint _pollID) public view returns (bytes32) {
        return bytes32(store.getAttribute(attrUUID(_voter, _pollID), "commitHash"));
    }

    /// @dev Takes the last node in the user's DLL and iterates backwards through the list searching
    /// for a node with a value less than or equal to the provided _numTokens value. When such a node
    /// is found, if the provided _pollID matches the found nodeID, this operation is an in-place
    /// update. In that case, return the previous node of the node being updated. Otherwise return the
    /// first node that was found with a value less than or equal to the provided _numTokens.
    /// @param _voter The voter whose DLL will be searched
    /// @param _numTokens The value for the numTokens attribute in the node to be inserted
    /// @return the node which the propoded node should be inserted after
    function getInsertPointForNumTokens(
        address _voter, 
        uint _numTokens, 
        uint _pollID
    ) public view returns (uint) {
        // Get the last node in the list and the number of tokens in that node
        uint nodeID = getLastNode(_voter);
        uint tokensInNode = getNumTokens(_voter, nodeID);

        // Iterate backwards through the list until reaching the root node
        while(nodeID != 0) {
            // Get the number of tokens in the current node
            tokensInNode = getNumTokens(_voter, nodeID);
            if(tokensInNode <= _numTokens) { // We found the insert point!
                if(nodeID == _pollID) {
                    // This is an in-place update. Return the prev node of the node being updated
                    nodeID = dllMap[_voter].getPrev(nodeID);
                }
                // Return the insert point
                return nodeID; 
            }
            // We did not find the insert point. Continue iterating backwards through the list
            nodeID = dllMap[_voter].getPrev(nodeID);
        }

        // The list is empty, or a smaller value than anything else in the list is being inserted
        return nodeID;
    }

    /// @dev Gets the numTokens property of getLastNode
    /// @param _voter Address of user to check against
    /// @return Maximum number of tokens committed in poll specified
    function getLockedTokens(address _voter) public view returns (uint) {
        return getNumTokens(_voter, getLastNode(_voter));
    }

    
    /// @dev Gets top element of sorted poll-linked-list
    /// @param _voter Address of user to check against
    /// @return Integer identifier to poll with maximum number of tokens committed to it
    function getLastNode(address _voter) public view returns (uint) {
        return dllMap[_voter].getPrev(0);
    }

    /// @dev Wrapper for getAttribute with attrName="numTokens"
    /// @param _voter Address of user to check against
    /// @param _pollID Integer identifier associated with target poll
    /// @return Number of tokens committed to poll in sorted poll-linked-list
    function getNumTokens(address _voter, uint _pollID) public view returns (uint) {
        return store.getAttribute(attrUUID(_voter, _pollID), "numTokens");
    }

    /// @dev Generates an identifier which associates a user and a poll together
    /// @param _pollID Integer identifier associated with target poll
    /// @return UUID Hash which is deterministic from _user and _pollID
    function attrUUID(address _user, uint _pollID) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_user, _pollID));
    }
}
