import quizzes from "../../web/src/content/quizzes.json";
import { toHex } from "viem";

/** Answer keys, in quiz-id order, packed one byte per question (0-3 = A-D). */
export const answerKeys = quizzes.map((q) => toHex(Uint8Array.from(q.questions.map((x) => x.answer))));
export const quizSlugs = quizzes.map((q) => q.slug);
