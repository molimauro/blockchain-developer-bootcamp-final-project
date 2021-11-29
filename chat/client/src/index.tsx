import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

// #08bac7
const theme = extendTheme({
    colors: {
        brand: {
            50: "#d7f8ff",
            100: "#aceefe",
            200: "#7ee6fb",
            300: "#4ee2f9",
            400: "#22e1f6",
            500: "#09cedd",
            600: "#0095ad",
            700: "#00637c",
            800: "#00374c",
            900: "#00121d",
        },
    },
});

ReactDOM.render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <App />
        </ChakraProvider>
    </React.StrictMode>,
    document.getElementById("root"),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
