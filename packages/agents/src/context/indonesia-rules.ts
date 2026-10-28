import type { Document } from "@anvia/core";

// Simplified summaries of common Indonesian employment rules, for demo use.
// Not legal advice. Check the latest regulations before relying on them.

const SOURCE = "mock-summary";

export const workingHoursDocument: Document = {
  id: "id-working-hours",
  text: `Working hours and rest (UU 13/2003 Pasal 77-79, as amended by UU 6/2023 Cipta Kerja; PP 35/2021).
- 40 hours a week: either 7 hours a day for 6 days, or 8 hours a day for 5 days.
- Break: at least 30 minutes after 4 hours of continuous work. The break is not counted as working time.
- Weekly rest: 1 day for a 6-day week, 2 days for a 5-day week.
- Public holidays (hari libur nasional) are set every year by a joint decree of 3 ministers (SKB 3 Menteri). Work on a public holiday counts as overtime.`,
  additionalProps: { title: "Working hours and rest", source: SOURCE },
};

export const overtimeDocument: Document = {
  id: "id-overtime",
  text: `Overtime (lembur) (PP 35/2021 Pasal 26-32).
- Needs a written order from the employer and the employee's agreement.
- Maximum 4 hours a day and 18 hours a week. Work on rest days and public holidays is not counted in this limit.
- Hourly wage = 1/173 x monthly wage.
- Monthly wage for overtime = base salary + fixed allowances. If the wage also has variable allowances and base + fixed allowances is less than 75% of the total, use 75% of the total wage.

Rates on a normal working day:
- 1st hour: 1.5 x hourly wage.
- Each following hour: 2 x hourly wage.

Rates on a rest day or public holiday, 5-day work week:
- Hours 1-8: 2 x hourly wage.
- Hour 9: 3 x hourly wage.
- Hours 10-12: 4 x hourly wage.

Rates on a rest day or public holiday, 6-day work week:
- Hours 1-7: 2 x hourly wage.
- Hour 8: 3 x hourly wage.
- Hours 9-11: 4 x hourly wage.
- If the public holiday is the shortest working day of the week: hours 1-5 at 2x, hour 6 at 3x, hours 7-9 at 4x.

Example: monthly wage Rp8.650.000, 3 hours overtime on a working day.
Hourly wage = 8.650.000 / 173 = Rp50.000.
Pay = (1 x 1.5 x 50.000) + (2 x 2 x 50.000) = 75.000 + 200.000 = Rp275.000.`,
  additionalProps: { title: "Overtime (lembur)", source: SOURCE },
};

export const leaveDocument: Document = {
  id: "id-leave",
  text: `Leave (cuti) (UU 13/2003 Pasal 79-84 and 93, as amended by UU 6/2023; UU 4/2024 on Mother and Child Welfare / KIA).

Annual leave (cuti tahunan)
- At least 12 working days after 12 months of continuous work, with full pay.
- Long-service leave (istirahat panjang) is optional and depends on the company regulation or collective agreement.

Sick leave (sakit)
- Paid when supported by a doctor's letter.
- For long illness: 100% of wage for the first 4 months, 75% for the next 4 months, 50% for the next 4 months, then 25% until the employment ends.

Menstrual leave (cuti haid)
- Female employees who feel pain may take day 1 and day 2 of menstruation off, after notifying the employer.

Maternity leave (cuti melahirkan)
- UU 13/2003: 1.5 months before and 1.5 months after giving birth.
- UU 4/2024 (KIA): at least 3 months, which can be extended by up to 3 more months for medical reasons with a doctor's letter.
- Pay under UU KIA: full wage for the first 4 months, 75% for the 5th and 6th month.
- Miscarriage: 1.5 months of rest, or as stated in a doctor's letter.

Paternity leave
- 2 days of paid leave when the wife gives birth or has a miscarriage. UU KIA allows up to 3 extra days by agreement.

Paid leave for important events (Pasal 93 ayat 4)
- Employee's own marriage: 3 days.
- Marriage of the employee's child: 2 days.
- Circumcision (khitan) or baptism of the employee's child: 2 days.
- Wife gives birth or has a miscarriage: 2 days.
- Death of spouse, parent, parent-in-law, child or child-in-law: 2 days.
- Death of another household member: 1 day.`,
  additionalProps: { title: "Leave (cuti)", source: SOURCE },
};

export const thrDocument: Document = {
  id: "id-thr",
  text: `Religious holiday allowance (Tunjangan Hari Raya / THR) (Permenaker 6/2016; PP 36/2021).
- Every employee with at least 1 month of continuous service is entitled, both PKWT and PKWTT.
- 12 months of service or more: 1 month of wage.
- 1 to 12 months of service: (months of service / 12) x 1 month of wage.
- Wage for THR = base salary + fixed allowances (or the net wage if there are no allowances).
- Paid once a year, at the latest 7 days before the employee's religious holiday. It must not be paid in instalments.
- Late payment: a 5% fine of the THR amount, and the THR must still be paid.
- PKWTT employees who are terminated up to 30 days before the holiday are still entitled.

Example: base salary Rp6.000.000 + fixed allowance Rp1.000.000, 8 months of service.
THR = 8/12 x 7.000.000 = Rp4.666.667.`,
  additionalProps: { title: "THR", source: SOURCE },
};

