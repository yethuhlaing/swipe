import { Skeleton } from "@/components/ui/skeleton"

export default function InboxLoading() {
    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-col gap-2 mb-4 shrink-0 px-4 lg:px-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex min-h-0 flex-1 border rounded-lg overflow-hidden mx-4 lg:mx-6">
                <div className="w-80 border-r flex flex-col bg-muted/30">
                    <Skeleton className="h-12 m-2 rounded-md" />
                    <div className="flex-1 space-y-1 p-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
                <div className="flex-1 flex flex-col p-4">
                    <Skeleton className="h-14 w-64 mb-4 rounded-md" />
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-20 w-3/4 rounded-xl" />
                        <Skeleton className="h-20 w-2/3 ml-auto rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}
