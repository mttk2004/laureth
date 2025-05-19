import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { User } from '@/types/user';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface ErrorPageProps {
  user: User;
  message: string;
  returnUrl?: string;
  returnLabel?: string;
}

export default function ErrorPage({ user, message, returnUrl = '/dashboard', returnLabel = 'Quay lại trang chủ' }: ErrorPageProps) {
  const { props } = usePage();

  // Nếu không có message được truyền qua props, thử lấy từ flash
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorMessage = message || (props.flash as any)?.error || 'Đã xảy ra lỗi khi truy cập trang này.';

  return (
    <AppLayout user={user}>
      <Head title="Lỗi truy cập" />

      <div className="container mx-auto flex items-center justify-center py-16">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Lỗi truy cập</CardTitle>
            <CardDescription>Không thể truy cập chức năng này</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">{errorMessage}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild variant="outline">
              <Link href={returnUrl}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {returnLabel}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
