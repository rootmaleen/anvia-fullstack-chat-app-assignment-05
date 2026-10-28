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
    id: "leave-annual-entitlement",
    input: "Berapa hari cuti tahunan yang saya dapat setelah 1 tahun bekerja?",
    expected: {
      answer: "At least 12 working days of paid annual leave after 12 months of continuous work (UU 13/2003 Pasal 79).",
      pattern: /\b12\b/,
    },
  },
  {
    id: "leave-carry-over",
    input: "Can I carry over my unused annual leave to next year?",
    expected: {
      answer:
        "Yes. Under the PT Maju Jaya Sakti policy, up to 5 unused annual leave days can be carried over to the next year, and they must be used by 31 March.",
      pattern: /\b5\b/,
    },
  },
  {
    id: "leave-own-marriage",
    input: "Saya mau menikah bulan depan, dapat cuti berapa hari?",
    expected: {
      answer: "3 days of paid leave for the employee's own marriage (UU 13/2003 Pasal 93 ayat 4).",
      pattern: /\b3\s*(hari|days?)/i,
    },
  },
  {
    id: "leave-maternity",
    input: "Berapa lama cuti melahirkan dan apakah tetap digaji penuh?",
    expected: {
      answer:
        "Under UU 4/2024 (KIA), at least 3 months, extendable by up to 3 more months for medical reasons with a doctor's letter. Full wage for the first 4 months, and 75% of wage for the 5th and 6th month.",
      pattern: /75\s*%/,
    },
  },
  {
    id: "leave-long-service",
    input: "I have worked here for 6 years. Do I get any long-service leave?",
    expected: {
      answer:
        "Yes. PT Maju Jaya Sakti gives 1 extra month of leave after every 6 years of service. The law makes long-service leave optional, so this comes from the company regulation.",
      pattern: /\b(1|one|satu)\s*(extra\s*)?(bulan|months?)/i,
    },
  },
] satisfies { id: string; input: string; expected: Expected }[];

// Set EVAL_JUDGE_MODEL_ID to judge with a different OpenRouter model than the agent.
const judge = getModel(process.env.EVAL_JUDGE_MODEL_ID);
const correctnessParams = ["input", "actualOutput", "expectedOutput"] as const;

await runEvalCli({
  name: "hr-leave",
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
        "List the key facts, numbers and conditions in the expected output for the user's HR question.",
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
