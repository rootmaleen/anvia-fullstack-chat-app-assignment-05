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
    id: "bpjs-kesehatan-employee-share",
    input: "Gaji saya Rp10.000.000. Berapa potongan BPJS Kesehatan dari gaji saya per bulan?",
    expected: {
      answer:
        "BPJS Kesehatan is 5% of wage: the employee pays 1% = Rp100.000 a month, and the employer pays 4% = Rp400.000.",
      pattern: /100[.,]?000/,
    },
  },
  {
    id: "bpjs-kesehatan-wage-cap",
    input: "My salary is Rp15.000.000. How much is deducted for BPJS Kesehatan?",
    expected: {
      answer:
        "BPJS Kesehatan uses a wage cap of Rp12.000.000, so the employee pays 1% x 12.000.000 = Rp120.000 a month (the employer pays 4% = Rp480.000).",
      pattern: /120[.,]?000/,
    },
  },
  {
    id: "bpjs-jht",
    input: "Gaji saya Rp8.000.000. Berapa iuran JHT yang dipotong dari saya dan yang dibayar perusahaan?",
    expected: {
      answer:
        "JHT is 5.7% of wage: the employee pays 2% = Rp160.000 and the employer pays 3.7% = Rp296.000 a month.",
      pattern: /160[.,]?000/,
    },
  },
  {
    id: "pph21-ptkp-married",
    input: "Saya menikah dan punya 2 anak (K/2). Berapa PTKP saya per tahun?",
    expected: {
      answer: "PTKP K/2 = 54.000.000 + 4.500.000 (married) + 2 x 4.500.000 (dependants) = Rp67.500.000 a year.",
      pattern: /67[.,]?500[.,]?000|67[.,]5\s*juta/i,
    },
  },
  {
    id: "pph21-progressive",
    input: "If my annual taxable income (PKP) is Rp100.000.000, how much PPh 21 do I owe for the year?",
    expected: {
      answer:
        "Progressive rates: first Rp60.000.000 at 5% = Rp3.000.000, next Rp40.000.000 at 15% = Rp6.000.000. Total Rp9.000.000 for the year.",
      pattern: /9[.,]?000[.,]?000|9\s*juta/i,
    },
  },
] satisfies { id: string; input: string; expected: Expected }[];

// Set EVAL_JUDGE_MODEL_ID to judge with a different OpenRouter model than the agent.
const judge = getModel(process.env.EVAL_JUDGE_MODEL_ID);
const correctnessParams = ["input", "actualOutput", "expectedOutput"] as const;

await runEvalCli({
  name: "hr-bpjs-tax",
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
