import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const _CN = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export { _CN };
