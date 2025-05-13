import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface Props {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}

export default function Pagination({ currentPage, lastPage, total, perPage }: Props) {
  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Hiển thị <span className="font-medium">{from}</span> đến{' '}
        <span className="font-medium">{to}</span> trong tổng số{' '}
        <span className="font-medium">{total}</span> sản phẩm
      </div>

      <div className="flex gap-2">
        <Link
          href={`?page=${currentPage - 1}`}
          preserveScroll
          preserveState
          disabled={currentPage === 1}
        >
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>

        <Link
          href={`?page=${currentPage + 1}`}
          preserveScroll
          preserveState
          disabled={currentPage === lastPage}
        >
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === lastPage}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
