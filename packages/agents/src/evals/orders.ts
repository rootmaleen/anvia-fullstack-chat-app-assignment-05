import type { AgentResponse } from "@anvia/core";
import { agentEvalTarget, answerRelevancy, contains, gEval, runEvalCli, type ValueSelector } from "@anvia/core/evals";
import { createAgent } from "../agent";
import { lens } from "../lens";
import { getModel } from "../model";

type Expected = {
  /** Reference answer, based on the context documents. Used by the correctness judge. */
  answer: string;
  /** Number the answer must contain. */
  pattern: RegExp;
};
type Output = AgentResponse<string>;

const cases = [
  {
    id: "order-delivered",
    input: "Tolong cek pesanan MJE-1001, email saya sari@example.com. Statusnya apa dan total bayarnya berapa?",
    expected: {
      answer: "Order MJE-1001 (Rice Cooker Digital 1.8L) has been delivered (Telah Diterima), 3 days ago. The total paid was Rp549.000 with GoPay.",
      pattern: /549[.,]?000/,
    },
  },
  {
    id: "order-tracking",
    input: "Paket pesanan MJE-1002 (email andi@example.com) sekarang di mana? Kapan sampai?",
    expected: {
      answer: "Order MJE-1002 (Smart TV LED 43 inch) is being shipped by J&T Cargo with tracking number JNT200200200. It is on the way to Bandung, with delivery expected in about 1-2 days.",
      pattern: /200200200/,
    },
  },
  {
    id: "return-expired",
    input: "Saya mau retur blender dari pesanan MJE-1003, email dewi@example.com, karena berubah pikiran.",
    expected: {
      answer: "The return is not possible: the order was delivered 10 days ago and the return period is 7 days. Defects are still covered by the 1-year warranty.",
      pattern: /\b7\s*(hari|days?)/i,
    },
  },
  {
    id: "order-awaiting-payment",
    input: "Pesanan MJE-1004 (rudi@example.com) belum saya bayar. Berapa yang harus dibayar dan sampai kapan?",
    expected: {
      answer: "Order MJE-1004 (Air Fryer 4L) is awaiting payment of Rp899.000 by BCA virtual account. The payment deadline is in about 5 hours; after that the order is cancelled automatically.",
      pattern: /899[.,]?000/,
    },
  },
  {
    id: "order-cancel",
    input: "Saya mau batalkan pesanan MJE-1005, email maya@example.com. Masih bisa? Berapa total pesanannya?",
    expected: {
      answer: "Yes. Order MJE-1005 (Setrika Uap 2000W, Rp329.000, COD) is still being packed (Sedang Dikemas), so it can be cancelled for free in the app under Pesanan Saya -> Batalkan. The assistant cannot cancel it itself.",
      pattern: /329[.,]?000/,
    },
  },
] satisfies { id: string; input: string; expected: Expected }[];

// Set EVAL_JUDGE_MODEL_ID to judge with a different OpenRouter model than the agent.
const judge = getModel(process.env.EVAL_JUDGE_MODEL_ID);
const correctnessParams = ["input", "actualOutput", "expectedOutput"] as const;

await runEvalCli({
  name: "support-orders",
  cases,
  concurrency: 5,
  exitCode: true,
  // Publishes scores to Lens, linked to each case's agent trace, with the case input/output attached.
  reporters: [lens.evalReporter({ includePayloads: true })],
  target: agentEvalTarget<string, string, Output, Expected>({
    agent: createAgent(),
    request: ({ input }) => ({ prompt: input }),
  }),
  metrics: [
    gEval<
      string,
      Output,
      Expected,
      "correctness",
      typeof correctnessParams,
      ValueSelector<string, Output, Expected, string>
    >({
      name: "correctness",
      model: judge,
      threshold: 0.7,
      evaluationParams: correctnessParams,
      expected: ({ case: testCase }) => testCase.expected?.answer ?? "",
      evaluationSteps: [
        "List the key facts, numbers and conditions in the expected output for the customer's question.",
        "Check each one is present and correct in the actual output. Different wording or number formatting (Rp1.000.000, 1,000,000, 1 juta) is fine.",
        "Penalise numbers or rules in the actual output that contradict the expected output.",
        "Do not penalise extra helpful details that do not contradict the expected output.",
      ],
      rubric: [
        { scoreRange: [0, 2], expectedOutcome: "Wrong, contradicts the expected output, or invents numbers." },
        { scoreRange: [3, 5], expectedOutcome: "Right topic, but a key number or condition is wrong or missing." },
        { scoreRange: [6, 8], expectedOutcome: "Main answer and numbers are correct, but a minor detail is missing." },
        { scoreRange: [9, 10], expectedOutcome: "Fully correct, including all numbers and conditions." },
      ],
    }),
    answerRelevancy<string, Output, Expected>({
      name: "answerRelevancy",
      model: judge,
      threshold: 0.7,
    }),
    contains<string, Output, Expected>({
      name: "containsNumber",
      expected: ({ case: testCase }) => testCase.expected?.pattern ?? /$^/,
    }),
  ],
});

// Flush traces and eval scores to Lens before the process exits.
await lens.close();
