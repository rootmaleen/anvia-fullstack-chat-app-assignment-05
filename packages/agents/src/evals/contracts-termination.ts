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
    id: "pkwt-max-duration",
    input: "Berapa lama maksimal karyawan bisa dikontrak (PKWT)?",
    expected: {
      answer: "A PKWT can last at most 5 years in total, including extensions (PP 35/2021).",
      pattern: /5\s*(tahun|years?)/i,
    },
  },
  {
    id: "pkwt-compensation",
    input:
      "My 6-month contract (PKWT) is ending. My monthly wage is Rp7.000.000. How much compensation should I get?",
    expected: {
      answer: "Uang kompensasi is prorated: 6/12 x 7.000.000 = Rp3.500.000 (PP 35/2021).",
      pattern: /3[.,]?500[.,]?000|3[.,]5\s*juta/i,
    },
  },
  {
    id: "pkwt-no-probation",
    input: "Apakah karyawan kontrak (PKWT) boleh diberi masa percobaan 3 bulan?",
    expected: {
      answer:
        "No. A PKWT must not have a probation period; if it does, the probation is void. Probation is only for permanent employees (PKWTT), for at most 3 months.",
      pattern: /3\s*(bulan|months?)/i,
    },
  },
  {
    id: "resignation-notice",
    input: "Kalau saya mau resign, harus kasih tahu berapa hari sebelumnya? Dan saya dapat apa saja? Saya sudah kerja 4 tahun.",
    expected: {
      answer:
        "Submit a written resignation at least 30 days before the last working day. Entitlements: uang penggantian hak (unused annual leave etc.) and, at PT Maju Jaya Sakti, uang pisah of 1 month's base salary because service is 3 years or more. No pesangon or UPMK for resignation.",
      pattern: /30\s*(hari|days?)/i,
    },
  },
  {
    id: "severance-efficiency",
    input:
      "I'm being laid off for company efficiency to prevent losses. I have worked 5 years and 2 months and my wage (base + fixed allowances) is Rp10.000.000. How much severance do I get?",
    expected: {
      answer:
        "Efficiency to prevent losses: 1 x uang pesangon + UPMK + UPH. 5 to <6 years gives pesangon of 6 months = Rp60.000.000. UPMK for 3 to <6 years is 2 months = Rp20.000.000. Total Rp80.000.000, plus uang penggantian hak.",
      pattern: /80[.,]?000[.,]?000|80\s*juta/i,
    },
  },
] satisfies { id: string; input: string; expected: Expected }[];

// Set EVAL_JUDGE_MODEL_ID to judge with a different OpenRouter model than the agent.
const judge = getModel(process.env.EVAL_JUDGE_MODEL_ID);
const correctnessParams = ["input", "actualOutput", "expectedOutput"] as const;

await runEvalCli({
  name: "hr-contracts-termination",
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
