import type { Document } from "@anvia/core";
import { companyPoliciesDocument, companyProfileDocument } from "./company";
import { indonesiaRulesDocuments } from "./indonesia-rules";

export const staticContext: Document[] = [
  companyProfileDocument,
  companyPoliciesDocument,
  ...indonesiaRulesDocuments,
];
