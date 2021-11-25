export const shortenAddress = (address: string, num = 3) => {
  if (!address) return "";
  return (
    !!address &&
    `${address.substring(0, num + 2)}...${address.substring(
      address.length - num - 1
    )}`
  );
};
