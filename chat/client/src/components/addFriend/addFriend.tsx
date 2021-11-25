import { Flex } from "@chakra-ui/layout";
import {
  Button,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { isAddress } from "@ethersproject/address";
import { useWeb3React } from "@web3-react/core";
import { useAppContext } from "AppContext";
import Requests from "components/requests/Requests";
import FriendsABI from "contracts/Friends.json";
import { useContract } from "hooks/useContract";
import React from "react";
import { FRIENDS_ADDRESS } from "utils/constants";

export default function AddFriend() {
  const [address, setAddress] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">(
    "idle"
  );
  const { setContentError, requestsNumber } = useAppContext();
  const { account, chainId } = useWeb3React();
  const contract = useContract(FRIENDS_ADDRESS, FriendsABI.abi);

  const onAddFriend = async () => {
    if (!isAddress(address)) {
      return setContentError("Please insert a valid address");
    }
    try {
      setStatus("loading");

      const transaction = await contract.makeRequest(address, "pubkey", {
        from: account,
      });
      const confirmations = chainId === 1337 ? 1 : 2;
      await transaction.wait(confirmations);
      setStatus("success");
      console.log(transaction);
    } catch (e: any) {
      let error = e.message;
      if (e.data?.message) {
        error = e.data.message.split("revert")[1];
      }
      setContentError(error);
      setStatus("idle");
    }
  };

  return (
    <Tabs isFitted>
      <TabList>
        <Tab fontWeight="bold">Add friend</Tab>
        <Tab fontWeight="bold">Incoming requests ({requestsNumber})</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Flex
            p="20px"
            alignItems="center"
            flexDir="column"
            justifyContent="space-evenly"
          >
            <Input
              value={address}
              disabled={status === "loading"}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Paste here an address"
            />
            <Button isLoading={status === "loading"} onClick={onAddFriend}>
              Add
            </Button>
          </Flex>
        </TabPanel>
        <TabPanel>
          <Requests />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
