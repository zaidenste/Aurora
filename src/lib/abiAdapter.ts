import { type Abi, type AbiFunction, type Address } from 'viem';

export interface ResolvedContractFunctions {
  setPreference?: AbiFunction;
  runPayroll?: AbiFunction;
  getPreference?: AbiFunction;
  getPayrollsByEmployer?: AbiFunction;
  getPaymentsByRecipient?: AbiFunction;
  getPayroll?: AbiFunction;
  getPlatformStats?: AbiFunction;
  getQuote?: AbiFunction;
  getRate?: AbiFunction;
  totalPayrollsCounter?: AbiFunction;
  totalVolumeCounter?: AbiFunction;
  totalPaymentsCounter?: AbiFunction;
}

export interface NormalizedPlatformStats {
  totalPayrolls: bigint;
  totalPayments: bigint;
  totalVolumeUsdc: bigint;
  totalVolumeEurc: bigint;
  totalVolumeRaw: bigint;
  hasSeparateVolumes: boolean;
}

export interface NormalizedPaymentLine {
  payrollId?: bigint;
  recipient: Address;
  payToken?: Address;
  receivedToken: Address;
  inputAmount: bigint;
  receivedAmount: bigint;
  timestamp?: bigint;
}

export interface NormalizedPayrollBatch {
  id: bigint;
  employer: Address;
  payToken: Address;
  totalAmount: bigint;
  timestamp: bigint;
  recipientCount: number;
  payments: NormalizedPaymentLine[];
  txHash?: string;
}

function getFunctions(abi: Abi): AbiFunction[] {
  return abi.filter((item): item is AbiFunction => item.type === 'function');
}

function isWrite(fn: AbiFunction): boolean {
  return fn.stateMutability === 'nonpayable' || fn.stateMutability === 'payable';
}

function isRead(fn: AbiFunction): boolean {
  return fn.stateMutability === 'view' || fn.stateMutability === 'pure';
}

export function resolveContractFunctions(abi: Abi): ResolvedContractFunctions {
  const fns = getFunctions(abi);

  const setPreference =
    fns.find(
      (f) =>
        isWrite(f) &&
        f.inputs.length === 1 &&
        f.inputs[0].type === 'address' &&
        /prefer|token/i.test(f.name)
    ) ||
    fns.find(
      (f) => isWrite(f) && f.inputs.length === 1 && f.inputs[0].type === 'address'
    );

  const runPayroll =
    fns.find(
      (f) =>
        isWrite(f) &&
        f.inputs.length === 3 &&
        f.inputs.some((i) => i.type === 'address') &&
        f.inputs.some((i) => i.type === 'address[]') &&
        f.inputs.some((i) => /^uint/.test(i.type) && i.type.endsWith('[]')) &&
        /payroll|batch|pay|disburse/i.test(f.name)
    ) ||
    fns.find(
      (f) =>
        isWrite(f) &&
        f.inputs.length === 3 &&
        f.inputs.some((i) => i.type === 'address') &&
        f.inputs.some((i) => i.type === 'address[]') &&
        f.inputs.some((i) => /^uint/.test(i.type) && i.type.endsWith('[]'))
    );

  const getPreference =
    fns.find(
      (f) =>
        isRead(f) &&
        f.inputs.length === 1 &&
        f.inputs[0].type === 'address' &&
        f.outputs.length === 1 &&
        f.outputs[0].type === 'address' &&
        /prefer/i.test(f.name)
    ) ||
    fns.find(
      (f) =>
        isRead(f) &&
        f.inputs.length === 1 &&
        f.inputs[0].type === 'address' &&
        f.outputs.length === 1 &&
        f.outputs[0].type === 'address'
    );

  const getPayrollsByEmployer = fns.find(
    (f) =>
      isRead(f) &&
      f.inputs.length === 1 &&
      f.inputs[0].type === 'address' &&
      /employer|payroll/i.test(f.name) &&
      !/recipient|payment|prefer/i.test(f.name) &&
      f.outputs.length >= 1 &&
      f.outputs[0].type.endsWith('[]')
  );

  const getPaymentsByRecipient = fns.find(
    (f) =>
      isRead(f) &&
      f.inputs.length === 1 &&
      f.inputs[0].type === 'address' &&
      /recipient|payment|payslip/i.test(f.name) &&
      f.outputs.length >= 1 &&
      f.outputs[0].type.endsWith('[]')
  );

  const getPayroll = fns.find(
    (f) =>
      isRead(f) &&
      f.inputs.length === 1 &&
      /^uint/.test(f.inputs[0].type) &&
      /payroll|batch/i.test(f.name)
  );

  const getPlatformStats = fns.find(
    (f) =>
      isRead(f) &&
      f.inputs.length === 0 &&
      /stat|platform|summary|metrics/i.test(f.name)
  );

  const totalPayrollsCounter = fns.find(
    (f) =>
      isRead(f) &&
      f.inputs.length === 0 &&
      f.outputs.length === 1 &&
      /^uint/.test(f.outputs[0].type) &&
      /payrollCount|totalPayroll|nextPayrollId/i.test(f.name)
  );

  const totalVolumeCounter = fns.find(
    (f) =>
      isRead(f) &&
      f.inputs.length === 0 &&
      f.outputs.length === 1 &&
      /^uint/.test(f.outputs[0].type) &&
      /totalVolume|volume/i.test(f.name)
  );

  const totalPaymentsCounter = fns.find(
    (f) =>
      isRead(f) &&
      f.inputs.length === 0 &&
      f.outputs.length === 1 &&
      /^uint/.test(f.outputs[0].type) &&
      /totalPayment|paymentCount/i.test(f.name)
  );

  const getQuote = fns.find(
    (f) =>
      isRead(f) &&
      f.inputs.length === 3 &&
      f.inputs[0].type === 'address' &&
      f.inputs[1].type === 'address' &&
      /^uint/.test(f.inputs[2].type) &&
      /quote|convert|preview|amountOut/i.test(f.name)
  );

  const getRate = fns.find(
    (f) =>
      isRead(f) &&
      f.inputs.length <= 2 &&
      /rate|price/i.test(f.name)
  );

  return {
    setPreference,
    runPayroll,
    getPreference,
    getPayrollsByEmployer,
    getPaymentsByRecipient,
    getPayroll,
    getPlatformStats,
    getQuote,
    getRate,
    totalPayrollsCounter,
    totalVolumeCounter,
    totalPaymentsCounter,
  };
}

