import { Skeleton } from "@/components/ui/skeleton"

export default function PipelineLoading() {
    return (
        <div className="px-4 lg:px-6">
            <div className="flex flex-col gap-2 mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-96" />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                        key={i}
                        className="flex-shrink-0 w-72 rounded-lg border bg-card p-4 space-y-3"
                    >
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}
