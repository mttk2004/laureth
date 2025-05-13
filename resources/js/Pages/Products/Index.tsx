import { Head } from '@inertiajs/react';
import { Table } from '@radix-ui/themes';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Button } from '@/Components/ui/button';
import { Eye, Trash2 } from 'lucide-react';
import { Product } from '@/types/models';

interface Props {
  products: {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function Index({ products }: Props) {
  return (
    <AdminLayout>
      <Head title="Quản lý sản phẩm" />

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý sản phẩm</h1>
          <Button className="bg-[#F5B3BE] hover:bg-[#f59eac]">
            Thêm sản phẩm mới
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Mã SP</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Tên sản phẩm</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Giá bán</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Tồn kho</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Trạng thái</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Thao tác</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {products.data.map((product) => (
                <Table.Row key={product.id}>
                  <Table.Cell>{product.sku}</Table.Cell>
                  <Table.Cell>{product.name}</Table.Cell>
                  <Table.Cell>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(product.price)}
                  </Table.Cell>
                  <Table.Cell>{product.stock}</Table.Cell>
                  <Table.Cell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          <div className="py-4 px-6">
            <Pagination
              currentPage={products.current_page}
              lastPage={products.last_page}
              total={products.total}
              perPage={products.per_page}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