export function buildRunPayrollArgs(
  fn: AbiFunction,
  payToken: Address,
  recipients: Address[],
  amounts: bigint[]
): unknown[] {
  return fn.inputs.map((input) => {
    if (input.type === 'address') return payToken;
    if (input.type === 'address[]') return recipients;
    if (/^uint/.test(input.type) && input.type.endsWith('[]')) return amounts;
    return undefined;
  });
}

function toBigIntSafe(val: unknown): bigint {
  if (typeof val === 'bigint') return val;
  if (typeof val === 'number' && Number.isFinite(val)) return BigInt(Math.trunc(val));
  if (typeof val === 'string' && /^\d+$/.test(val)) return BigInt(val);
  return 0n;
}

function pickProp(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (key in obj && obj[key] !== undefined) return obj[key];
  }
  return undefined;
}

export function normalizePlatformStats(raw: unknown): NormalizedPlatformStats {
  if (!raw) {
    return {
      totalPayrolls: 0n,
      totalPayments: 0n,
      totalVolumeUsdc: 0n,
      totalVolumeEurc: 0n,
      totalVolumeRaw: 0n,
      hasSeparateVolumes: false,
    };
  }

  if (Array.isArray(raw)) {
    if (raw.length >= 4) {
      return {
        totalPayrolls: toBigIntSafe(raw[0]),
        totalPayments: toBigIntSafe(raw[1]),
        totalVolumeUsdc: toBigIntSafe(raw[2]),
        totalVolumeEurc: toBigIntSafe(raw[3]),
        totalVolumeRaw: toBigIntSafe(raw[2]) + toBigIntSafe(raw[3]),
        hasSeparateVolumes: true,
      };
    }
    if (raw.length === 3) {
      return {
        totalPayrolls: toBigIntSafe(raw[0]),
        totalPayments: toBigIntSafe(raw[1]),
        totalVolumeUsdc: 0n,
        totalVolumeEurc: 0n,
        totalVolumeRaw: toBigIntSafe(raw[2]),
        hasSeparateVolumes: false,
      };
    }
    if (raw.length === 2) {
      return {
        totalPayrolls: toBigIntSafe(raw[0]),
        totalPayments: 0n,
        totalVolumeUsdc: 0n,
        totalVolumeEurc: 0n,
        totalVolumeRaw: toBigIntSafe(raw[1]),
        hasSeparateVolumes: false,
      };
    }
  }

  if (typeof raw === 'object' && raw !== null) {
    const record = raw as Record<string, unknown>;
    const totalPayrolls = toBigIntSafe(
      pickProp(record, ['totalPayrolls', 'payrollCount', 'batchesCount', 'runsCount'])
    );
    const totalPayments = toBigIntSafe(
      pickProp(record, ['totalPayments', 'paymentCount', 'totalRecipients', 'recipientsPaid'])
    );
    const volUsdc = pickProp(record, ['totalUsdcVolume', 'totalVolumeUsdc', 'usdcVolume']);
    const volEurc = pickProp(record, ['totalEurcVolume', 'totalVolumeEurc', 'eurcVolume']);
    const volSingle = pickProp(record, ['totalVolume', 'volume', 'totalDisbursed']);

    const totalVolumeUsdc = toBigIntSafe(volUsdc);
    const totalVolumeEurc = toBigIntSafe(volEurc);
    const hasSeparateVolumes = volUsdc !== undefined || volEurc !== undefined;
    const totalVolumeRaw = hasSeparateVolumes
      ? totalVolumeUsdc + totalVolumeEurc
      : toBigIntSafe(volSingle);

    return {
      totalPayrolls,
      totalPayments,
      totalVolumeUsdc,
      totalVolumeEurc,
      totalVolumeRaw,
      hasSeparateVolumes,
    };
  }

  return {
    totalPayrolls: 0n,
    totalPayments: 0n,
    totalVolumeUsdc: 0n,
    totalVolumeEurc: 0n,
    totalVolumeRaw: 0n,
    hasSeparateVolumes: false,
  };
}

