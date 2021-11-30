// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title Friendship contract
/// @author Mauro Molinari
/// @notice This contract can be use to keep track of friend requests and friends of its users
/// @dev Friend requests and Friends structs contains the pubKey used by Textile to talk with each other in the app
contract Friends is Ownable, Pausable {
    
    // Friend request struct containing the sender address with the associated pubKey used by Textile
    struct FriendRequest {
        address sender;
        string pubKey;
    }

    // Friend struct containing the dweller address with the associated pubKey used by Textile
    struct Friend {
        address dweller;
        string pubKey;
    }
    
    // Constant kept to clear previous requests or friends
    uint MAX_UINT = 2**256 - 1;


    // All friend requests received by an address
    mapping(address => FriendRequest[]) private requests;
    
    // Tracks the index of each friend request inside the mapping
    mapping(address => mapping(address => uint)) private requestsTracker;
    
    // All friends that an address has
    mapping(address => Friend[]) private friends;
    
    // Tracks the index of each Friend inside the mapping
    mapping(address => mapping(address => uint)) private friendsTracker;

    /// @notice Request sent event
    /// @param to Receiver of the request
    event FriendRequestSent(address indexed to);

    /// @notice Request accepted event
    /// @param from Original sender of the request
    event FriendRequestAccepted(address indexed from);

    /// @notice Request denied event
    /// @param from Original sender of the request
    event FriendRequestDenied(address indexed from);

    /// @notice Request removed event
    /// @param to Receiver of the request
    event FriendRequestRemoved(address indexed to);

    /// @notice Friend removed event
    /// @param friendRemoved Friend removed
    event FriendRemoved(address indexed friendRemoved);

    /// @notice Returns a friend from the friends mapping 
    /// @param _from From friend address
    /// @param _toGet To friend address
    /// @return fr Friend from the mapping
    function _getFriend(address _from, address _toGet) private view returns (Friend memory fr) {
        uint index = friendsTracker[_from][_toGet];
        require(index != 0, "Friend does not exist");
        return friends[_from][index - 1];
    }
    
    /// @notice Adds a friend to the friends mapping 
    /// @param _to To friend address
    /// @param fr Friend to add
    function _addFriend(address _to, Friend memory fr) private {
        friends[_to].push(fr);
        uint index = friends[_to].length;
        friendsTracker[_to][fr.dweller] = index;
    }
    
    /// @notice Removes a friend from the friends mapping 
    /// @param _from From friend address
    /// @param _toRemove To remove friend address
    function _removeFriend(address _from, address _toRemove) private {
        require(friends[_from].length > 0, "There are no friends to remove");
        // Index of the element to remove
        uint index = friendsTracker[_from][_toRemove] - 1;
        uint lastIndex = friends[_from].length - 1;
        
        if(index != lastIndex){
            // Last friend inside the array
            Friend memory last = friends[_from][lastIndex];
            // Change the last with the element to remove
            friends[_from][index] = last;
            // Update the Index
            friendsTracker[_from][last.dweller] = index + 1;
        }
        
        // Clear the previous index by setting the maximum integer
        friendsTracker[_from][_toRemove] = MAX_UINT;
        
        // Reduce the size of the array by 1
        friends[_from].pop();
    }
    
    /// @notice Returns a friend request from the requests mapping 
    /// @param _from From friend address
    /// @param _toGet To friend address
    /// @return fr FriendRequest from the mapping
    function _getRequest(address _from, address _toGet) private view returns (FriendRequest memory fr) {
        uint index = requestsTracker[_from][_toGet];
        require(index != 0, "Request does not exist");
        return requests[_from][index];
    }
    
    /// @notice Adds a friend request to the requests mapping
    /// @param _to To friend address
    /// @param _from From friend address
    function _addRequest(address _to, FriendRequest memory _from) private {
        requests[_to].push(_from);
        uint index = requests[_to].length;
        requestsTracker[_to][_from.sender] = index;
        requestsTracker[_from.sender][_to] = index;
    }
    
    /// @notice Removes a friend request from the requests mapping
    /// @param _from From friend address
    /// @param _toRemove To remove friend address
    function _removeRequest(address _from, address _toRemove) private {
        require(requests[_from].length > 0, "There are no requests to remove");
        // Index of the element to remove
        uint index = requestsTracker[_from][_toRemove] - 1;
        uint lastIndex = requests[_from].length - 1;
        
        if(index != lastIndex){
            // Last friend inside the array
            FriendRequest memory last = requests[_from][lastIndex];
            // Change the last with the element to remove
            requests[_from][index] = last;
            // Update the Index
            requestsTracker[_from][last.sender] = index + 1;
        }
        
        // Clear the previous index by setting the maximum integer
        requestsTracker[_from][_toRemove] = MAX_UINT;
        requestsTracker[_toRemove][_from] = MAX_UINT;
        
        // Reduce the size of the array by 1
        requests[_from].pop();
    }

    /// @notice Add a new friend request to the mapping
    /// @param _to To friend address
    /// @param _pubKey PubKey associated with the request
    function makeRequest(address _to, string memory _pubKey) public whenNotPaused {
        uint index = requestsTracker[_to][msg.sender];
        require(msg.sender != _to, "You cannot send a friend request to yourself");
        // You have already sent a friend request to this address
        require(index == 0 || index == MAX_UINT, "Friend request already sent");
        // You have already received a friend request from this address
        require(requestsTracker[msg.sender][_to] == 0 || requestsTracker[msg.sender][_to] == MAX_UINT, "Friend request already sent");
        // Must not be friend
        require(friendsTracker[msg.sender][_to] == 0 || friendsTracker[msg.sender][_to] == MAX_UINT, "You are already friends");

        _addRequest(
            _to,
            FriendRequest(msg.sender, _pubKey)
        );

        emit FriendRequestSent(_to);
    }
    
    /// @notice Accept a friend request
    /// @param _from From friend address
    /// @param pubKey PubKey associated with the request
    function acceptRequest(address _from, string memory pubKey) public whenNotPaused {
        uint friendRequestIndex = requestsTracker[msg.sender][_from];
        
        // Check if the friend request has already been removed
        require(friendRequestIndex != MAX_UINT, "Friend request has been removed");
        
        // Check if the request exist
        FriendRequest memory friendRequest = requests[msg.sender][friendRequestIndex - 1];
        require(friendRequest.sender != address(0), "Request does not exist");
        
        Friend memory senderFriend = Friend(
            _from,
            friendRequest.pubKey
        );
        
        Friend memory receiverFriend = Friend(
            msg.sender,
            pubKey
        );
        
        _removeRequest(msg.sender, friendRequest.sender);
        _addFriend(msg.sender, senderFriend);
        _addFriend(friendRequest.sender, receiverFriend);

        emit FriendRequestAccepted(_from);
    }

    /// @notice Deny a friend request
    /// @param _from From friend address
    function denyRequest(address _from) public whenNotPaused {
        uint friendRequestIndex = requestsTracker[msg.sender][_from];
        
        // Check if the friend request exist
        require(friendRequestIndex != 0, "Friend request does not exist");
        
        // Check if the friend request has already been removed
        require(friendRequestIndex != MAX_UINT, "Friend request has been removed");
        
        _removeRequest(msg.sender, _from);

        emit FriendRequestDenied(_from);
    }

    /// @notice Remove a friend request from the mapping
    /// @param to To friend address
    function removeRequest(address to) public whenNotPaused {
        uint index = requestsTracker[to][msg.sender];
        require(index != 0, "Friend request does not exist");

        _removeRequest(to, msg.sender);

        emit FriendRequestRemoved(to);
    }

    /// @notice Remove a friend from the mapping
    /// @param _toRemove To friend address
    function removeFriend(address _toRemove) public whenNotPaused {
        uint index = friendsTracker[msg.sender][_toRemove];
        require(index != 0, "Friend does not exist");

        _removeFriend(msg.sender, _toRemove);
        _removeFriend(_toRemove, msg.sender);

        emit FriendRemoved(_toRemove);
    }
    
    /// @notice Returns the friends list related to the msg.sender
    /// @return Friends mapping related
    function getFriends() public view returns (Friend[] memory) {
        return friends[msg.sender];
    }
    
    /// @notice Returns the requests list directed to the msg.sender
    /// @return Friends requests mapping related
    function getRequests() public view returns (FriendRequest[] memory) {
        return requests[msg.sender];
    }

    /// @notice Pause the contract
    /// @dev Only the owner can pause the contract
    function pauseContract() public onlyOwner whenNotPaused { 
        _pause();
    }

    /// @notice Unpause the contract
    /// @dev Only the owner can unpause the contract
    function unpauseContract() public onlyOwner whenPaused { 
        _unpause();
    }
}