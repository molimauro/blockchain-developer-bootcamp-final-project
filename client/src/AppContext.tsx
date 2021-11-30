import React, { createContext, useReducer } from "react";

const initialContext = {
    ethBalance: "--",
    setEthBalance: (balance: string) => {},
    refetchFriends: false,
    setRefetchFriends: (bool: boolean) => {},
    selectedFriend: "",
    setSelectedFriend: (str: string) => {},
    friends: [] as [string, string][],
    setFriends: (friends: [string, string][]) => {},
    requestsNumber: 0,
    setRequestNumber: (num: number) => {},
    contentError: undefined,
    setContentError: (str: string) => {},
    contentSucc: undefined,
    setContentSucc: (str: string) => {},
};

const appReducer = (
    state: typeof initialContext,
    { type, payload }: { type: any; payload: any },
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

        case "SET_SELECTED_FRIEND":
            return {
                ...state,
                selectedFriend: payload,
            };

        case "SET_FRIENDS":
            return {
                ...state,
                friends: payload,
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

        case "SET_CONTENT_SUCC":
            return {
                ...state,
                contentSucc: payload,
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
        selectedFriend: store.selectedFriend,
        setSelectedFriend: (str: string) => {
            dispatch({ type: "SET_SELECTED_FRIEND", payload: str });
        },
        friends: store.friends,
        setFriends: (friends: [string, string][]) => {
            dispatch({ type: "SET_FRIENDS", payload: friends });
        },
        requestsNumber: store.requestsNumber,
        setRequestNumber: (num: number) => {
            dispatch({ type: "SET_REQUEST_NUMBER", payload: num });
        },
        contentError: store.contentError,
        setContentError: (str: string) => {
            dispatch({ type: "SET_CONTENT_ERROR", payload: str });
        },
        contentSucc: store.contentSucc,
        setContentSucc: (str: string) => {
            dispatch({ type: "SET_CONTENT_SUCC", payload: str });
        },
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