export function normalizePaymentLine(
  raw: unknown,
  fallbackPayToken?: Address
): NormalizedPaymentLine | null {
  if (!raw) return null;

  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const r = raw as Record<string, unknown>;
    const recipient = pickProp(r, ['recipient', 'employee', 'to', 'wallet']) as Address | undefined;
    if (!recipient) return null;
    const receivedToken = (pickProp(r, [
      'receivedToken',
      'tokenOut',
      'targetToken',
      'outputToken',
      'preferredToken',
      'token',
    ]) || fallbackPayToken) as Address;
    const payToken = pickProp(r, ['payToken', 'tokenIn', 'sourceToken']) as Address | undefined;
    const inputAmount = toBigIntSafe(
      pickProp(r, ['inputAmount', 'amountIn', 'sourceAmount', 'grossAmount', 'amount'])
    );
    const receivedAmount = toBigIntSafe(
      pickProp(r, ['receivedAmount', 'amountOut', 'payoutAmount', 'convertedAmount', 'amount'])
    );
    const payrollIdRaw = pickProp(r, ['payrollId', 'batchId', 'id']);
    const tsRaw = pickProp(r, ['timestamp', 'paidAt', 'createdAt']);

    return {
      payrollId: payrollIdRaw !== undefined ? toBigIntSafe(payrollIdRaw) : undefined,
      recipient,
      payToken: payToken || fallbackPayToken,
      receivedToken,
      inputAmount: inputAmount || receivedAmount,
      receivedAmount: receivedAmount || inputAmount,
      timestamp: tsRaw !== undefined ? toBigIntSafe(tsRaw) : undefined,
    };
  }

  if (Array.isArray(raw)) {
    const addresses = raw.filter((v): v is Address => typeof v === 'string' && v.startsWith('0x'));
    const nums = raw.filter(
      (v) => typeof v === 'bigint' || typeof v === 'number' || (typeof v === 'string' && /^\d+$/.test(v))
    );
    if (addresses.length === 0) return null;
    return {
      payrollId: nums.length >= 3 ? toBigIntSafe(nums[0]) : undefined,
      recipient: addresses[0],
      payToken: fallbackPayToken,
      receivedToken: addresses[1] || fallbackPayToken || addresses[0],
      inputAmount: nums.length >= 2 ? toBigIntSafe(nums[nums.length - 2]) : toBigIntSafe(nums[0]),
      receivedAmount: toBigIntSafe(nums[nums.length - 1]),
    };
  }

  return null;
}

