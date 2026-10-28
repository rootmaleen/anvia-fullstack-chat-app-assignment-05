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
    id: "return-window",
    input: "Berapa lama batas waktu retur barang? Kalau saya cuma berubah pikiran, boleh?",
    expected: {
      answer: "Returns are accepted within 7 calendar days after the order is delivered. A change of mind is only accepted if the product is unopened (seal intact), unused and complete in its original box, and the customer pays the return shipping.",
      pattern: /\b7\s*(hari|days?)/i,
    },
  },
  {
    id: "damaged-on-arrival",
    input: "Barang saya datang dalam kondisi rusak. Apa yang harus saya lakukan dan berapa lama batas melapornya?",
    expected: {
      answer: "Report it in the app within 2 x 24 hours (48 hours) after receiving it, with a continuous unboxing video and photos. Return shipping is free, and the customer gets a replacement or a full refund including the shipping fee.",
      pattern: /2\s*[x×]\s*24|48\s*(jam|hours?)/i,
    },
  },
  {
    id: "refund-ewallet",
    input: "Kalau retur saya disetujui, refund ke GoPay berapa lama?",
    expected: {
      answer: "E-wallet refunds take 1-3 working days after the return is approved (after the warehouse inspection, which takes up to 2 working days).",
      pattern: /1\s*[-–]\s*3|1\s*(sampai|hingga|to)\s*3/i,
    },
  },
  {
    id: "refund-cod",
    input: "Saya bayar COD lalu retur barangnya. Refund-nya dikirim lewat apa dan berapa lama?",
    expected: {
      answer: "For COD orders the refund is sent by bank transfer to the customer's bank account, 3-5 working days after the return is approved.",
      pattern: /3\s*[-–]\s*5|3\s*(sampai|hingga|to)\s*5/i,
    },
  },
  {
    id: "refund-credit-card",
    input: "I paid by credit card. How long does a refund take?",
    expected: {
      answer: "Credit card refunds take 7-14 working days after the return is approved, depending on the bank.",
      pattern: /7\s*[-–]\s*14|7\s*(sampai|hingga|to)\s*14/i,
    },
  },
] satisfies { id: string; input: string; expected: Expected }[];

// Set EVAL_JUDGE_MODEL_ID to judge with a different model than the agent.
const judge = getModel(process.env.EVAL_JUDGE_MODEL_ID);
const correctnessParams = ["input", "actualOutput", "expectedOutput"] as const;

await runEvalCli({
  name: "support-returns-refunds",
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
