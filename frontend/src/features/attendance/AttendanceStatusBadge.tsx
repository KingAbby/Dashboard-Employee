import { Badge } from '../../components/ui/Badge';
import type { AttendanceStatus } from '../../types/api';

export interface AttendanceStatusBadgeProps {
  status: AttendanceStatus | null | undefined;
}

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  if (!status) return <Badge tone="neutral">Belum absen</Badge>;

  return status === 'ON_TIME' ? (
    <Badge tone="success" dot>
      Tepat waktu
    </Badge>
  ) : (
    <Badge tone="warning" dot>
      Terlambat
    </Badge>
  );
}
