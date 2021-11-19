import { InjectedConnector } from "@web3-react/injected-connector";

export const injectedProvider = new InjectedConnector({
  supportedChainIds: [4],
});
