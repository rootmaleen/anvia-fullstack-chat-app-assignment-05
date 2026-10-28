import type { Document } from "@anvia/core";

// Mock data for PT Maju Jaya Sakti. Replace with the real company handbook.

export const companyProfileDocument: Document = {
  id: "company-profile",
  text: `PT Maju Jaya Sakti is a distribution and manufacturing company for consumer goods.
- Head office: Jakarta Selatan. Factory: Cikarang, Kabupaten Bekasi.
- About 450 employees: office staff in Jakarta, production staff in Cikarang.
- HR team: hr@majujayasakti.co.id, extension 1200, Monday to Friday 08:00-17:00 WIB.
- Company regulation: Peraturan Perusahaan (PP) PT Maju Jaya Sakti 2025-2027, approved by the Dinas Tenaga Kerja.`,
  additionalProps: {
    title: "PT Maju Jaya Sakti company profile",
    source: "mock",
  },
};

export const companyPoliciesDocument: Document = {
  id: "company-policies",
  text: `Main HR policies of PT Maju Jaya Sakti (from the Peraturan Perusahaan).

Working hours
- Office (Jakarta): 5-day week, Monday to Friday 08:00-17:00 WIB, 1-hour break at 12:00.
- Production (Cikarang): 3 shifts of 8 hours, 5 working days a week, 40 hours a week.
- Hybrid: office staff may work from home up to 2 days a week with their manager's approval.

Leave (cuti)
- Annual leave: 12 working days after 12 months of service. Up to 5 unused days can be carried over to the next year and must be used by 31 March.
- Long-service leave: 1 extra month of leave after every 6 years of service.
- Leave requests go through the HRIS app at least 7 days in advance (except emergencies) and need the manager's approval.
- Sick leave over 2 days needs a doctor's letter (surat keterangan dokter).

Overtime (lembur)
- Overtime must be ordered in writing by the manager (Surat Perintah Lembur) and agreed by the employee.
- Overtime pay follows PP 35/2021. Staff at grade Manager and above receive no overtime pay; their salary already accounts for it.

Pay and benefits
- Salary is paid on the 25th of each month. If the 25th is a holiday, it is paid on the last working day before.
- Fixed allowances: transport allowance and position allowance. Meal allowance is paid per day of attendance (not a fixed allowance).
- THR is paid at the latest 14 days before Idul Fitri for all employees, or before Christmas for employees who choose it.
- All employees are registered for BPJS Kesehatan and BPJS Ketenagakerjaan (JKK, JKM, JHT, JP) from their first day.
- Extra private health insurance for permanent employees (PKWTT) and their family.

Contracts
- New permanent employees (PKWTT) have a 3-month probation period.
- Contract employees (PKWT) have no probation and receive compensation (uang kompensasi) when their contract ends.

Resignation
- Submit a written resignation at least 30 days before the last working day.
- Employees who resign properly receive unused annual leave pay and uang pisah of 1 month's base salary after 3 or more years of service.`,
  additionalProps: {
    title: "PT Maju Jaya Sakti HR policies",
    source: "mock",
  },
};
