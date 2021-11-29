import { Client, PrivateKey, Users } from "@textile/hub";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { getIdentity, keyInfo } from "utils/textile";

const useIdentity = () => {
    const { active } = useWeb3React();
    const [id, setId] = useState<{
        identity: PrivateKey;
        mailID: string;
        users: Users;
        client: Client;
    }>({ users: null!, client: null!, mailID: "", identity: null! });

    const fetchIdentity = async () => {
        const identity = getIdentity();
        const client = await Client.withKeyInfo(keyInfo);
        const users = await Users.withKeyInfo(keyInfo);
        await users.getToken(identity);
        await client.getToken(identity);
        const mailID = await users.setupMailbox();

        setId({ mailID, client, users, identity });
    };

    useEffect(() => {
        if (active) fetchIdentity();
    }, [active]);

    return id;
};

export default useIdentity;
