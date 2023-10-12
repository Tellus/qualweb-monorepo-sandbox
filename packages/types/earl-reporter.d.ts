declare module "@qualweb/earl-reporter" {
  import { Evaluations } from "@qualweb/core";
  import { ACTRulesReport } from "@qualweb/act-rules";
  import { WCAGTechniquesReport } from "@qualweb/wcag-techniques";
  import { BestPracticesReport } from "@qualweb/best-practices";

  interface EarlOptions {
    aggregated?: boolean;
    aggregatedName?: string;
    modules?: {
      act?: boolean;
      wcag?: boolean;
      "best-practices"?: boolean;
    };
  }

  interface Assertor {
    "@id": string;
    "@type": string;
    title: string;
    description: string;
    hasVersion: string;
    homepage: string;
    isPartOf?: string;
    hasPart?: string;
  }

  interface Assertion {
    "@type": string;
    test: {
      "@id": string;
      "@type": "TestCase";
      title: string;
      description: string;
      isPartOf?: string[];
    };
    mode: string;
    result: TestResult;
  }

  interface ResultSource {
    result: {
      outcome: string;
      pointer?: string;
    };
  }

  interface TestResult {
    "@type": string;
    outcome: string;
    source: ResultSource[];
    description: string;
    date: string;
  }

  interface TestSubject {
    "@type": string;
    source: string;
    redirectedTo?: string;
    assertor: Assertor;
    assertions: Assertion[];
  }

  interface EarlReport {
    "@context": string;
    "@graph": TestSubject[];
  }

  interface EarlEvaluations {
    [url: string]: EarlReport;
  }

  type Report = ACTRulesReport | WCAGTechniquesReport | BestPracticesReport;

  function generateEARLAssertions(report: Report): Array<Assertion>;
  function generateEARLReport(
    reports: Evaluations,
    options?: EarlOptions
  ): EarlEvaluations;

  export {
    EarlOptions,
    Report,
    EarlReport,
    Assertor,
    Assertion,
    ResultSource,
    TestResult,
    TestSubject,
    EarlEvaluations,
    generateEARLAssertions,
    generateEARLReport,
  };
}
