export const ACCOUNT_TYPES = {
    FREE: 0,
    PREMIUM: 1,
    ENTERPRISE: 2
  };
  
  export const getAccountTypeName = (typeNumber) => {
    return Object.keys(ACCOUNT_TYPES).find(
      key => ACCOUNT_TYPES[key] === typeNumber
    )?.toLowerCase() || null;
  };
  
  export const isValidAccountType = (typeNumber) => {
    return Object.values(ACCOUNT_TYPES).includes(typeNumber);
  };