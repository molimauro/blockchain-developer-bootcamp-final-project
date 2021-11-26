import { Avatar } from "@chakra-ui/avatar";
import { IconButton } from "@chakra-ui/button";
import { usePrevious } from "@chakra-ui/hooks";
import { Flex, Text } from "@chakra-ui/layout";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useWeb3React } from "@web3-react/core";
import { useAppContext } from "AppContext";
import FriendsABI from "contracts/Friends.json";
import { useContract } from "hooks/useContract";
import React, { useCallback, useEffect, useState } from "react";
import { FRIENDS_ADDRESS } from "utils/constants";

function Friend({ address }: { address: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const contract = useContract(FRIENDS_ADDRESS, FriendsABI.abi);
  const { setContentError, setRefetchFriends } = useAppContext();
  const { account, chainId } = useWeb3React();

  const onRemove = async () => {
    try {
      setStatus("loading");
      const transaction = await contract.removeFriend(address, {
        from: account,
      });
      const confirmations = chainId === 1337 ? 1 : 2;
      await transaction.wait(confirmations);
      setStatus("idle");
      setRefetchFriends(true);
    } catch (e: any) {
      let error = e.message;
      if (e.data?.message) {
        error = e.data.message.split("revert")[1];
      }
      setContentError(error);
      setStatus("error");
    }
  };

  return (
    <Flex alignItems="center">
      <Avatar bg="teal.500" />
      <Text m="5px">{address}</Text>
      <IconButton
        m="5px"
        color="brand.800"
        isLoading={status === "loading"}
        aria-label="remove-friend"
        onClick={onRemove}
        icon={<FontAwesomeIcon icon={faTrash} />}
      />
    </Flex>
  );
}

export default function Friends() {
  const [friends, setFriends] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "fetching" | "error">(
    "fetching"
  );
  const { active } = useWeb3React();
  const contract = useContract(FRIENDS_ADDRESS, FriendsABI.abi);
  const { refetchFriends, setRefetchFriends } = useAppContext();

  const prevActive = usePrevious(active);
  const getFriends = useCallback(async (contract) => {
    try {
      const contractFriends = await contract.getFriends();
      setFriends(
        contractFriends.map((request: [string, string]) => request[0])
      );
      // setListings(arr);
      setStatus("idle");
    } catch (e) {
      console.log("error:", e);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if ((!prevActive && active) || refetchFriends) {
      getFriends(contract);
    }
    if (refetchFriends) {
      setRefetchFriends(false);
    }
  }, [active, refetchFriends]);

  if (!active) {
    return null;
  }

  return (
    <Flex alignItems="center" flexDir="column" justifyContent="space-evenly">
      {friends.map((r, i) => (
        <Friend key={i} address={r} />
      ))}
    </Flex>
  );
}
