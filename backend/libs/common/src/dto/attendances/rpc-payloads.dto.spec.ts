import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import type { ClassConstructor } from 'class-transformer';
import { validate } from 'class-validator';
import { EmployeeTodayPayloadDto, MyAttendancesQueryDto } from './rpc-payloads.dto';

const UUID_V1 = 'a20b4373-d84b-11f1-b90d-46b8eb0694e4';
const UUID_V4 = '22222222-4222-8222-8222-222222222222';

const errorsOf = async <T extends object>(dto: ClassConstructor<T>, payload: object) =>
  (await validate(plainToInstance(dto, payload))).map((error) => ({
    property: error.property,
    constraints: error.constraints,
  }));

describe('payload absensi', () => {
  it('menerima employeeId UUID v1', async () => {
    const errors = await errorsOf(EmployeeTodayPayloadDto, { employeeId: UUID_V1 });
    expect(errors).toHaveLength(0);
  });

  it('menerima employeeId UUID v4 dan rentang tanggal riwayat', async () => {
    const errors = await errorsOf(MyAttendancesQueryDto, {
      employeeId: UUID_V4,
      dateFrom: '2026-11-01',
      dateTo: '2026-11-30',
    });
    expect(errors).toHaveLength(0);
  });

  it('menolak employeeId yang bukan UUID', async () => {
    const errors = await errorsOf(EmployeeTodayPayloadDto, { employeeId: 'bukan-uuid' });
    expect(errors).toHaveLength(1);
  });
});
