import React, { createContext, useReducer } from "react";

const initialContext = {
  ethBalance: "--",
  setEthBalance: (balance: string) => {},
  refetchFriends: false,
  setRefetchFriends: (bool: boolean) => {},
  requestsNumber: 0,
  setRequestNumber: (num: number) => {},
  contentError: undefined,
  setContentError: (str: string) => {},
};

const appReducer = (
  state: typeof initialContext,
  { type, payload }: { type: any; payload: any }
) => {
  switch (type) {
    case "SET_ETH_BALANCE":
      return {
        ...state,
        ethBalance: payload,
      };

    case "SET_REFETCH_FRIENDS":
      return {
        ...state,
        refetchFriends: payload,
      };

    case "SET_REQUEST_NUMBER":
      return {
        ...state,
        requestsNumber: payload,
      };

    case "SET_CONTENT_ERROR":
      return {
        ...state,
        contentError: payload,
      };

    default:
      return state;
  }
};

const AppContext = createContext(initialContext);
export const useAppContext = () => React.useContext(AppContext);
export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [store, dispatch] = useReducer(appReducer, initialContext);

  const contextValue = {
    ethBalance: store.ethBalance,
    setEthBalance: (balance: string) => {
      dispatch({ type: "SET_ETH_BALANCE", payload: balance });
    },
    refetchFriends: store.refetchFriends,
    setRefetchFriends: (bool: boolean) => {
      dispatch({ type: "SET_REFETCH_FRIENDS", payload: bool });
    },
    requestsNumber: store.requestsNumber,
    setRequestNumber: (num: number) => {
      dispatch({ type: "SET_REQUEST_NUMBER", payload: num });
    },
    contentError: store.contentError,
    setContentError: (str: string) => {
      dispatch({ type: "SET_CONTENT_ERROR", payload: str });
    },
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
