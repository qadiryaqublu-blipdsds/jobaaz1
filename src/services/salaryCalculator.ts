/**
 * Əmək Haqqı Hesablanması Kalkulyatoru | Gross ↔ Net
 * AR 2026 Vergi Məcəlləsi və Sosial Sığorta Qanunvericiliyinə tam uyğun
 */

export type SectorType = 'private_non_oil' | 'private_oil' | 'public' | 'private' | 'state';
export type CalculationBasis = 'gross' | 'net';
export type CalculationDirection = 'gross' | 'net';
export type WorkPlaceType = 'main' | 'extra';

export interface SalaryCalculatorParams {
  sector: 'private_non_oil' | 'private_oil' | 'public' | string;
  taxBenefit: number;
  lifeInsurance?: number;
  deductionEnabled?: boolean;
  deduction?: number;
  additionEnabled?: boolean;
  addition?: number;
  unionFee?: number;
}

export interface SalaryCalculationResult {
  gross: number;
  taxableIncome: number;
  benefit: number;
  incomeTax: number;
  employeeSocial: number;
  employeeMedical: number;
  employeeUnemployment: number;
  otherDeductions: number;
  net: number;
  employerSocial: number;
  employerMedical: number;
  employerUnemployment: number;
  employerCost: number;
}

// Backwards compatibility interface
export interface CalculiaBreakdown {
  gross: number;
  net: number;
  taxableIncome: number;
  generalAllowance: number;
  selectedBenefitsTotal: number;
  incomeTax: number;
  dsmf: number;
  unemployment: number;
  healthInsurance: number;
  unionFee: number;
  totalEmployeeDeductions: number;
  effectiveTaxRate: number;
  employerDsmf: number;
  employerHealthInsurance: number;
  employerUnemployment: number;
  totalEmployerCost: number;
}

/* =========================================================
   KÖMƏKÇİ FUNKSİYALAR
========================================================= */

