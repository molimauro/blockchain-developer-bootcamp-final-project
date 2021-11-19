// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title FriendRequester
 * @dev Maps friend requests along with associated threadIDs
 */
contract Friends is Ownable, Pausable {
    
    struct FriendRequest {
        address sender;
        string pubKey;
    }

    struct Friend {
        address dweller; // Address of the friend
        string pubKey;
    }
    
    uint MAX_UINT = 2**256 - 1;


    // All friend requests received by an address
    mapping(address => FriendRequest[]) private requests;
    
    // Tracks the index of each friend request inside the mapping
    mapping(address => mapping(address => uint)) private requestsTracker;
    
    // All friends that an address has
    mapping(address => Friend[]) private friends;
    
    // Tracks the index of each Friend inside the mapping
    mapping(address => mapping(address => uint)) private friendsTracker;

    event FriendRequestSent(address indexed to);
    event FriendRequestAccepted(address indexed from);
    event FriendRequestDenied(address indexed from);
    event FriendRequestRemoved(address indexed to);
    event FriendRemoved(address indexed friendRemoved);


    /**
     * @dev Returns a friend from the friends mapping
     * @return fr
     */
    function _getFriend(address _from, address _toGet) private view returns (Friend memory fr) {
        uint index = friendsTracker[_from][_toGet];
        require(index != 0, "Friend does not exist");
        return friends[_from][index - 1];
    }
    
    /**
     * @dev Adds a friend to the friends mapping
     */
    function _addFriend(address _to, Friend memory fr) private {
        friends[_to].push(fr);
        uint index = friends[_to].length;
        friendsTracker[_to][fr.dweller] = index;
    }
    
    /**
     * @dev Removes a friend from the friends mapping
     */
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
    
    /**
     * @dev Returns a friend request from the requests mapping
     * @return fr
     */
    function _getRequest(address _from, address _toGet) private view returns (FriendRequest memory fr) {
        uint index = requestsTracker[_from][_toGet];
        require(index != 0, "Request does not exist");
        return requests[_from][index];
    }
    
    /**
     * @dev Adds a friend request to the requests mapping
     */
    function _addRequest(address _to, FriendRequest memory _from) private {
        requests[_to].push(_from);
        uint index = requests[_to].length;
        requestsTracker[_to][_from.sender] = index;
    }
    
    /**
     * @dev Removes a friend request from the requests mapping
     */
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
        
        // Reduce the size of the array by 1
        requests[_from].pop();
    }

    /**
     * @dev Add a new friend request
     */
    function makeRequest(address _to, string memory _pubKey) public whenNotPaused {
        uint index = requestsTracker[_to][msg.sender];
        require(index == 0 || index == MAX_UINT, "Friend request already sent");

        _addRequest(
            _to,
            FriendRequest(msg.sender, _pubKey)
        );

        emit FriendRequestSent(_to);
    }
    
    /**
     * @dev Accept a friend request
     */
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

    /**
     * @dev Deny a friend request
     */
    function denyRequest(address _from) public whenNotPaused {
        uint friendRequestIndex = requestsTracker[msg.sender][_from];
        
        // Check if the friend request exist
        require(friendRequestIndex != 0, "Friend request does not exist");
        
        // Check if the friend request has already been removed
        require(friendRequestIndex != MAX_UINT, "Friend request has been removed");
        
        _removeRequest(msg.sender, _from);

        emit FriendRequestDenied(_from);
    }

    /**
     * @dev Remove a friend request
     */
    function removeRequest(address to) public whenNotPaused {
        uint index = requestsTracker[to][msg.sender];
        require(index != 0, "Friend request does not exist");

        _removeRequest(to, msg.sender);

        emit FriendRequestRemoved(to);
    }

    /**
     * @dev Remove a friend
     */
    function removeFriend(address _toRemove) public whenNotPaused {
        uint index = friendsTracker[msg.sender][_toRemove];
        require(index != 0, "Friend does not exist");

        _removeFriend(msg.sender, _toRemove);
        _removeFriend(_toRemove, msg.sender);

        emit FriendRemoved(_toRemove);
    }
    
    /**
     * @dev Returns the friends list related to the msg.sender
     */
    function getFriends() public view returns (Friend[] memory) {
        return friends[msg.sender];
    }
    
    /**
     * @dev Returns the requests list related directed to the msg.sender
     */
    function getRequests() public view returns (FriendRequest[] memory) {
        return requests[msg.sender];
    }

    function pauseContract() public onlyOwner whenNotPaused { 
        _pause();
    }

    function unpauseContract() public onlyOwner whenPaused { 
        _unpause();
    }
}