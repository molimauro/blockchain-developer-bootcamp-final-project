import { Box, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import AddFriend from "components/addFriend/addFriend";
import CommonChat from "components/commonChat/commonChat";
import CommonError from "components/commonError/CommonError";
import Friends from "components/friends/Friends";
import TopBar from "components/topBar/TopBar";
import React from "react";
import { AppContextProvider } from "./AppContext";

declare global {
  interface Window {
    ethereum: any;
  }
}

function getLibrary(provider: any) {
  return new Web3Provider(provider);
}

function App() {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => window.location.reload());
    window.ethereum.on("chainChanged", () => window.location.reload());
  }

  return (
    <AppContextProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Box className="App" bg="brand.700" h="100vh">
          <CommonError />
          <Box w="1400px" m="0 auto" bg="brand.700" h="100%">
            <Flex as="nav" h="150px" bg="brand.700">
              <TopBar />
            </Flex>
            <Grid
              h="calc(100vh - 150px)"
              templateRows="repeat(2, 1fr)"
              templateColumns="repeat(5, 1fr)"
              gap={2}
            >
              <GridItem
                rowSpan={2}
                colSpan={3}
                bg="brand.50"
                borderRadius="10px"
              >
                <CommonChat />
              </GridItem>
              <GridItem
                colSpan={2}
                bg="brand.100"
                borderRadius="10px"
                minHeight="0"
                overflow="auto"
                p="10px"
              >
                <Text textAlign="center" fontWeight="bold">
                  Friends
                </Text>
                <Friends />
              </GridItem>
              <GridItem
                colSpan={2}
                bg="brand.100"
                borderRadius="10px"
                minHeight="0"
                overflow="auto"
              >
                <AddFriend />
              </GridItem>
            </Grid>
          </Box>
        </Box>
      </Web3ReactProvider>
    </AppContextProvider>
  );
}

export default App;
