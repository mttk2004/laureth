import AppLayout from '@/layouts/app-layout';
import { User } from '@/types/user';
import { Head } from '@inertiajs/react';

interface PageProps {
    user: User;
}

export default function FeatureOnDeveloping({ user }: PageProps) {
    return (
        <AppLayout user={user}>
            <Head title="Tính năng này đang được phát triển" />
            <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
                <div className="w-full max-w-2xl rounded-xl p-10">
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-blue-100 p-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="#0066ff"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M12 9v2m0 4v.01" />
                                <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="mb-4 text-2xl font-bold text-blue-700">Tính năng đang được phát triển</h1>

                    <p className="mb-8 text-lg text-gray-600">
                        Chúng tôi đang nỗ lực hoàn thiện tính năng này để mang đến trải nghiệm tốt nhất cho bạn.
                    </p>

                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="flex items-center rounded-lg bg-white p-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="#0066ff"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-3"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4" />
                                <path d="M14.5 5.5l4 4" />
                                <path d="M12 8l-5 -5l-4 4l5 5" />
                                <path d="M7 8l-1.5 1.5" />
                                <path d="M16 12l5 5l-4 4l-5 -5" />
                                <path d="M16 17l-1.5 1.5" />
                            </svg>
                            <div>
                                <h3 className="font-medium">Đang phát triển</h3>
                                <p className="text-sm text-gray-500">Đội ngũ kỹ thuật đang làm việc</p>
                            </div>
                        </div>
                        <div className="flex items-center rounded-lg bg-white p-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="#0066ff"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-3"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                                <path d="M12 12l3 2" />
                                <path d="M12 7v5" />
                            </svg>
                            <div>
                                <h3 className="font-medium">Sắp ra mắt</h3>
                                <p className="text-sm text-gray-500">Vui lòng quay lại sau</p>
                            </div>
                        </div>
                    </div>

                    <a
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                    >
                        Quay lại Dashboard
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}
