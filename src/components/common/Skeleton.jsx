import { useTheme } from '../../context/ThemeContext';

export const Skeleton = ({ className, ...props }) => {
    const { isDark } = useTheme();
    return (
        <div
            className={`animate-pulse rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-200'} ${className}`}
            {...props}
        />
    );
};

export const CourseCardSkeleton = () => {
    return (
        <div className="rounded-lg overflow-hidden theme-card theme-border border h-full flex flex-col">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 flex-1 flex flex-col space-y-3">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center space-x-2 mt-auto pt-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="pt-3 border-t theme-border flex justify-between items-center">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        </div>
    )
}

export const CourseDetailSkeleton = () => {
    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex space-x-2">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-20 w-full" />
                            <div className="flex space-x-6">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </div>

                        {/* Video */}
                        <Skeleton className="w-full aspect-video rounded-lg" />

                        {/* Content */}
                        <div className="theme-card rounded-lg p-6 space-y-4">
                            <Skeleton className="h-8 w-48" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="h-6 w-full" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="theme-card rounded-lg p-6 space-y-6">
                            <Skeleton className="h-10 w-32" />
                            <div className="space-y-3">
                                <Skeleton className="h-12 w-full rounded-lg" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-5 w-full" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const DashboardSkeleton = () => {
    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-lg" />
                    ))}
                </div>

                {/* Content */}
                <div className="theme-card rounded-lg p-6">
                    <div className="flex justify-between mb-6">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="aspect-video rounded-lg" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const TableSkeleton = () => {
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-64" />
                <div className="flex space-x-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>
            <div className="theme-card rounded-lg overflow-hidden border theme-border">
                {/* Header */}
                <div className="p-4 border-b theme-border bg-gray-50 dark:bg-gray-800 grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-3/4" />
                    ))}
                </div>
                {/* Rows */}
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border-b theme-border grid grid-cols-4 gap-4 last:border-0">
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export const ChartSkeleton = () => {
    return (
        <div className="theme-card rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-32" />
            </div>
            <div className="flex items-end space-x-4 h-64 mt-8">
                {[...Array(12)].map((_, i) => (
                    <Skeleton key={i} className="w-full rounded-t-lg" style={{ height: `${Math.random() * 60 + 20}%` }} />
                ))}
            </div>
        </div>
    )
}

export const ProfileSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="theme-card rounded-lg overflow-hidden mb-6">
                <Skeleton className="h-32 w-full" /> {/* Cover */}
                <div className="px-6 pb-6">
                    <div className="relative flex items-end -mt-12 mb-4">
                        <Skeleton className="w-24 h-24 rounded-full border-4 theme-border" />
                        <div className="ml-4 mb-2 flex-1">
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <div className="theme-card rounded-lg p-6 space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-4 w-full" />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <div className="theme-card rounded-lg p-6">
                        <div className="flex space-x-4 mb-6">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-8 w-24 rounded-full" />
                            ))}
                        </div>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-32 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
