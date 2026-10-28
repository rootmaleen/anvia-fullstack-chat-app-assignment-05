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
    id: "overtime-workday",
    input:
      "Gaji pokok plus tunjangan tetap saya Rp8.650.000 per bulan. Kemarin saya lembur 3 jam di hari kerja. Berapa upah lembur saya?",
    expected: {
      answer:
        "Hourly wage = 8.650.000 / 173 = Rp50.000. 1st hour at 1.5x = Rp75.000, next 2 hours at 2x = Rp200.000. Total overtime pay Rp275.000.",
      pattern: /275[.,]?000/,
    },
  },
  {
    id: "overtime-weekly-limit",
    input: "Maksimal boleh lembur berapa jam per hari dan per minggu?",
    expected: {
      answer:
        "Maximum 4 hours a day and 18 hours a week (PP 35/2021). Work on rest days and public holidays is not counted in this limit.",
      pattern: /18\s*(jam|hours?)/i,
    },
  },
  {
    id: "overtime-rest-day",
    input:
      "I'm office staff on a 5-day week. My monthly wage (base + fixed allowances) is Rp6.920.000 and I worked 9 hours on Saturday. How much overtime pay do I get?",
    expected: {
      answer:
        "Hourly wage = 6.920.000 / 173 = Rp40.000. On a rest day in a 5-day week, hours 1-8 are paid 2x (8 x 2 x 40.000 = Rp640.000) and hour 9 is paid 3x (Rp120.000). Total Rp760.000.",
      pattern: /760[.,]?000/,
    },
  },
  {
    id: "thr-prorated",
    input:
      "Saya baru kerja 8 bulan. Gaji pokok Rp6.000.000 dan tunjangan tetap Rp1.000.000. Berapa THR yang saya dapat?",
    expected: {
      answer:
        "Service under 12 months, so THR is prorated: 8/12 x (6.000.000 + 1.000.000) = Rp4.666.667 (Permenaker 6/2016).",
      pattern: /4[.,]?666[.,]?66[67]/,
    },
  },
  {
    id: "thr-full-excludes-meal",
    input:
      "I've worked 3 years. Base salary Rp9.000.000, transport allowance Rp1.000.000 and meal allowance about Rp500.000 depending on attendance. How much THR do I get and when?",
    expected: {
      answer:
        "Service is 12 months or more, so THR is 1 month of wage = base + fixed allowances = 9.000.000 + 1.000.000 = Rp10.000.000. The meal allowance is paid per attendance, so it is not a fixed allowance and is excluded. PT Maju Jaya Sakti pays THR at the latest 14 days before the holiday.",
      pattern: /10[.,]?000[.,]?000|10\s*juta/i,
    },
  },
] satisfies { id: string; input: string; expected: Expected }[];

// Set EVAL_JUDGE_MODEL_ID to judge with a different OpenRouter model than the agent.
const judge = getModel(process.env.EVAL_JUDGE_MODEL_ID);
const correctnessParams = ["input", "actualOutput", "expectedOutput"] as const;

await runEvalCli({
  name: "hr-overtime-thr",
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
