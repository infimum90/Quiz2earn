import hre from "hardhat";
import { formatEther, getAddress, parseEther } from "viem";
import { currentChain } from "./chains";
import { answerKeys, quizSlugs } from "./quizData";

async function main() {
  const chain = currentChain();
  const [deployer] = await hre.viem.getWalletClients({ chain });
  const publicClient = await hre.viem.getPublicClient({ chain });
  const reward = parseEther(process.env.REWARD_PER_QUIZ ?? "1");
  const passMark = Number(process.env.PASS_MARK ?? 4);
  const funding = parseEther(process.env.INITIAL_FUNDING ?? "0");

  console.log(`Network:  ${hre.network.name}`);
  console.log(`Deployer: ${deployer.account.address}`);

  const quiz = await hre.viem.deployContract("Quiz2Earn", [deployer.account.address], {
    client: { public: publicClient, wallet: deployer },
  });
  console.log(`Quiz2Earn deployed at ${quiz.address}`);
  if (chain.blockExplorers) console.log(`  ${chain.blockExplorers.default.url}/address/${quiz.address}`);

  for (let i = 0; i < answerKeys.length; i++) {
    const hash = await quiz.write.addQuiz([answerKeys[i], passMark, reward]);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`  quiz ${i} (${quizSlugs[i]}) added`);
  }

  if (funding > 0n) {
    const hash = await deployer.sendTransaction({ to: quiz.address, value: funding });
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`Funded with ${formatEther(funding)} BOT`);
  }

  // Hand admin rights to the long-term owner (e.g. your MetaMask) once setup is done.
  if (process.env.OWNER_ADDRESS) {
    const owner = getAddress(process.env.OWNER_ADDRESS);
    const hash = await quiz.write.transferOwnership([owner]);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`Ownership transferred to ${owner}`);
  }

  console.log(`\nSet this in web/.env.local:\nNEXT_PUBLIC_CONTRACT_ADDRESS=${quiz.address}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
