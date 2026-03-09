export const CONTRACT_ADDRESSES = {
  // Вставьте сюда адреса из лога деплоя
  WETH: "0x123..." as `0x${string}`,
  FACTORY: "0x456..." as `0x${string}`,
  ROUTER: "0x789..." as `0x${string}`,  // ← назови ROUTER, не ROUTER_ADDRESS
  TOKEN_A: "0xabc..." as `0x${string}`,
  TOKEN_B: "0xdef..." as `0x${string}`,
} as const;

// Отдельные экспорты для удобства
export const ROUTER_ADDRESS = CONTRACT_ADDRESSES.ROUTER;
export const FACTORY_ADDRESS = CONTRACT_ADDRESSES.FACTORY;
export const WETH_ADDRESS = CONTRACT_ADDRESSES.WETH;
export const TOKEN_A_ADDRESS = CONTRACT_ADDRESSES.TOKEN_A;
export const TOKEN_B_ADDRESS = CONTRACT_ADDRESSES.TOKEN_B;