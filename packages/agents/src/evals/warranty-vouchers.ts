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
    id: "warranty-small",
    input: "Garansi blender berapa lama?",
    expected: {
      answer: "Small appliances such as a blender have a 1-year warranty, starting on the delivery date.",
      pattern: /\b1\s*(tahun|years?)/i,
    },
  },
  {
    id: "warranty-large",
    input: "Kalau beli kulkas, garansinya berapa lama?",
    expected: {
      answer: "Large appliances (AC, kulkas, mesin cuci) and TVs have a 2-year warranty, starting on the delivery date.",
      pattern: /\b2\s*(tahun|years?)/i,
    },
  },
  {
    id: "warranty-claim",
    input: "Bagaimana cara klaim garansi dan berapa lama perbaikannya?",
    expected: {
      answer: "Contact customer service or use the app with the order number, the product serial number and a photo or video of the problem. Repair takes 7-14 working days. If it can't be repaired, it is replaced with the same or an equivalent product.",
      pattern: /7\s*[-–]\s*14|7\s*(sampai|hingga|to)\s*14/i,
    },
  },
  {
    id: "welcome-voucher",
    input: "Saya pelanggan baru. Voucher-nya potongan berapa dan minimal belanja berapa?",
    expected: {
      answer: "New customers get a Rp50.000 welcome voucher with a minimum purchase of Rp500.000, valid for 30 days after registering, one use only.",
      pattern: /50[.,]?000/,
    },
  },
  {
    id: "installment",
    input: "Cicilan 0% minimal belanja berapa dan tenornya apa saja?",
    expected: {
      answer: "0% installment needs a minimum purchase of Rp1.500.000 with a BCA, Mandiri or BNI credit card, for 3, 6 or 12 months.",
      pattern: /1[.,]?500[.,]?000|1[.,]5\s*juta/i,
    },
  },
] satisfies { id: string; input: string; expected: Expected }[];

// Set EVAL_JUDGE_MODEL_ID to judge with a different OpenRouter model than the agent.
const judge = getModel(process.env.EVAL_JUDGE_MODEL_ID);
const correctnessParams = ["input", "actualOutput", "expectedOutput"] as const;

await runEvalCli({
  name: "support-warranty-vouchers",
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
