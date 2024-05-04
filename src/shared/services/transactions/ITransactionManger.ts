export abstract class ITransactionRunner {
  abstract startTransaction(): Promise<void>;
  abstract commitTransaction(): Promise<void>;
  abstract rollbackTransaction(): Promise<void>;
  abstract releaseTransaction(): Promise<void>;
}
