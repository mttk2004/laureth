import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { User } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface PageProps {
    user: User;
    currentMonth: number;
    currentYear: number;
}

const generatePayrollSchema = z.object({
    month: z.string().min(1, 'Vui lòng chọn tháng'),
    year: z.string().min(1, 'Vui lòng chọn năm'),
});

type FormValues = z.infer<typeof generatePayrollSchema>;

export default function CreatePayroll({ user, currentMonth, currentYear }: PageProps) {
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(generatePayrollSchema),
        defaultValues: {
            month: currentMonth.toString(),
            year: currentYear.toString(),
        },
    });

    const onSubmit = (values: FormValues) => {
        router.post(route('payrolls.generate'), values, {
            onSuccess: () => {
                toast({
                    title: 'Thành công',
                    description: 'Đã tạo bảng lương thành công',
                });
            },
        });
    };

    // Tạo mảng các tháng từ 1-12
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Tạo mảng các năm từ 2020 đến năm hiện tại + 1
    const currentYearNum = new Date().getFullYear();
    const years = Array.from({ length: currentYearNum - 2020 + 2 }, (_, i) => 2020 + i);

    return (
        <AppLayout user={user}>
            <Head title="Tạo bảng lương" />

            <div className="container py-6">
                <h1 className="mb-6 text-2xl font-bold">Tạo bảng lương mới</h1>

                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle>Tạo bảng lương tháng</CardTitle>
                        <CardDescription>
                            Hệ thống sẽ tạo bảng lương cho tất cả nhân viên trong tháng được chọn. Bảng lương sẽ được tạo ở trạng thái chờ duyệt.
                        </CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="month"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tháng</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn tháng" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {months.map((month) => (
                                                        <SelectItem key={month} value={month.toString()}>
                                                            Tháng {month}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Năm</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn năm" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {years.map((year) => (
                                                        <SelectItem key={year} value={year.toString()}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">
                                    Tạo bảng lương
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </div>
        </AppLayout>
    );
}
