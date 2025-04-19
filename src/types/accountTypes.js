export const ACCOUNT_TYPES = {
    PREMIUM: 1,
    SUBMITTER: 2,
    ANON: 3,
    NOT_CONFIGURED: -1
  };
  
  export const getAccountTypeName = (typeNumber) => {
    return Object.keys(ACCOUNT_TYPES).find(
      key => ACCOUNT_TYPES[key] === typeNumber
    )?.toLowerCase() || null;
  };
  
  export const isValidAccountType = (typeNumber) => {
    return Object.values(ACCOUNT_TYPES).includes(typeNumber);
  };