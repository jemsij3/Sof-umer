export const formatDynamicKey = (t: (key: string) => string, namespace: string, rawValue: string): string => {
  if (!rawValue) return '';
  const formattedKey = `${namespace}.${rawValue.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const translated = t(formattedKey);
  if (translated && translated !== formattedKey) {
    return translated;
  }
  const directTrans = t(rawValue);
  if (directTrans && directTrans !== rawValue) {
    return directTrans;
  }
  return rawValue;
};
