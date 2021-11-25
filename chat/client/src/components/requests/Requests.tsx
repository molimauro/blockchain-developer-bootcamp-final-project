import { Avatar } from "@chakra-ui/avatar";
import { IconButton } from "@chakra-ui/button";
import { Flex, Text } from "@chakra-ui/layout";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useWeb3React } from "@web3-react/core";
import { useAppContext } from "AppContext";
import FriendsABI from "contracts/Friends.json";
import { useContract } from "hooks/useContract";
import React, { useCallback, useEffect, useState } from "react";
import { FRIENDS_ADDRESS } from "utils/constants";

function Request({
  address,
  requests,
  setRequests,
}: {
  address: string;
  requests: string[];
  setRequests: Function;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const contract = useContract(FRIENDS_ADDRESS, FriendsABI.abi);
  const { setContentError, setRefetchFriends } = useAppContext();
  const { account, chainId } = useWeb3React();

  const onAccept = async () => {
    try {
      setStatus("loading");
      const transaction = await contract.acceptRequest(address, "pubkey", {
        from: account,
      });
      const confirmations = chainId === 1337 ? 1 : 2;
      await transaction.wait(confirmations);
      setStatus("idle");
      setRequests(requests.filter((r) => r !== address));
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

  const onDecline = async () => {
    try {
      setStatus("loading");
      const transaction = await contract.denyRequest(address, {
        from: account,
      });
      const confirmations = chainId === 1337 ? 1 : 2;
      await transaction.wait(confirmations);
      setStatus("idle");
      setRequests(requests.filter((r) => r !== address));
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
        color="teal.500"
        isLoading={status === "loading"}
        aria-label="accept"
        onClick={onAccept}
        icon={<FontAwesomeIcon icon={faCheck} />}
      />
      <IconButton
        color="red.500"
        isLoading={status === "loading"}
        aria-label="deny"
        onClick={onDecline}
        icon={<FontAwesomeIcon icon={faTimes} />}
      />
    </Flex>
  );
}

export default function Requests() {
  const [requests, setRequests] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "fetching" | "error">(
    "fetching"
  );
  const { active } = useWeb3React();
  const contract = useContract(FRIENDS_ADDRESS, FriendsABI.abi);
  const { setRequestNumber } = useAppContext();

  const getRequests = useCallback(async (contract) => {
    try {
      const contractRequests = await contract.getRequests();
      setRequests(
        contractRequests.map((request: [string, string]) => request[0])
      );
      // setListings(arr);
      setStatus("idle");
      setRequestNumber(contractRequests.length);
    } catch (e) {
      console.log("error:", e);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (active) {
      getRequests(contract);
    }
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <Flex alignItems="center" flexDir="column" justifyContent="space-evenly">
      {requests.map((r, i) => (
        <Request
          key={i}
          address={r}
          requests={requests}
          setRequests={setRequests}
        />
      ))}
    </Flex>
  );
}
