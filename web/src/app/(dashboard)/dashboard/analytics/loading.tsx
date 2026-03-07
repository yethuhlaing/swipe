import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsLoading() {
    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 lg:px-6 md:gap-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-4 w-96 max-w-full" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
            </div>

            <Skeleton className="h-[420px] w-full rounded-xl" />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <Skeleton className="h-[360px] w-full rounded-xl xl:col-span-2" />
                <Skeleton className="h-[360px] w-full rounded-xl xl:col-span-1" />
            </div>
        </div>
    )
}
