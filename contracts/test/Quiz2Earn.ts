import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther, toHex } from "viem";

const KEY = toHex(Uint8Array.from([1, 2, 0, 2, 1])); // B C A C B
const bytes = (a: number[]) => toHex(Uint8Array.from(a));

describe("Quiz2Earn", () => {
  async function deploy() {
    const [owner, alice, bob] = await hre.viem.getWalletClients();
    const quiz = await hre.viem.deployContract("Quiz2Earn", [owner.account.address]);
    await quiz.write.addQuiz([KEY, 4, parseEther("1")]);
    await owner.sendTransaction({ to: quiz.address, value: parseEther("10") });
    const publicClient = await hre.viem.getPublicClient();
    const asAlice = await hre.viem.getContractAt("Quiz2Earn", quiz.address, { client: { wallet: alice } });
    const asBob = await hre.viem.getContractAt("Quiz2Earn", quiz.address, { client: { wallet: bob } });
    return { quiz, owner, alice, bob, asAlice, asBob, publicClient };
  }

  it("pays the reward on a pass and records stats", async () => {
    const { asAlice, alice, quiz, publicClient } = await loadFixture(deploy);
    const before = await publicClient.getBalance({ address: alice.account.address });
    const hash = await asAlice.write.submit([0n, KEY]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const gas = receipt.gasUsed * receipt.effectiveGasPrice;
    const after = await publicClient.getBalance({ address: alice.account.address });
    expect(after - before + gas).to.equal(parseEther("1"));

    const [earned, passed, attempts] = await quiz.read.players([alice.account.address]);
    expect(earned).to.equal(parseEther("1"));
    expect(passed).to.equal(1);
    expect(attempts).to.equal(1);
    expect(await quiz.read.passedBy([alice.account.address])).to.deep.equal([true]);
    expect(await quiz.read.totalPaid()).to.equal(parseEther("1"));
  });

  it("passes at exactly the pass mark", async () => {
    const { asAlice, quiz, alice } = await loadFixture(deploy);
    await asAlice.write.submit([0n, bytes([1, 2, 0, 2, 3])]); // 4/5
    expect(await quiz.read.hasPassed([alice.account.address, 0n])).to.equal(true);
  });

  it("records a failed attempt without paying", async () => {
    const { asAlice, quiz, alice } = await loadFixture(deploy);
    await asAlice.write.submit([0n, bytes([0, 0, 0, 0, 0])]); // 1/5
    const [earned, passed, attempts] = await quiz.read.players([alice.account.address]);
    expect([earned, passed, attempts]).to.deep.equal([0n, 0, 1]);
    expect(await quiz.read.playerCount()).to.equal(1n);
  });

  it("only pays once per wallet per quiz", async () => {
    const { asAlice } = await loadFixture(deploy);
    await asAlice.write.submit([0n, KEY]);
    await expect(asAlice.write.submit([0n, KEY])).to.be.rejectedWith("AlreadyPassed");
  });

  it("rejects wrong length, bad values, unknown and inactive quizzes", async () => {
    const { asAlice, quiz } = await loadFixture(deploy);
    await expect(asAlice.write.submit([0n, bytes([1, 2, 0])])).to.be.rejectedWith("WrongAnswerCount");
    await expect(asAlice.write.submit([0n, bytes([1, 2, 0, 2, 9])])).to.be.rejectedWith("InvalidAnswer");
    await expect(asAlice.write.submit([5n, KEY])).to.be.rejectedWith("QuizNotFound");
    await quiz.write.updateQuiz([0n, KEY, 4, parseEther("1"), false]);
    await expect(asAlice.write.submit([0n, KEY])).to.be.rejectedWith("QuizInactive");
  });

  it("reverts on a pass when the pool is empty, so the player can claim later", async () => {
    const { asAlice, quiz, owner, alice } = await loadFixture(deploy);
    await quiz.write.withdraw([owner.account.address, parseEther("10")]);
    await expect(asAlice.write.submit([0n, KEY])).to.be.rejectedWith("RewardPoolEmpty");
    expect(await quiz.read.hasPassed([alice.account.address, 0n])).to.equal(false);
  });

  it("lists players for the leaderboard", async () => {
    const { asAlice, asBob, quiz, alice, bob } = await loadFixture(deploy);
    await asAlice.write.submit([0n, KEY]);
    await asBob.write.submit([0n, bytes([0, 0, 0, 0, 0])]);
    const [addrs, stats] = await quiz.read.getPlayers([0n, 10n]);
    expect(addrs).to.deep.equal([getAddress(alice.account.address), getAddress(bob.account.address)]);
    expect(stats[0].totalEarned).to.equal(parseEther("1"));
    const [empty] = await quiz.read.getPlayers([5n, 10n]);
    expect(empty).to.deep.equal([]);
  });

  it("restricts admin functions to the owner and validates quizzes", async () => {
    const { asAlice, quiz, alice } = await loadFixture(deploy);
    await expect(asAlice.write.addQuiz([KEY, 4, 1n])).to.be.rejectedWith("OwnableUnauthorizedAccount");
    await expect(asAlice.write.withdraw([alice.account.address, 1n])).to.be.rejectedWith("OwnableUnauthorizedAccount");
    await expect(quiz.write.addQuiz([KEY, 6, 1n])).to.be.rejectedWith("InvalidQuiz");
    await expect(quiz.write.addQuiz([bytes([4]), 1, 1n])).to.be.rejectedWith("InvalidQuiz");
    await expect(quiz.write.addQuiz(["0x", 1, 1n])).to.be.rejectedWith("InvalidQuiz");
  });
});
