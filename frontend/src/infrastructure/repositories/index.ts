import { USE_MOCK_API } from "../config";
import { IPatternRepository } from "../../domain/repositories/IPatternRepository";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { MockPatternRepository } from "./MockPatternRepository";
import { MockAuthRepository } from "./MockAuthRepository";
import { ApiPatternRepository } from "./ApiPatternRepository";
import { ApiAuthRepository } from "./ApiAuthRepository";

let patternRepoInstance: IPatternRepository | null = null;
let authRepoInstance: IAuthRepository | null = null;

export function getPatternRepository(): IPatternRepository {
  if (!patternRepoInstance) {
    patternRepoInstance = USE_MOCK_API
      ? new MockPatternRepository()
      : new ApiPatternRepository();
  }
  return patternRepoInstance;
}

export function getAuthRepository(): IAuthRepository {
  if (!authRepoInstance) {
    authRepoInstance = USE_MOCK_API
      ? new MockAuthRepository()
      : new ApiAuthRepository();
  }
  return authRepoInstance;
}

export function resetRepositories(): void {
  patternRepoInstance = null;
  authRepoInstance = null;
}

export { MockPatternRepository, MockAuthRepository, ApiPatternRepository, ApiAuthRepository };
