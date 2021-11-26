import { Avatar } from "@chakra-ui/avatar";
import { IconButton } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useWeb3React } from "@web3-react/core";
import React from "react";
import { addressToNumber, toHex } from "utils/utils";
interface MessageType {
  from: string;
  text: string;
  createdAt?: Date;
}
const colors = [
  "#fc5c65",
  "#fd9644",
  "#fed330",
  "#26de81",
  "#2bcbba",
  "#eb3b5a",
  "#fa8231",
  "#f7b731",
  "#20bf6b",
  "#0fb9b1",
  "#45aaf2",
  "#4b7bec",
  "#a55eea",
  "#d1d8e0",
  "#778ca3",
  "#2d98da",
  "#3867d6",
  "#8854d0",
  "#a5b1c2",
  "#4b6584",
];

function Message({ from, text, createdAt }: MessageType) {
  const color = colors[addressToNumber(toHex(from)) % colors.length];

  return (
    <Flex alignItems="center" mt="10px" mb="10px" position="relative">
      <Avatar bg={color} mr="5px" />
      <Text m="5px">{text}</Text>
      <Text fontSize="small" position="absolute" right="0px">
        {new Date().toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </Flex>
  );
}

export default function CommonChat() {
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState<string[]>([]);
  const { account } = useWeb3React();

  if (!account) {
    return null;
  }

  return (
    <Flex p="10px" h="100%" flexDirection="column">
      <Flex flexDirection="column-reverse" p="10px" overflowY="scroll" flex="1">
        <Box>
          {messages.map((message, index) => (
            <Message key={index} text={message} from={account} />
          ))}
        </Box>
      </Flex>
      <Flex alignItems="center">
        <Input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type something"
        />
        <IconButton
          m="5px"
          color="brand.800"
          aria-label="accept"
          onClick={() => {
            setMessages([...messages, message]);
            setMessage("");
          }}
          icon={<FontAwesomeIcon icon={faPaperPlane} />}
        />
      </Flex>
    </Flex>
  );
}
