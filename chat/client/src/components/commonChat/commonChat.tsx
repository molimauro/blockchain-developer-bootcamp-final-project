import { Avatar } from "@chakra-ui/avatar";
import { IconButton } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MailboxEvent } from "@textile/hub";
import { useWeb3React } from "@web3-react/core";
import { useAppContext } from "AppContext";
import useCommonChatIdentity from "hooks/useCommonChatIdentity";
import useIdentity from "hooks/useIdentity";
import React, { useEffect, useState } from "react";
import { DecryptedInbox, messageDecoder, sendMessage } from "utils/textile";
import { addressToNumber, toHex } from "utils/utils";

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

function Message({ id, body, from, readAt, sent }: DecryptedInbox) {
  const color = colors[addressToNumber(toHex(from.slice(-5))) % colors.length];

  return (
    <Flex alignItems="center" mt="10px" mb="10px" position="relative">
      <Avatar bg={color} mr="5px" />
      <Text m="5px">{body}</Text>
      <Text fontSize="small" position="absolute" right="0px">
        {new Date(sent / 1000000).toLocaleDateString("en-US", {
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
  const [status, setStatus] = useState<"idle" | "fetching" | "error">(
    "fetching"
  );
  const [msgStatus, setMsgStatus] = useState<"idle" | "loading" | "error">(
    "idle"
  );
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState<DecryptedInbox[]>([]);
  const { account } = useWeb3React();
  const {
    mailID,
    users: ccUsers,
    identity: ccIdentity,
  } = useCommonChatIdentity();
  const { users, identity } = useIdentity();
  const { setContentError } = useAppContext();

  useEffect(() => {
    async function getInboxMessages() {
      // Grab all existing inbox messages and decrypt them locally
      const messages = await ccUsers.listInboxMessages();
      const inbox = [];
      for (const message of messages) {
        inbox.push(await messageDecoder(ccIdentity, message));
      }

      setMessages(inbox.sort((a, b) => a.sent - b.sent));

      // Watch for new messages
      ccUsers.watchInbox(mailID, handleNewMessage);

      setStatus("idle");
    }
    if (mailID) getInboxMessages();
  }, [mailID]);

  async function handleNewMessage(reply?: MailboxEvent, err?: Error) {
    if (err) return;
    if (!reply || !reply.message) return;
    const message = await messageDecoder(ccIdentity, reply.message);
    setMessages((prev) => [...prev, message]);
  }

  if (!account) {
    return null;
  }

  return (
    <Flex p="10px" h="100%" flexDirection="column">
      {status === "idle" && (
        <>
          <Flex
            flexDirection="column-reverse"
            p="10px"
            overflowY="scroll"
            flex="1"
          >
            <Box>
              {messages.map((message, index) => (
                <Message key={index} {...message} />
              ))}
            </Box>
          </Flex>
          <Flex alignItems="center">
            <Input
              maxLength={140}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type something"
            />
            <IconButton
              m="5px"
              color="brand.800"
              aria-label="accept"
              isLoading={msgStatus === "loading"}
              onClick={async () => {
                setMsgStatus("loading");
                try {
                  await sendMessage(
                    users,
                    identity,
                    ccIdentity.public,
                    message
                  );
                  setMessage("");
                } catch (e: any) {
                  e?.message && setContentError(e.message);
                }
                setMsgStatus("idle");
              }}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </IconButton>
          </Flex>
        </>
      )}
      {status === "fetching" && (
        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100%"
          width="100%"
        >
          <Text mb="20px">Fetching common chat...</Text>
          <Spinner size="xl" />
        </Flex>
      )}
    </Flex>
  );
}
