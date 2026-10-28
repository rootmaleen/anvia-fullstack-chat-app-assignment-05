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
    id: "free-shipping-jabodetabek",
    input: "Saya belanja Rp350.000 dikirim ke Jakarta. Dapat gratis ongkir?",
    expected: {
      answer: "Yes. Orders to Jabodetabek get free shipping from Rp300.000, so Rp350.000 qualifies.",
      pattern: /300[.,]?000/,
    },
  },
  {
    id: "free-shipping-java",
    input: "Minimal belanja berapa supaya gratis ongkir ke Bandung?",
    expected: {
      answer: "Bandung is in Java outside Jabodetabek, so free shipping starts at Rp500.000.",
      pattern: /500[.,]?000/,
    },
  },
  {
    id: "same-day-cutoff",
    input: "Sampai jam berapa saya harus bayar supaya pesanan dikirim hari yang sama?",
    expected: {
      answer: "Orders paid before 15:00 WIB on a working day are handed to the courier the same day. With an instant courier, Jabodetabek orders paid before 15:00 WIB arrive the same day.",
      pattern: /15[.:]00|3\s*(sore|pm)/i,
    },
  },
  {
    id: "shipping-insurance",
    input: "Saya mau beli TV seharga Rp3.499.000. Ada biaya asuransi pengiriman? Berapa?",
    expected: {
      answer: "Yes. Insurance is required for orders of Rp1.000.000 or more, at 0.5% of the item value: 0.5% x 3.499.000 = Rp17.495.",
      pattern: /17[.,]?495/,
    },
  },
  {
    id: "cod-limit",
    input: "Berapa maksimal belanja kalau bayar COD, dan ada biayanya?",
    expected: {
      answer: "COD is available in Jabodetabek and the rest of Java for orders up to Rp2.000.000, with a COD fee of Rp5.000 per order.",
      pattern: /2[.,]?000[.,]?000|2\s*juta/i,
    },
  },
] satisfies { id: string; input: string; expected: Expected }[];

// Set EVAL_JUDGE_MODEL_ID to judge with a different model than the agent.
const judge = getModel(process.env.EVAL_JUDGE_MODEL_ID);
const correctnessParams = ["input", "actualOutput", "expectedOutput"] as const;

await runEvalCli({
  name: "support-shipping-payment",
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
