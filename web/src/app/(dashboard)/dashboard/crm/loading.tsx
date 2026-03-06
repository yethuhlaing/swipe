export default function CRMLoading() {
    return (
        <div className="flex min-h-0 flex-1 flex-col px-4 lg:px-6">
            <div className="flex flex-col gap-2 mb-4 shrink-0">
                <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
            </div>
            <div className="space-y-4">
                <div className="h-10 w-full animate-pulse rounded bg-muted" />
                <div className="rounded-md border">
                    <div className="h-64 animate-pulse rounded bg-muted/30" />
                </div>
                <div className="h-8 w-full animate-pulse rounded bg-muted/50" />
            </div>
        </div>
    )
}
