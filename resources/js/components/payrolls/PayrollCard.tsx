import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import { Payroll, PayrollStatus } from '@/types/payroll';
import { UserRole, roleLabels } from '@/types/user';
import { formatCurrency } from '@/lib/utils';

interface PayrollCardProps {
  payroll: Payroll;
  onApprove: (id: number) => void;
}

export function PayrollCard({ payroll, onApprove }: PayrollCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{payroll.user?.full_name || 'Không xác định'}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {roleLabels[payroll.user?.position as UserRole] || payroll.user?.position}
              {payroll.user?.store && ` - ${payroll.user.store.name}`}
            </CardDescription>
          </div>
          <Badge variant={payroll.status === PayrollStatus.PAID ? "default" : "outline"}>
            {payroll.status === PayrollStatus.PAID ? 'Đã thanh toán' : 'Chờ duyệt'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kỳ lương:</span>
            <span className="font-medium">Tháng {payroll.month}/{payroll.year}</span>
          </div>

          {payroll.base_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lương cơ bản:</span>
              <span>{formatCurrency(payroll.base_amount)}</span>
            </div>
          )}

          {payroll.total_hours > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số giờ làm:</span>
              <span>{payroll.total_hours} giờ</span>
            </div>
          )}

          {payroll.commission_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hoa hồng:</span>
              <span>{formatCurrency(payroll.commission_amount)}</span>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold">Tổng lương:</span>
            <span className="font-bold text-primary">{formatCurrency(payroll.final_amount)}</span>
          </div>
        </div>
      </CardContent>

      {payroll.status === PayrollStatus.PENDING && (
        <CardFooter className="pt-2">
          <Button
            onClick={() => onApprove(payroll.id)}
            className="w-full"
            size="sm"
          >
            <DollarSign className="h-4 w-4 mr-2" /> Duyệt thanh toán
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
