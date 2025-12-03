export const CordaAPI = {
  A: "http://localhost:8080/api/rupiah",
  B: "http://localhost:8081/api/rupiah",
  C: "http://localhost:8082/api/rupiah",
} as const;

export type BankKey = keyof typeof CordaAPI;

export function getNode(bank: BankKey) {
  return CordaAPI[bank];
}
