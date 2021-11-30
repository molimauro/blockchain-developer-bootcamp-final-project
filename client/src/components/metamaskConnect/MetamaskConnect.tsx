import { Button, Flex, Text } from "@chakra-ui/react";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { useAppContext } from "AppContext";
import { injectedProvider } from "connectors";
import React, { useEffect, useState } from "react";
import { ReactComponent as MetaMaskLogo } from "static/metamask-logo.svg";
import { shortenAddress } from "utils/shortenAddress";

const MetamaskConnect = () => {
    const { setContentError } = useAppContext();
    const { activate, active, account, deactivate } = useWeb3React();
    const [status, setStatus] = useState<"loading" | "ready">("loading");

    useEffect(() => {
        injectedProvider.isAuthorized().then(async (isAuthorized: boolean) => {
            if (isAuthorized) {
                await activate(injectedProvider, undefined, true).catch(e => {
                    console.log("error", e);
                });
            }
            setStatus("ready");
        });
    }, []);

    return (
        <Flex
            bg="brand.600"
            h="120px"
            w="170px"
            lineHeight="50px"
            p="10px"
            borderRadius="5px"
            border="2px solid"
            borderColor="brand.800"
            fontWeight="bold"
            alignItems="center"
            justifyContent="center"
        >
            {!active && (
                <Button
                    isLoading={status === "loading"}
                    leftIcon={<MetaMaskLogo />}
                    onClick={async () => {
                        setStatus("loading");
                        if (!window.ethereum) {
                            setContentError(
                                "Looks like you don't have Metamask, you'll need it to use this app.",
                            );
                            setStatus("ready");
                            return;
                        }
                        await activate(injectedProvider, e => {
                            if (e instanceof UnsupportedChainIdError) {
                                setStatus("ready");
                                console.log("Only Ropsten supported.");
                                setContentError("Only Ropsten supported.");
                            }
                        });
                        setStatus("ready");
                    }}
                >
                    Connect
                </Button>
            )}
            {active && (
                <Flex
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                >
                    <Text>{account ? shortenAddress(account) : ""}</Text>
                    <Button
                        onClick={() => {
                            deactivate();
                        }}
                    >
                        Log Out
                    </Button>
                </Flex>
            )}
        </Flex>
    );
};

export default MetamaskConnect;
