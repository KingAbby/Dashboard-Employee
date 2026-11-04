import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { AlertIcon } from '../../components/ui/icons';
import { useToast } from '../../components/ui/useToast';
import { toErrorMessage } from '../../lib/api';
import type { Employee, EmployeePayload } from '../../types/api';
import { useCreateEmployee, useUpdateEmployee } from './api';

const optionalText = (max: number, message: string) => z.string().max(max, message).optional();

const buildSchema = (isEdit: boolean) =>
  z.object({
    fullName: z
      .string()
      .min(2, 'Nama lengkap minimal 2 karakter.')
      .max(120, 'Nama lengkap maksimal 120 karakter.'),
    email: z.string().min(1, 'Email wajib diisi.').email('Format email tidak valid.'),
    employeeCode: z
      .string()
      .max(20, 'Kode maksimal 20 karakter.')
      .regex(/^[A-Za-z0-9-]*$/, 'Hanya huruf, angka, dan tanda hubung.')
      .optional(),
    password: isEdit
      ? z.string().max(72, 'Password maksimal 72 karakter.').optional()
      : z.string().min(8, 'Password minimal 8 karakter.').max(72, 'Password maksimal 72 karakter.'),
    role: z.enum(['EMPLOYEE', 'ADMIN_HRD']),
    position: optionalText(100, 'Jabatan maksimal 100 karakter.'),
    department: optionalText(100, 'Divisi maksimal 100 karakter.'),
    phone: z
      .string()
      .max(30, 'Nomor telepon maksimal 30 karakter.')
      .regex(/^[0-9+\-\s()]*$/, 'Hanya angka dan simbol + - ( ).')
      .optional(),
    joinDate: z.string().optional(),
    isActive: z.boolean(),
  });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

const EMPTY: FormValues = {
  fullName: '',
  email: '',
  employeeCode: '',
  password: '',
  role: 'EMPLOYEE',
  position: '',
  department: '',
  phone: '',
  joinDate: '',
  isActive: true,
};

const toFormValues = (employee: Employee | null): FormValues =>
  employee
    ? {
        fullName: employee.fullName,
        email: employee.email,
        employeeCode: employee.employeeCode,
        password: '',
        role: employee.role,
        position: employee.position ?? '',
        department: employee.department ?? '',
        phone: employee.phone ?? '',
        joinDate: employee.joinDate ?? '',
        isActive: employee.isActive,
      }
    : EMPTY;

const trimmed = (value?: string): string | undefined => {
  const next = value?.trim();
  return next && next.length > 0 ? next : undefined;
};

const toPayload = (values: FormValues, isEdit: boolean): EmployeePayload => ({
  fullName: values.fullName.trim(),
  email: values.email.trim().toLowerCase(),
  employeeCode: trimmed(values.employeeCode),
  role: values.role,
  position: trimmed(values.position),
  department: trimmed(values.department),
  phone: trimmed(values.phone),
  joinDate: trimmed(values.joinDate),
  ...(trimmed(values.password) ? { password: values.password } : {}),
  ...(isEdit ? { isActive: values.isActive } : {}),
});

interface EmployeeFormProps {
  employee: Employee | null;
  onClose: () => void;
}

/**
 * Dipisah dari Modal dan diberi key di parent, sehingga nilai awal form
 * dihitung sekali per karyawan tanpa perlu reset manual lewat effect.
 */
function EmployeeForm({ employee, onClose }: EmployeeFormProps) {
  const isEdit = Boolean(employee);
  const { toast } = useToast();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(buildSchema(isEdit)),
    defaultValues: toFormValues(employee),
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      if (employee) {
        await updateEmployee.mutateAsync({ id: employee.id, payload: toPayload(values, true) });
        toast('Data karyawan berhasil diperbarui.');
      } else {
        await createEmployee.mutateAsync(toPayload(values, false));
        toast('Karyawan baru berhasil ditambahkan.');
      }
      onClose();
    } catch (error) {
      setFormError(toErrorMessage(error));
    }
  };

  return (
    <>
      <form id="employee-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-card border border-danger/25 bg-danger-tint px-3 py-2.5"
          >
            <span className="mt-0.5 text-danger">
              <AlertIcon size={15} />
            </span>
            <p className="text-[12px] font-medium leading-relaxed text-danger">{formError}</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nama lengkap"
            required
            placeholder="Nama sesuai kontrak kerja"
            className="sm:col-span-2"
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input
            label="Email"
            type="email"
            required
            placeholder="nama@perusahaan.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Kode karyawan"
            placeholder="Kosongkan untuk otomatis"
            hint="Format EMP-0001, dibuat otomatis bila kosong."
            error={errors.employeeCode?.message}
            {...register('employeeCode')}
          />

          <Input
            label={isEdit ? 'Password baru' : 'Password awal'}
            type="password"
            required={!isEdit}
            placeholder={isEdit ? 'Kosongkan bila tidak diubah' : 'Buat password awal'}
            hint={isEdit ? 'Isi hanya bila ingin mengganti password.' : 'Minimal 8 karakter.'}
            className="sm:col-span-2"
            error={errors.password?.message}
            {...register('password')}
          />

          <Select label="Role" required error={errors.role?.message} {...register('role')}>
            <option value="EMPLOYEE">Karyawan</option>
            <option value="ADMIN_HRD">Admin HRD</option>
          </Select>

          <Input
            label="Divisi"
            placeholder="Engineering"
            error={errors.department?.message}
            {...register('department')}
          />

          <Input
            label="Jabatan"
            placeholder="Frontend Engineer"
            error={errors.position?.message}
            {...register('position')}
          />

          <Input
            label="Nomor telepon"
            placeholder="0812-0000-0000"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Tanggal masuk"
            type="date"
            className={isEdit ? undefined : 'sm:col-span-2 sm:max-w-[240px]'}
            error={errors.joinDate?.message}
            {...register('joinDate')}
          />

          {isEdit ? (
            <label className="flex items-start gap-2.5 rounded-card border border-line bg-bg/60 px-3 py-2.5">
              <input
                type="checkbox"
                className="mt-0.5 h-3.5 w-3.5 accent-[#d9824a]"
                {...register('isActive')}
              />
              <span>
                <span className="block text-[12px] font-semibold text-ink">Akun aktif</span>
                <span className="block text-[11px] text-muted">
                  Nonaktifkan agar karyawan tidak bisa login, tanpa menghapus riwayat.
                </span>
              </span>
            </label>
          ) : null}
        </div>
      </form>

      <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-4">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" form="employee-form" loading={isSubmitting}>
          {isEdit ? 'Simpan perubahan' : 'Tambah karyawan'}
        </Button>
      </div>
    </>
  );
}

export interface EmployeeFormModalProps {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
}

export function EmployeeFormModal({ open, employee, onClose }: EmployeeFormModalProps) {
  const isEdit = Boolean(employee);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Ubah data karyawan' : 'Tambah karyawan'}
      description={
        isEdit
          ? 'Perubahan langsung tersimpan. Kosongkan password bila tidak ingin menggantinya.'
          : 'Admin menentukan password awal; karyawan bisa memintanya diganti lewat HRD.'
      }
    >
      <EmployeeForm key={employee?.id ?? 'new'} employee={employee} onClose={onClose} />
    </Modal>
  );
}
