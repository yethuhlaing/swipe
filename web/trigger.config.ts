import { defineConfig } from "@trigger.dev/sdk/v3"

export default defineConfig({
    project: "swipe-wholesale", // Replace with your Trigger.dev project ref
    runtime: "node",
    logLevel: "log",

    // Maximum duration for tasks (in seconds)
    // Free tier: 300s (5 min), Pro: 3600s (1 hour)
    maxDuration: 300,

    // Retry configuration
    retries: {
        enabledInDev: true,
        default: {
            maxAttempts: 3,
            minTimeoutInMs: 1000,
            maxTimeoutInMs: 10000,
            factor: 2,
            randomize: true,
        },
    },

    // Directories to include in the build
    dirs: ["./src/trigger"],

    // Build configuration
    build: {
        // External packages that shouldn't be bundled
        external: ["sharp"],
    },
})