export const bpjsDocument: Document = {
  id: "id-bpjs",
  text: `Social security (BPJS) contributions (UU 24/2011; Perpres 82/2018 and amendments; PP 44/2015, PP 45/2015, PP 46/2015, PP 37/2021).
Employers must register all employees for BPJS Kesehatan and BPJS Ketenagakerjaan.

BPJS Kesehatan (health)
- 5% of monthly wage: 4% paid by the employer, 1% by the employee.
- Wage cap: Rp12.000.000. Covers the employee, spouse and up to 3 children.

BPJS Ketenagakerjaan (employment)
- JKK (work accident): 0.24% to 1.74% of wage depending on the work risk level, paid by the employer.
- JKM (death): 0.3% of wage, paid by the employer.
- JHT (old age savings): 5.7% of wage: 3.7% employer, 2% employee.
- JP (pension): 3% of wage: 2% employer, 1% employee. The wage cap for JP is updated every year.
- JKP (job loss): no extra contribution. It is funded from the government and the JKK/JKM contributions. Gives cash benefits for up to 6 months after termination.`,
  additionalProps: { title: "BPJS contributions", source: SOURCE },
};

export const pph21Document: Document = {
  id: "id-pph21",
  text: `Income tax on salary (PPh 21) (UU 7/2021 HPP; PP 58/2023; PMK 168/2023).
- The employer withholds PPh 21 every month and pays it to the tax office.
- January to November: tax = gross monthly income x average effective rate (Tarif Efektif Rata-rata / TER). The TER table (A, B or C) depends on the employee's PTKP status.
- December (or the last month of work): tax is recalculated for the whole year with the progressive rates in Pasal 17, minus the tax already withheld.

Non-taxable income (PTKP) per year:
- Single (TK/0): Rp54.000.000.
- Extra for a married employee: Rp4.500.000.
- Extra per dependant, up to 3: Rp4.500.000 each.

Progressive rates on annual taxable income:
- Up to Rp60.000.000: 5%.
- Above Rp60.000.000 to Rp250.000.000: 15%.
- Above Rp250.000.000 to Rp500.000.000: 25%.
- Above Rp500.000.000 to Rp5.000.000.000: 30%.
- Above Rp5.000.000.000: 35%.`,
  additionalProps: { title: "PPh 21", source: SOURCE },
};

export const contractsDocument: Document = {
  id: "id-contracts",
  text: `Employment contracts (UU 13/2003 as amended by UU 6/2023; PP 35/2021).

PKWT (fixed-term contract, karyawan kontrak)
- Only for work that is temporary, seasonal, a new product, or expected to finish in a set time.
- Maximum 5 years in total, including extensions.
- No probation period is allowed. If a PKWT has one, the probation is void.
- At the end of the contract the employer pays compensation (uang kompensasi): 1 month of wage per 12 months of service, prorated for shorter service (months / 12 x 1 month of wage). Only for contracts of at least 1 month.

PKWTT (permanent contract, karyawan tetap)
- Probation (masa percobaan) of at most 3 months. Pay during probation must be at least the minimum wage.

Minimum wage (upah minimum)
- Set every year by the provincial governor (UMP) and may be higher per city or regency (UMK).
- Employers must not pay below the minimum wage. It applies to employees with less than 1 year of service; above that, pay follows the company's wage structure (struktur dan skala upah).`,
  additionalProps: { title: "Employment contracts", source: SOURCE },
};

export const terminationDocument: Document = {
  id: "id-termination",
  text: `Resignation and termination (PHK) (UU 13/2003 as amended by UU 6/2023; PP 35/2021 Pasal 36-59).

Resignation (mengundurkan diri)
- Submit a written request at least 30 days before the last working day, and keep working until that date.
- Entitlements: uang penggantian hak (UPH), plus uang pisah if stated in the company regulation. No uang pesangon or UPMK.

Severance pay (uang pesangon, UP), by years of service:
- Less than 1 year: 1 month of wage.
- 1 to less than 2 years: 2 months. Each further year adds 1 month.
- 8 years or more: 9 months.

Long-service pay (uang penghargaan masa kerja, UPMK):
- 3 to less than 6 years: 2 months of wage.
- 6 to less than 9 years: 3 months.
- 9 to less than 12 years: 4 months.
- 12 to less than 15 years: 5 months.
- 15 to less than 18 years: 6 months.
- 18 to less than 21 years: 7 months.
- 21 to less than 24 years: 8 months.
- 24 years or more: 10 months.

Compensation for rights (uang penggantian hak, UPH):
- Unused annual leave that has not expired.
- Travel costs back to the place where the employee was hired.
- Other rights in the employment contract or company regulation.

The multiplier for UP depends on the reason, for example:
- Company efficiency to prevent losses: 1 x UP, plus UPMK and UPH.
- Company closes because of losses: 0.5 x UP, plus UPMK and UPH.
- Merger or acquisition where the employee does not want to continue: 1 x UP, plus UPMK and UPH.
- Employee reaches retirement age: 1.75 x UP, plus UPMK and UPH.
- Employee dies: 2 x UP to the heirs, plus UPMK and UPH.
- Serious violation after warning letters (SP1 to SP3): 0.5 x UP, plus UPMK and UPH.

Wage for these calculations = base salary + fixed allowances.
Termination needs a written notice at least 14 working days before (7 working days during probation). Disputes go first to bipartite negotiation, then to mediation at the Dinas Tenaga Kerja, then to the industrial relations court (PHI).`,
  additionalProps: { title: "Resignation and termination", source: SOURCE },
};

export const indonesiaRulesDocuments: Document[] = [
  workingHoursDocument,
  overtimeDocument,
  leaveDocument,
  thrDocument,
  bpjsDocument,
  pph21Document,
  contractsDocument,
  terminationDocument,
];