export function money(value: number): string {
  return Number(value || 0)
    .toLocaleString("az-AZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + " AZN";
}

export function formatAZN(amount: number): string {
  return money(amount);
}

/* =========================================================
   2026 GƏLİR VERGİSİ
========================================================= */

export function calculateIncomeTax(taxableIncome: number, sector: string): number {
  taxableIncome = Math.max(0, taxableIncome);

  /*
      Qeyri-neft / qeyri-dövlət sektoru:
      0 – 2500: 3%
      2500 – 8000: 75 + 10% (2500-dən yuxarı hissə)
      8000-dən yuxarı: 625 + 14% (8000-dən yuxarı hissə)
  */
  if (sector === "private_non_oil" || sector === "private") {
    if (taxableIncome <= 2500) {
      return taxableIncome * 0.03;
    }
    if (taxableIncome <= 8000) {
      return 75 + (taxableIncome - 2500) * 0.10;
    }
    return 625 + (taxableIncome - 8000) * 0.14;
  }

  if (sector === "private_oil") {
    return taxableIncome * 0.14;
  }

  if (sector === "public" || sector === "state") {
    return taxableIncome * 0.14;
  }

  return 0;
}

/* =========================================================
   İŞÇİ SOSİAL SIĞORTASI
========================================================= */

export function employeeSocialInsurance(gross: number, sector: string): number {
  gross = Math.max(0, gross);

  if (sector === "private_non_oil" || sector === "private") {
    if (gross <= 200) {
      return gross * 0.03;
    }
    if (gross <= 8000) {
      return 6 + (gross - 200) * 0.10;
    }
    return 786 + (gross - 8000) * 0.10;
  }

  return gross * 0.03;
}

/* =========================================================
   İŞƏGÖTÜRƏN SOSİAL SIĞORTASI
========================================================= */

export function employerSocialInsurance(gross: number, sector: string): number {
  gross = Math.max(0, gross);

  if (sector === "private_non_oil" || sector === "private") {
    if (gross <= 200) {
      return gross * 0.22;
    }
    if (gross <= 8000) {
      return 44 + (gross - 200) * 0.15;
    }
    return 1214 + (gross - 8000) * 0.11;
  }

  return gross * 0.22;
}

/* =========================================================
   TİBBİ SIĞORTA
========================================================= */

export function employeeMedicalInsurance(gross: number): number {
  gross = Math.max(0, gross);

  if (gross <= 2500) {
    return gross * 0.02;
  }

  return 2500 * 0.02 + (gross - 2500) * 0.005;
}

export function employerMedicalInsurance(gross: number): number {
  return employeeMedicalInsurance(gross);
}

/* =========================================================
   İŞSİZLİK SIĞORTASI
========================================================= */

export function employeeUnemploymentInsurance(gross: number): number {
  return Math.max(0, gross) * 0.005;
}

export function employerUnemploymentInsurance(gross: number): number {
  return Math.max(0, gross) * 0.005;
}

/* =========================================================
   GROSS → NET
========================================================= */

export function calculateGrossToNet(gross: number, params: SalaryCalculatorParams): SalaryCalculationResult {
  const sector = params.sector || "private_non_oil";
  const benefit = Math.max(0, Number(params.taxBenefit) || 0);
  const lifeInsurance = Math.max(0, Number(params.lifeInsurance) || 0);
  const deduction = params.deductionEnabled ? Math.max(0, Number(params.deduction) || 0) : 0;
  const addition = params.additionEnabled ? Math.max(0, Number(params.addition) || 0) : 0;
  const unionFee = Math.max(0, Number(params.unionFee) || 0);

  /*
      ƏLAVƏLƏR
      Əgər əlavə əmək haqqının bir hissəsidirsə, gross bazasına əlavə edilir.
  */
  const adjustedGross = gross + addition;

  /*
      ƏSAS MƏNTİQ:
      Gross - güzəşt = vergiyə cəlb olunan gəlir
  */
  const taxableIncome = Math.max(0, adjustedGross - benefit);

  const incomeTax = calculateIncomeTax(taxableIncome, sector);
  const employeeSocial = employeeSocialInsurance(adjustedGross, sector);
  const employeeMedical = employeeMedicalInsurance(adjustedGross);
  const employeeUnemployment = employeeUnemploymentInsurance(adjustedGross);

  /*
      İşçinin digər tutulmaları
  */
  const otherDeductions = deduction + unionFee + lifeInsurance;

  /*
      NET
  */
  const net = adjustedGross - incomeTax - employeeSocial - employeeMedical - employeeUnemployment - otherDeductions;

  /*
      İŞƏGÖTÜRƏN
  */
  const employerSocial = employerSocialInsurance(adjustedGross, sector);
  const employerMedical = employerMedicalInsurance(adjustedGross);
  const employerUnemployment = employerUnemploymentInsurance(adjustedGross);
  const employerCost = adjustedGross + employerSocial + employerMedical + employerUnemployment;

  return {
    gross: adjustedGross,
    taxableIncome,
    benefit,
    incomeTax,
    employeeSocial,
    employeeMedical,
    employeeUnemployment,
    otherDeductions,
    net,
    employerSocial,
    employerMedical,
    employerUnemployment,
    employerCost
  };
}

/* =========================================================
   NET → GROSS (Binary Search)
========================================================= */

export function calculateNetToGross(targetNet: number, params: SalaryCalculatorParams): SalaryCalculationResult {
  let low = 0;
  let high = Math.max(10000, targetNet * 3);

  /*
      Binary Search
  */
  for (let i = 0; i < 100; i++) {
    const middle = (low + high) / 2;
    const result = calculateGrossToNet(middle, params);

    if (result.net < targetNet) {
      low = middle;
    } else {
      high = middle;
    }
  }

  const gross = (low + high) / 2;
  return calculateGrossToNet(gross, params);
}

/* =========================================================
   BACKWARDS COMPATIBILITY WRAPPERS
========================================================= */

export function calculateFromGross(
  gross: number,
  sector: SectorType = 'private_non_oil',
  workPlace: WorkPlaceType = 'main',
  unionPercent: number = 0,
  selectedBenefitIds: string[] = [],
  customBenefitsAmount: number = 0
): CalculiaBreakdown {
  const normSector = sector === 'state' ? 'public' : sector === 'private' ? 'private_non_oil' : sector;
  const result = calculateGrossToNet(gross, {
    sector: normSector,
    taxBenefit: customBenefitsAmount,
  });

  const totalEmployeeDeductions = result.incomeTax + result.employeeSocial + result.employeeMedical + result.employeeUnemployment + result.otherDeductions;
  const effectiveTaxRate = result.gross > 0 ? (totalEmployeeDeductions / result.gross) * 100 : 0;

  return {
    gross: result.gross,
    net: result.net,
    taxableIncome: result.taxableIncome,
    generalAllowance: 0,
    selectedBenefitsTotal: result.benefit,
    incomeTax: result.incomeTax,
    dsmf: result.employeeSocial,
    unemployment: result.employeeUnemployment,
    healthInsurance: result.employeeMedical,
    unionFee: 0,
    totalEmployeeDeductions,
    effectiveTaxRate: Math.round(effectiveTaxRate * 10) / 10,
    employerDsmf: result.employerSocial,
    employerHealthInsurance: result.employerMedical,
    employerUnemployment: result.employerUnemployment,
    totalEmployerCost: result.employerCost
  };
}

export function calculateFromNet(
  targetNet: number,
  sector: SectorType = 'private_non_oil',
  workPlace: WorkPlaceType = 'main',
  unionPercent: number = 0,
  selectedBenefitIds: string[] = [],
  customBenefitsAmount: number = 0
): CalculiaBreakdown {
  const normSector = sector === 'state' ? 'public' : sector === 'private' ? 'private_non_oil' : sector;
  const result = calculateNetToGross(targetNet, {
    sector: normSector,
    taxBenefit: customBenefitsAmount,
  });

  const totalEmployeeDeductions = result.incomeTax + result.employeeSocial + result.employeeMedical + result.employeeUnemployment + result.otherDeductions;
  const effectiveTaxRate = result.gross > 0 ? (totalEmployeeDeductions / result.gross) * 100 : 0;

  return {
    gross: result.gross,
    net: result.net,
    taxableIncome: result.taxableIncome,
    generalAllowance: 0,
    selectedBenefitsTotal: result.benefit,
    incomeTax: result.incomeTax,
    dsmf: result.employeeSocial,
    unemployment: result.employeeUnemployment,
    healthInsurance: result.employeeMedical,
    unionFee: 0,
    totalEmployeeDeductions,
    effectiveTaxRate: Math.round(effectiveTaxRate * 10) / 10,
    employerDsmf: result.employerSocial,
    employerHealthInsurance: result.employerMedical,
    employerUnemployment: result.employerUnemployment,
    totalEmployerCost: result.employerCost
  };
}

export function calculateNetSalary(gross: number) {
  return calculateFromGross(gross, 'private_non_oil');
}

export function calculateGrossFromNet(net: number): number {
  return calculateFromNet(net, 'private_non_oil').gross;
}
