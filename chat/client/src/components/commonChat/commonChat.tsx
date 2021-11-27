import { Avatar } from "@chakra-ui/avatar";
import { IconButton } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MailboxEvent, PublicKey, Query, ThreadID } from "@textile/hub";
import { useWeb3React } from "@web3-react/core";
import { useAppContext } from "AppContext";
import useCommonChatIdentity from "hooks/useCommonChatIdentity";
import useIdentity from "hooks/useIdentity";
import React, { useEffect, useState } from "react";
import { COLORS } from "utils/constants";
import { shortenAddress } from "utils/shortenAddress";
import { DecryptedInbox, messageDecoder, sendMessage } from "utils/textile";
import { addressToNumber, toHex } from "utils/utils";

function Message({ id, body, from, readAt, sent }: DecryptedInbox) {
  const color = COLORS[addressToNumber(toHex(from.slice(-5))) % COLORS.length];

  return (
    <Flex alignItems="center" mt="10px" mb="10px" position="relative">
      <Avatar bg={color} mr="5px" />
      <Text m="5px" w="600px">
        {body}
      </Text>
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
  const { mailID: myMailId, users, identity, client } = useIdentity();
  const { setContentError, selectedFriend, friends } = useAppContext();

  const isCommonChat = selectedFriend === "";
  const isFriendChat = selectedFriend !== "";

  useEffect(() => {
    let inboxListener: any = null;
    let sentboxListener: any = null;
    async function getInboxMessages() {
      setStatus("fetching");
      setMessages([]);
      const friendPubKey = friends.find((f) => f[0] === selectedFriend);
      if (friendPubKey?.[1]) {
        await getMessageBetween(friendPubKey[1]);
        // Watch for new messages
        inboxListener = users.watchInbox(
          myMailId,
          async (reply?: MailboxEvent, err?: Error) => {
            if (err) return;
            if (!reply || !reply.message) return;
            const message = await messageDecoder(identity, reply.message);
            setMessages((prev) => [...prev, message]);
          }
        );
        sentboxListener = users.watchSentbox(
          myMailId,
          async (reply?: MailboxEvent, err?: Error) => {
            if (err) return;
            if (!reply || !reply.message) return;
            const message = await messageDecoder(identity, reply.message);
            setMessages((prev) => [...prev, message]);
          }
        );
      }
      setStatus("idle");
    }
    if (isFriendChat) {
      getInboxMessages();
    }
    return () => {
      if (inboxListener) inboxListener.close();
      if (sentboxListener) sentboxListener.close();
    };
  }, [selectedFriend]);

  async function getMessageBetween(friendPubKey: string) {
    const thread = await users.getThread("hubmail");
    const threadID = ThreadID.fromString(thread.id);
    const inboxQuery = Query.where("from").eq(friendPubKey).orderByIDDesc();
    const encryptedInbox = await client.find(threadID, "inbox", inboxQuery);
    const sentboxQuery = Query.where("to").eq(friendPubKey);
    const encryptedSentbox = await client.find(
      threadID,
      "sentbox",
      sentboxQuery
    );

    console.log(encryptedInbox, "encryptedInbox");
    console.log(encryptedSentbox, "encryptedSentbox");
    const messagesTest = [...encryptedInbox, ...encryptedSentbox].sort();
    console.log(messagesTest);
    const promises = messagesTest.map((m: any) =>
      messageDecoder(identity, {
        ...m,
        id: m._id,
        createdAt: m.created_at,
        body: Buffer.from(m.body, "base64"),
      })
    );

    const allSettled = await Promise.allSettled(promises);

    const filtered = allSettled.filter(
      (r) => r.status === "fulfilled"
    ) as PromiseFulfilledResult<DecryptedInbox>[];

    console.log("FRIENDS MESSAGES", filtered);

    setMessages(filtered.map((m) => m.value).sort((a, b) => a.sent - b.sent));
  }

  useEffect(() => {
    let listener: any = null;
    async function getInboxMessages() {
      // Grab all existing inbox messages and decrypt them locally
      const messages = await ccUsers.listInboxMessages();
      const inbox = [];
      for (const message of messages) {
        inbox.push(await messageDecoder(ccIdentity, message));
      }

      setMessages(inbox.sort((a, b) => a.sent - b.sent));

      // Watch for new messages
      listener = ccUsers.watchInbox(mailID, handleNewMessage);

      setStatus("idle");
    }
    if (mailID && isCommonChat) getInboxMessages();
    return () => {
      if (listener) listener.close();
    };
  }, [mailID, isCommonChat]);

  async function handleNewMessage(reply?: MailboxEvent, err?: Error) {
    if (err) return;
    if (!reply || !reply.message) return;
    const message = await messageDecoder(ccIdentity, reply.message);
    setMessages((prev) => [...prev, message]);
  }

  async function handleSendMessage() {
    if (msgStatus === "loading") return;
    setMsgStatus("loading");
    try {
      let finalPubKey: PublicKey = ccIdentity.public;
      const friendPubKey = friends.find((f) => f[0] === selectedFriend);

      if (isFriendChat && friendPubKey?.[1]) {
        finalPubKey = PublicKey.fromString(friendPubKey?.[1]);
      }

      await sendMessage(users, identity, finalPubKey, message);
      setMessage("");
    } catch (e: any) {
      e?.message && setContentError(e.message);
    }
    setMsgStatus("idle");
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
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            <IconButton
              m="5px"
              color="brand.800"
              aria-label="accept"
              isLoading={msgStatus === "loading"}
              onClick={handleSendMessage}
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
          <Text mb="20px">
            Fetching {isCommonChat ? "common" : shortenAddress(selectedFriend)}{" "}
            chat...
          </Text>
          <Spinner size="xl" />
        </Flex>
      )}
    </Flex>
  );
}