export function normalizePayrollBatch(
  raw: unknown,
  fallbackId?: bigint
): NormalizedPayrollBatch | null {
  if (!raw) return null;

  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const r = raw as Record<string, unknown>;
    const idRaw = pickProp(r, ['id', 'payrollId', 'batchId']);
    const id = idRaw !== undefined ? toBigIntSafe(idRaw) : fallbackId ?? 0n;
    const employer = (pickProp(r, ['employer', 'sender', 'payer', 'creator']) ||
      '0x0000000000000000000000000000000000000000') as Address;
    const payToken = (pickProp(r, ['payToken', 'token', 'sourceToken', 'tokenIn']) ||
      '0x0000000000000000000000000000000000000000') as Address;
    const totalAmount = toBigIntSafe(
      pickProp(r, ['totalAmount', 'totalPaid', 'amount', 'totalInputAmount'])
    );
    const timestamp = toBigIntSafe(pickProp(r, ['timestamp', 'createdAt', 'paidAt']));

    const rawItems = pickProp(r, ['payments', 'items', 'payouts', 'records']);
    let payments: NormalizedPaymentLine[] = [];
    if (Array.isArray(rawItems)) {
      payments = rawItems
        .map((item) => normalizePaymentLine(item, payToken))
        .filter((item): item is NormalizedPaymentLine => item !== null);
    } else {
      const recipients = pickProp(r, ['recipients']) as Address[] | undefined;
      const amounts = pickProp(r, ['amounts', 'inputAmounts']) as unknown[] | undefined;
      const outTokens = pickProp(r, ['outputTokens', 'receivedTokens', 'tokensOut']) as
        | Address[]
        | undefined;
      const outAmounts = pickProp(r, ['outputAmounts', 'receivedAmounts', 'amountsOut']) as
        | unknown[]
        | undefined;

      if (Array.isArray(recipients)) {
        payments = recipients.map((recipient, idx) => ({
          payrollId: id,
          recipient,
          payToken,
          receivedToken: outTokens?.[idx] || payToken,
          inputAmount: toBigIntSafe(amounts?.[idx]),
          receivedAmount: toBigIntSafe(outAmounts?.[idx] ?? amounts?.[idx]),
          timestamp,
        }));
      }
    }

    const explicitCount = pickProp(r, ['recipientCount', 'count']);
    const recipientCount =
      explicitCount !== undefined ? Number(explicitCount) : payments.length;

    return {
      id,
      employer,
      payToken,
      totalAmount,
      timestamp,
      recipientCount,
      payments,
    };
  }

  if (Array.isArray(raw)) {
    const first = raw[0];
    if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
      return normalizePayrollBatch(first, fallbackId);
    }
    const addresses = raw.filter((v): v is Address => typeof v === 'string' && v.startsWith('0x'));
    const bigints = raw.filter((v) => typeof v === 'bigint');
    const nestedArrays = raw.filter((v) => Array.isArray(v));

    const employer = addresses[0] || ('0x0000000000000000000000000000000000000000' as Address);
    const payToken = addresses[1] || ('0x0000000000000000000000000000000000000000' as Address);
    const id = fallbackId ?? bigints[0] ?? 0n;
    const totalAmount = bigints.length >= 2 ? bigints[1] : bigints[0] ?? 0n;
    const timestamp = bigints.length >= 3 ? bigints[2] : 0n;

    let payments: NormalizedPaymentLine[] = [];
    if (nestedArrays.length > 0 && Array.isArray(nestedArrays[0])) {
      const maybeAddresses = nestedArrays[0];
      if (typeof maybeAddresses[0] === 'string' && maybeAddresses[0].startsWith('0x')) {
        const recipients = maybeAddresses as Address[];
        const amounts = (nestedArrays[1] as unknown[]) || [];
        const outTokens = (nestedArrays[2] as Address[]) || [];
        const outAmounts = (nestedArrays[3] as unknown[]) || [];
        payments = recipients.map((recipient, idx) => ({
          payrollId: id,
          recipient,
          payToken,
          receivedToken: outTokens[idx] || payToken,
          inputAmount: toBigIntSafe(amounts[idx]),
          receivedAmount: toBigIntSafe(outAmounts[idx] ?? amounts[idx]),
          timestamp,
        }));
      } else {
        payments = nestedArrays[0]
          .map((item) => normalizePaymentLine(item, payToken))
          .filter((item): item is NormalizedPaymentLine => item !== null);
      }
    }

    return {
      id,
      employer,
      payToken,
      totalAmount,
      timestamp,
      recipientCount: payments.length,
      payments,
    };
  }

  return null;
}
