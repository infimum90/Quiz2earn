// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Quiz2Earn
/// @notice Learn Web3 in short lessons, pass the quiz on-chain, earn native BOT.
/// @dev The contract scores answers itself, so the frontend never decides who passed.
///      Answer keys are public on-chain: this is an education product, and the limit of
///      one reward per wallet per quiz is what bounds abuse.
contract Quiz2Earn is Ownable, ReentrancyGuard {
    struct Quiz {
        bytes answers; // one byte per question, value 0-3 (A-D)
        uint128 reward; // in wei of native BOT
        uint8 passMark; // minimum correct answers to pass
        bool active;
    }

    struct Player {
        uint128 totalEarned;
        uint32 quizzesPassed;
        uint32 attempts;
        uint64 firstSeen;
    }

    Quiz[] private _quizzes;
    mapping(address => Player) public players;
    mapping(address => mapping(uint256 => bool)) public hasPassed;
    address[] private _playerList;
    uint256 public totalPaid;

    event QuizAdded(uint256 indexed quizId, uint8 questions, uint8 passMark, uint128 reward);
    event QuizUpdated(uint256 indexed quizId, uint8 passMark, uint128 reward, bool active);
    event Attempted(address indexed player, uint256 indexed quizId, uint8 score, bool passed, uint128 reward);
    event Funded(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    error QuizNotFound();
    error QuizInactive();
    error WrongAnswerCount();
    error InvalidAnswer();
    error AlreadyPassed();
    error RewardPoolEmpty();
    error InvalidQuiz();
    error TransferFailed();

    constructor(address initialOwner) Ownable(initialOwner) {}

    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }

    // ---------------------------------------------------------------- player

    /// @notice Submit answers for a quiz. Pays the reward if this is the wallet's first pass.
    /// @return score Number of correct answers.
    function submit(uint256 quizId, bytes calldata answers) external nonReentrant returns (uint8 score) {
        if (quizId >= _quizzes.length) revert QuizNotFound();
        Quiz storage quiz = _quizzes[quizId];
        if (!quiz.active) revert QuizInactive();
        if (answers.length != quiz.answers.length) revert WrongAnswerCount();
        if (hasPassed[msg.sender][quizId]) revert AlreadyPassed();

        for (uint256 i; i < answers.length; ++i) {
            if (uint8(answers[i]) > 3) revert InvalidAnswer();
            if (answers[i] == quiz.answers[i]) ++score;
        }

        Player storage p = players[msg.sender];
        if (p.firstSeen == 0) {
            p.firstSeen = uint64(block.timestamp);
            _playerList.push(msg.sender);
        }
        ++p.attempts;

        bool passed = score >= quiz.passMark;
        uint128 reward;
        if (passed) {
            reward = quiz.reward;
            if (address(this).balance < reward) revert RewardPoolEmpty();
            hasPassed[msg.sender][quizId] = true;
            ++p.quizzesPassed;
            p.totalEarned += reward;
            totalPaid += reward;
        }

        emit Attempted(msg.sender, quizId, score, passed, reward);

        if (reward > 0) {
            (bool ok,) = msg.sender.call{value: reward}("");
            if (!ok) revert TransferFailed();
        }
    }

    // ---------------------------------------------------------------- views

    function quizCount() external view returns (uint256) {
        return _quizzes.length;
    }

    function getQuiz(uint256 quizId) external view returns (Quiz memory) {
        if (quizId >= _quizzes.length) revert QuizNotFound();
        return _quizzes[quizId];
    }

    function getQuizzes() external view returns (Quiz[] memory) {
        return _quizzes;
    }

    /// @notice Which quizzes a wallet has passed, indexed by quiz id.
    function passedBy(address player) external view returns (bool[] memory result) {
        result = new bool[](_quizzes.length);
        for (uint256 i; i < result.length; ++i) {
            result[i] = hasPassed[player][i];
        }
    }

    function playerCount() external view returns (uint256) {
        return _playerList.length;
    }

    /// @notice Paginated player list with stats, for the leaderboard.
    function getPlayers(uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory addrs, Player[] memory stats)
    {
        uint256 n = _playerList.length;
        if (offset >= n) return (addrs, stats);
        uint256 end = offset + limit > n ? n : offset + limit;
        addrs = new address[](end - offset);
        stats = new Player[](end - offset);
        for (uint256 i = offset; i < end; ++i) {
            addrs[i - offset] = _playerList[i];
            stats[i - offset] = players[_playerList[i]];
        }
    }

    // ---------------------------------------------------------------- admin

    function addQuiz(bytes calldata answers, uint8 passMark, uint128 reward) external onlyOwner returns (uint256 id) {
        _validate(answers, passMark);
        id = _quizzes.length;
        _quizzes.push(Quiz({answers: answers, reward: reward, passMark: passMark, active: true}));
        emit QuizAdded(id, uint8(answers.length), passMark, reward);
    }

    function updateQuiz(uint256 quizId, bytes calldata answers, uint8 passMark, uint128 reward, bool active)
        external
        onlyOwner
    {
        if (quizId >= _quizzes.length) revert QuizNotFound();
        _validate(answers, passMark);
        _quizzes[quizId] = Quiz({answers: answers, reward: reward, passMark: passMark, active: active});
        emit QuizUpdated(quizId, passMark, reward, active);
    }

    function withdraw(address payable to, uint256 amount) external onlyOwner {
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit Withdrawn(to, amount);
    }

    function _validate(bytes calldata answers, uint8 passMark) private pure {
        if (answers.length == 0 || answers.length > 32) revert InvalidQuiz();
        if (passMark == 0 || passMark > answers.length) revert InvalidQuiz();
        for (uint256 i; i < answers.length; ++i) {
            if (uint8(answers[i]) > 3) revert InvalidQuiz();
        }
    }
}
