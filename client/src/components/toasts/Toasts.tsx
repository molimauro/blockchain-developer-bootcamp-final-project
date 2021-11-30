import { Box, Fade, Text } from "@chakra-ui/react";
import { useAppContext } from "AppContext";
import { useEffect } from "react";

export const CommonError = () => {
    const { contentError, setContentError } = useAppContext();

    useEffect(() => {
        if (contentError) {
            setTimeout(() => {
                setContentError("");
            }, 5000);
        }
    }, [contentError, setContentError]);

    return (
        <Fade in={contentError}>
            <Box
                pos="absolute"
                w="100%"
                textAlign="center"
                h="40px"
                lineHeight="40px"
                backgroundColor="red"
                fontWeight="bold"
            >
                <Text>{contentError}</Text>
            </Box>
        </Fade>
    );
};

export const CommonSucc = () => {
    const { contentSucc, setContentSucc } = useAppContext();

    useEffect(() => {
        if (contentSucc) {
            setTimeout(() => {
                setContentSucc("");
            }, 5000);
        }
    }, [contentSucc, setContentSucc]);

    return (
        <Fade in={contentSucc}>
            <Box
                pos="absolute"
                w="100%"
                textAlign="center"
                h="40px"
                lineHeight="40px"
                backgroundColor="green"
                fontWeight="bold"
            >
                <Text>{contentSucc}</Text>
            </Box>
        </Fade>
    );
};
