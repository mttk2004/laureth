import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Package } from 'lucide-react';

interface TopProduct {
    id: string;
    name: string;
    category_name: string;
    total_quantity: number;
    total_sales: number;
}

interface ProductPerformanceCardProps {
    topProducts: TopProduct[];
}

export function ProductPerformanceCard({ topProducts }: ProductPerformanceCardProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Sản phẩm bán chạy</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {topProducts.map((product) => (
                        <div
                            key={product.id}
                            className="flex items-start justify-between gap-4 rounded-lg border p-3"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Package className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-muted-foreground text-sm">{product.category_name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">{formatCurrency(product.total_sales)}</p>
                                <p className="text-muted-foreground text-sm">{product.total_quantity} sản phẩm</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
