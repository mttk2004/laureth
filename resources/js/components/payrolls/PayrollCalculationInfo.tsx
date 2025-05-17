import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { HelpCircleIcon } from 'lucide-react';

interface PayrollCalculationInfoProps {
  className?: string;
}

export function PayrollCalculationInfo({ className }: PayrollCalculationInfoProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={`flex items-center cursor-help ${className || ''}`}>
          <HelpCircleIcon className="h-5 w-5 text-blue-600 hover:text-blue-700" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4">
        <div className="space-y-3">
          <h4 className="font-semibold">Cách tính lương tại LAURETH</h4>

          <div className="space-y-2 text-sm">
            <h5 className="font-medium">Quản lý cửa hàng (SM)</h5>
            <p className="text-muted-foreground">
              Lương cơ bản + Hoa hồng doanh số cửa hàng
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-2">
              <li>Lương cơ bản: Theo quy định với từng cửa hàng</li>
              <li>Hoa hồng: % doanh số theo quy định</li>
            </ul>
          </div>

          <div className="space-y-2 text-sm">
            <h5 className="font-medium">Trưởng ca (SL) & Nhân viên bán hàng (SA)</h5>
            <p className="text-muted-foreground">
              (Lương theo giờ × Số giờ làm việc) + Hoa hồng từ bán hàng
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-2">
              <li>Số giờ làm việc: Tính từ check-in đến check-out</li>
              <li>Hoa hồng: % doanh số cá nhân theo quy định</li>
            </ul>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
