import { useWeb3React } from "@web3-react/core";
import FriendsABI from "contract-build/contracts/Friends.json";
import { useEffect, useState } from "react";

export function useContractAddress() {
    const { chainId } = useWeb3React();
    const [friendsAddress, setFriendsAddress] = useState(null);

    useEffect(() => {
        if (chainId) {
            // @ts-ignores-ignore
            setFriendsAddress(FriendsABI.networks[chainId]?.address);
        }
    }, [chainId]);

    return {
        friendsAddress,
    };
}
