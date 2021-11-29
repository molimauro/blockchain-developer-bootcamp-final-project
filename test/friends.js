const Friends = artifacts.require("Friends");

const randomPubKey = "someRandomPubKey";

contract("Friend", (accounts) => {
  it("Friends contract should be deployed", async function () {
    const instance = await Friends.deployed();
    assert.notEqual(instance, null);
  });

  it("User should be able to send a friend request", async function () {
    const instance = await Friends.deployed();
    const requestsBefore = await instance.getRequests();
    const senderPublicKey = randomPubKey;

    let error = null;

    await instance
      .makeRequest(accounts[0], senderPublicKey, {
        from: accounts[1],
      })
      .catch((e) => {
        error = e;
      });

    assert.equal(error, null, "Unable to make a friend request");

    const requestsAfter = await instance.getRequests();

    assert.equal(
      requestsBefore.length + 1,
      requestsAfter.length,
      "Request has not been added"
    );
  });

  it("User cannot send the same request twice", async function () {
    const instance = await Friends.deployed();
    const requestsBefore = await instance.getRequests();
    const senderPublicKey = randomPubKey;

    let error = null;

    await instance
      .makeRequest(accounts[0], senderPublicKey, {
        from: accounts[1],
      })
      .catch((e) => {
        error = e;
      });

    assert.notEqual(error, null, "Unable to make a friend request");

    const requestsAfter = await instance.getRequests();

    assert.equal(
      requestsBefore.length,
      requestsAfter.length,
      "Request has been added even if it shouldn't be"
    );
  });

  it("Receiver should be able to accept a request", async function () {
    const instance = await Friends.deployed();
    const requestsBefore = await instance.getRequests();
    const friendsBefore = await instance.getFriends({ from: accounts[0] });
    const senderFriendsBefore = await instance.getFriends({
      from: accounts[1],
    });

    const receiverPublicKey = randomPubKey;

    let error = null;

    await instance
      .acceptRequest(accounts[1], receiverPublicKey, {
        from: accounts[0],
      })
      .catch((e) => {
        error = e;
      });

    assert.equal(error, null, "Unable to accept a friend request");

    const requestsAfter = await instance.getRequests();
    const friendsAfter = await instance.getFriends({ from: accounts[0] });
    const senderFriendsAfter = await instance.getFriends({
      from: accounts[1],
    });

    assert.equal(
      requestsBefore.length,
      requestsAfter.length + 1,
      "Request has not been added"
    );

    assert.equal(
      friendsBefore.length + 1,
      friendsAfter.length,
      "Friend has not been moved to the receiver list"
    );

    assert.equal(
      senderFriendsBefore.length + 1,
      senderFriendsAfter.length,
      "Friend has not been moved to the sender list"
    );
  });

  it("User should be able to remove a friend", async function () {
    const instance = await Friends.deployed();
    const friendsBefore = await instance.getFriends({ from: accounts[0] });
    const otherFriendsBefore = await instance.getFriends({ from: accounts[1] });

    let error = null;

    await instance
      .removeFriend(accounts[1], {
        from: accounts[0],
      })
      .catch((e) => {
        error = e;
      });

    assert.equal(error, null, "Unable to remove a friend");

    const friendsAfter = await instance.getFriends({ from: accounts[0] });
    const otherFriendsAfter = await instance.getFriends({ from: accounts[1] });

    assert.equal(
      friendsBefore.length,
      friendsAfter.length + 1,
      "Friend has not been removed"
    );

    assert.equal(
      otherFriendsBefore.length,
      otherFriendsAfter.length + 1,
      "Friend has not been removed from the other account"
    );
  });

  it("User should be able to remove a request", async function () {
    const instance = await Friends.deployed();
    const senderPublicKey = randomPubKey;

    let error = null;

    await instance
      .makeRequest(accounts[0], senderPublicKey, {
        from: accounts[1],
      })
      .catch((e) => {
        error = e;
      });

    assert.equal(error, null, "Unable to make a friend request");

    const requestsBefore = await instance.getRequests({ from: accounts[0] });

    await instance
      .removeRequest(accounts[0], {
        from: accounts[1],
      })
      .catch((e) => {
        error = e;
      });

    assert.equal(error, null, "Unable to remove a friend request");

    const requestsAfter = await instance.getRequests({ from: accounts[0] });

    assert.equal(
      requestsBefore.length,
      requestsAfter.length + 1,
      "Request has not been removed"
    );
  });

  it("User should be able to deny a request", async function () {
    const instance = await Friends.deployed();
    const senderPublicKey = randomPubKey;

    let error = null;

    await instance
      .makeRequest(accounts[0], senderPublicKey, {
        from: accounts[1],
      })
      .catch((e) => {
        error = e;
      });

    assert.equal(error, null, "Unable to make a friend request");

    const requestsBefore = await instance.getRequests({ from: accounts[0] });

    await instance
      .denyRequest(accounts[1], {
        from: accounts[0],
      })
      .catch((e) => {
        error = e;
      });

    assert.equal(error, null, "Unable to deny a friend request");

    const requestsAfter = await instance.getRequests({ from: accounts[0] });

    assert.equal(
      requestsBefore.length,
      requestsAfter.length + 1,
      "Request has not been removed"
    );
  });
});
