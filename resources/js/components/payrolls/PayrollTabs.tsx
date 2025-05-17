import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Payroll } from '@/types/payroll';
import { Store } from '@/types/store';
import { roleLabels, UserRole } from '@/types/user';
import { Building, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PayrollCard } from './PayrollCard';

interface PayrollTabsProps {
    payrollsByStore: Record<string, Payroll[]>;
    stores: Store[];
    filteredPayrolls: Payroll[];
    payrollByPosition: {
        position: string;
        count: number;
        total_amount: number;
    }[];
    handleApprovePayroll: (id: number) => void;
    payrolls: {
        links?: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    handlePageChange: (page: number) => void;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export function PayrollTabs({
    payrollsByStore,
    stores,
    filteredPayrolls,
    payrollByPosition,
    handleApprovePayroll,
    payrolls,
    handlePageChange,
    activeTab = 'byStore',
    onTabChange,
}: PayrollTabsProps) {
    // State để lưu trữ tab hiện tại
    const [currentTab, setCurrentTab] = useState(activeTab);

    // Cập nhật tab khi prop activeTab thay đổi
    useEffect(() => {
        setCurrentTab(activeTab);
    }, [activeTab]);

    // Kiểm tra xem links có tồn tại và có đủ phần tử không
    const hasPageLinks = payrolls.links && payrolls.links.length > 3;

    // Xử lý khi tab thay đổi
    const handleTabChange = (tab: string) => {
        setCurrentTab(tab);
        if (onTabChange) {
            onTabChange(tab);
        }
    };

    return (
        <>
            <Tabs defaultValue="byStore" value={currentTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="byStore">Theo cửa hàng</TabsTrigger>
                    <TabsTrigger value="byRole">Theo vai trò</TabsTrigger>
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                </TabsList>

                {/* Tab theo cửa hàng */}
                <TabsContent value="byStore">
                    <div className="space-y-6">
                        {Object.entries(payrollsByStore).map(([storeId, payrolls]) => {
                            const storeName =
                                storeId === 'unassigned' ? 'Không thuộc cửa hàng' : stores.find((s) => s.id === storeId)?.name || 'Không rõ cửa hàng';

                            return (
                                <div key={storeId} className="rounded-lg border p-4">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                        <Building className="h-5 w-5" />
                                        {storeName}
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {payrolls.map((payroll) => (
                                            <PayrollCard key={payroll.id} payroll={payroll} onApprove={handleApprovePayroll} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {Object.keys(payrollsByStore).length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-muted-foreground">Không có dữ liệu bảng lương phù hợp</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Tab theo vai trò */}
                <TabsContent value="byRole">
                    <div className="space-y-6">
                        {payrollByPosition.map((position) => {
                            const positionPayrolls = filteredPayrolls.filter((p) => p.user?.position === position.position);

                            if (positionPayrolls.length === 0) return null;

                            return (
                                <div key={position.position} className="rounded-lg border p-4">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                        <UserIcon className="h-5 w-5" />
                                        {roleLabels[position.position as UserRole] || position.position}
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {positionPayrolls.map((payroll) => (
                                            <PayrollCard key={payroll.id} payroll={payroll} onApprove={handleApprovePayroll} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Tab tất cả */}
                <TabsContent value="all">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredPayrolls.map((payroll) => (
                            <PayrollCard key={payroll.id} payroll={payroll} onApprove={handleApprovePayroll} />
                        ))}

                        {filteredPayrolls.length === 0 && (
                            <div className="col-span-full py-12 text-center">
                                <p className="text-muted-foreground">Không có dữ liệu bảng lương phù hợp</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Pagination */}
            {hasPageLinks && (
                <div className="mt-4 flex justify-center">
                    <div className="flex gap-1">
                        {payrolls.links?.map((link, i) => {
                            // Skip first and last elements if they are "Previous" and "Next" buttons
                            if (i === 0 || i === payrolls.links!.length - 1) return null;

                            const page = link.label === '...' ? null : parseInt(link.label);

                            // Sửa lại hàm xử lý khi nhấn nút phân trang để giữ nguyên tab hiện tại
                            const handlePageClick = () => {
                                if (page) {
                                    handlePageChange(page);
                                }
                            };

                            return (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-9 w-9"
                                    disabled={!page}
                                    onClick={handlePageClick}
                                >
                                    {link.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}
