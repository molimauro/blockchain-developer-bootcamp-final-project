import { Flex } from "@chakra-ui/layout";
import {
    Button,
    Input,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from "@chakra-ui/react";
import { isAddress } from "@ethersproject/address";
import { useWeb3React } from "@web3-react/core";
import { useAppContext } from "AppContext";
import Requests from "components/requests/Requests";
import FriendsABI from "contract-build/contracts/Friends.json";
import { useContract } from "hooks/useContract";
import { useContractAddress } from "hooks/useContractAddress";
import useIdentity from "hooks/useIdentity";
import React from "react";

function AddFriend({ friendsAddress }: { friendsAddress: string }) {
    const [address, setAddress] = React.useState("");
    const [status, setStatus] = React.useState<"idle" | "loading" | "success">(
        "idle",
    );
    const { setContentError, requestsNumber } = useAppContext();
    const { account, chainId } = useWeb3React();
    const { identity } = useIdentity();

    const contract = useContract(friendsAddress, FriendsABI.abi);

    const onAddFriend = async () => {
        if (!isAddress(address)) {
            return setContentError("Please insert a valid address");
        }
        try {
            setStatus("loading");
            const transaction = await contract.makeRequest(
                address,
                identity.public.toString(),
                {
                    from: account,
                },
            );
            const confirmations = chainId === 1337 ? 1 : 2;
            await transaction.wait(confirmations);
            setStatus("success");
            console.log(transaction);
        } catch (e: any) {
            console.log(e);
            let error = e.message;
            if (e.data?.message) {
                error = e.data.message.split("revert")[1];
            }
            setContentError(error);
            setStatus("idle");
        }
    };

    return (
        <Tabs isFitted userSelect="none">
            <TabList>
                <Tab
                    _selected={{ color: "white", bg: "brand.600" }}
                    fontWeight="bold"
                >
                    Add friend
                </Tab>
                <Tab
                    _selected={{ color: "white", bg: "brand.600" }}
                    fontWeight="bold"
                >
                    Incoming requests ({requestsNumber})
                </Tab>
            </TabList>

            <TabPanels>
                <TabPanel>
                    <Flex
                        p="20px"
                        alignItems="center"
                        flexDir="column"
                        justifyContent="space-evenly"
                        height="200px"
                    >
                        <Text>Let's add some friends!</Text>
                        <Input
                            border="2px"
                            borderColor="brand.700"
                            bg="white"
                            color="brand.700"
                            value={address}
                            disabled={status === "loading"}
                            onChange={event => setAddress(event.target.value)}
                            placeholder="Paste here an address"
                            onKeyPress={e => {
                                if (e.key === "Enter") {
                                    onAddFriend();
                                }
                            }}
                        />
                        <Button
                            isLoading={status === "loading"}
                            onClick={onAddFriend}
                            // bg="brand.100"
                        >
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

const AddFriendsWrapper = () => {
    const { friendsAddress } = useContractAddress();
    if (!friendsAddress) return null;
    return <AddFriend friendsAddress={friendsAddress} />;
};

export default AddFriendsWrapper;
