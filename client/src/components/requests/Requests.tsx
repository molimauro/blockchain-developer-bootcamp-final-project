import { Avatar } from "@chakra-ui/avatar";
import { IconButton } from "@chakra-ui/button";
import { Flex, Text } from "@chakra-ui/layout";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useWeb3React } from "@web3-react/core";
import { useAppContext } from "AppContext";
import FriendsABI from "contract-build/contracts/Friends.json";
import { useContract } from "hooks/useContract";
import { useContractAddress } from "hooks/useContractAddress";
import useIdentity from "hooks/useIdentity";
import React, { useCallback, useEffect, useState } from "react";

function Request({
    address,
    requests,
    setRequests,
    friendsAddress,
}: {
    address: string;
    requests: string[];
    setRequests: Function;
    friendsAddress: string;
}) {
    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const contract = useContract(friendsAddress, FriendsABI.abi);
    const {
        setContentError,
        setRefetchFriends,
        setContentSucc,
        setRequestNumber,
    } = useAppContext();
    const { account } = useWeb3React();
    const { identity } = useIdentity();

    if (!identity?.public) {
        return null;
    }
    console.log(identity);

    const onAccept = async () => {
        try {
            setStatus("loading");
            const transaction = await contract.acceptRequest(
                address,
                identity.public.toString(),
                {
                    from: account,
                },
            );
            const confirmations = 1;
            await transaction.wait(confirmations);
            setStatus("idle");
            setRequests(requests.filter(r => r !== address));
            setRequestNumber(requests.filter(r => r !== address).length);
            setRefetchFriends(true);
            setContentSucc("Request accepted!");
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
            const confirmations = 1;
            await transaction.wait(confirmations);
            setStatus("idle");
            setRequests(requests.filter(r => r !== address));
            setRefetchFriends(true);
            setContentSucc("Request declined!");
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

function Requests({ friendsAddress }: { friendsAddress: string }) {
    const [requests, setRequests] = useState<string[]>([]);
    const [status, setStatus] = useState<"idle" | "fetching" | "error">(
        "fetching",
    );
    const { active } = useWeb3React();
    const contract = useContract(friendsAddress, FriendsABI.abi);
    const { setRequestNumber } = useAppContext();

    const getRequests = useCallback(async contract => {
        try {
            const contractRequests = await contract.getRequests();
            setRequests(
                contractRequests.map((request: [string, string]) => request[0]),
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
        <Flex
            alignItems="center"
            flexDir="column"
            justifyContent="space-evenly"
        >
            {requests.map((r, i) => (
                <Request
                    key={i}
                    address={r}
                    requests={requests}
                    setRequests={setRequests}
                    friendsAddress={friendsAddress}
                />
            ))}
        </Flex>
    );
}

const RequestsWrapper = () => {
    const { friendsAddress } = useContractAddress();
    if (!friendsAddress) return null;
    return <Requests friendsAddress={friendsAddress} />;
};

export default RequestsWrapper;
