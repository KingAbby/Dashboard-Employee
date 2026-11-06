/**
 * Divisi tetap yang bisa dipilih admin. Frontend punya daftar yang sama di
 * `frontend/src/config/departments.ts`; ubah keduanya bila menambah divisi.
 */
export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Human Resources',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Customer Support',
  'Legal',
] as const;

export type Department = (typeof DEPARTMENTS)[number];
