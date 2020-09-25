const returnWalletAddres = (walletAddress: string) =>
  `${walletAddress.slice(0, 4 + 2)}...${walletAddress.slice(-4)}`;

const capitalizeName = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1);

export default { returnWalletAddres, capitalizeName };
