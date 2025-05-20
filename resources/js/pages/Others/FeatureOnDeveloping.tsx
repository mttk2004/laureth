import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { User } from "@/types/user";

interface PageProps {
    user: User;
}

export default function FeatureOnDeveloping({ user }: PageProps) {
    return (
        <AppLayout user={user}>
            <Head title="Tính năng này đang được phát triển" />
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
                <div className="rounded-xl p-10 max-w-2xl w-full">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-100 p-4 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#0066ff" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M12 9v2m0 4v.01" />
                                <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold text-blue-700 mb-4">Tính năng đang được phát triển</h1>

                    <p className="text-lg text-gray-600 mb-8">
                        Chúng tôi đang nỗ lực hoàn thiện tính năng này để mang đến trải nghiệm tốt nhất cho bạn.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-4 rounded-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#0066ff" fill="none" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
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
                        <div className="bg-white p-4 rounded-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#0066ff" fill="none" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
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

                    <a href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                        Quay lại Dashboard
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}
