import {
    PrivateKey,
    KeyInfo,
    Users,
    Identity,
    PublicKey,
    UserMessage,
} from "@textile/hub";

export interface DecryptedInbox {
    id: string;
    body: string;
    from: string;
    sent: number;
    readAt?: number;
}

export const keyInfo: KeyInfo = {
    key: process.env.REACT_APP_TEXTILE ? process.env.REACT_APP_TEXTILE : "",
};

// Secret key of the common chat, not the best but just for demonstration purposes
const SECRET_KEY = process.env.REACT_APP_TEXTILE_COMMON_CHAT_SECRET
    ? process.env.REACT_APP_TEXTILE_COMMON_CHAT_SECRET
    : "";

export const getCommonChatIdentity = (): PrivateKey => {
    const cached = localStorage.getItem("chat-private-identity");
    if (cached !== null) {
        /** Convert the cached identity string to a PrivateKey and return */
        return PrivateKey.fromString(cached);
    }
    /** No cached identity existed, so create a new one */
    const identity = PrivateKey.fromString(SECRET_KEY);
    /** Add the string copy to the cache */
    localStorage.setItem("chat-private-identity", identity.toString());
    /** Return the random identity */
    return identity;
};

export const getIdentity = (): PrivateKey => {
    /** Restore any cached user identity first */

    const cached = localStorage.getItem("user-private-identity");
    if (cached !== null) {
        /** Convert the cached identity string to a PrivateKey and return */
        return PrivateKey.fromString(cached);
    }
    /** No cached identity existed, so create a new one */
    const identity = PrivateKey.fromRandom();
    /** Add the string copy to the cache */
    localStorage.setItem("user-private-identity", identity.toString());
    /** Return the random identity */
    return identity;
};

export function sendMessage(
    users: Users,
    from: Identity,
    to: PublicKey,
    message: string,
) {
    const encoder = new TextEncoder();
    const body = encoder.encode(message);
    return users.sendMessage(from, to, body);
}

export const messageDecoder = async (
    identity: PrivateKey,
    message: UserMessage,
): Promise<DecryptedInbox> => {
    const bytes = await identity.decrypt(message.body);
    const body = new TextDecoder().decode(bytes);
    const { from } = message;
    const { readAt } = message;
    const { createdAt } = message;
    const { id } = message;
    return { body, from, readAt, sent: createdAt, id };
};
