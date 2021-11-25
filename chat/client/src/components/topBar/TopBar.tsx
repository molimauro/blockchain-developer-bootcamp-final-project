import { Flex } from "@chakra-ui/layout";
import { Box, Text } from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import MetamaskConnect from "components/metamaskConnect/MetamaskConnect";
import useEth from "hooks/useEth";
import React, { useEffect } from "react";

function BalanceCard() {
  const { active, account } = useWeb3React();
  const { fetchEthBalance, ethBalance } = useEth();

  useEffect(() => {
    if (account) {
      fetchEthBalance();
    }
  }, [account]);

  if (!active) {
    return <Text>{""}</Text>;
  }

  return (
    <Box>
      <Text>ETH balance: {ethBalance}</Text>
    </Box>
  );
}

export default function TopBar() {
  return (
    <Flex alignItems="center" justifyContent="space-between" w="100%">
      <BalanceCard />

      <MetamaskConnect />
    </Flex>
  );
}
