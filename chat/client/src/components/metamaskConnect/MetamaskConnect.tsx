import { Box, Button, Text } from "@chakra-ui/react";
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
        await activate(injectedProvider, undefined, true).catch((e) => {
          console.log("error", e);
        });
      }
      setStatus("ready");
    });
  }, []);

  if (!active) {
    return (
      <Button
        isLoading={status === "loading"}
        leftIcon={<MetaMaskLogo />}
        onClick={async () => {
          setStatus("loading");
          if (!window.ethereum) {
            setContentError(
              "Looks like you don't have Metamask, you'll need it to use this app."
            );
            return;
          }
          await activate(injectedProvider, (e) => {
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
    );
  }

  return (
    <Box>
      <Text>{account ? shortenAddress(account) : ""}</Text>
      <Button
        onClick={() => {
          deactivate();
        }}
      >
        Log Out
      </Button>
    </Box>
  );
};

export default MetamaskConnect;
