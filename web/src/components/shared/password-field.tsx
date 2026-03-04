"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface PasswordFieldProps {
    id?: string
    name?: string
    label?: string
    placeholder?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    required?: boolean
    disabled?: boolean
    showStrengthIndicator?: boolean
    showRequirements?: boolean
    className?: string
    autoComplete?: string
    requirementsDisplay?: "always" | "focus" | "compact" | "tooltip" | "none"
}

export function PasswordField({
    id = "password",
    name = "password",
    label = "Password",
    placeholder = "Enter your password",
    value = "",
    onChange,
    required = false,
    disabled = false,
    showStrengthIndicator = true,
    showRequirements = true,
    className,
    autoComplete = "current-password",
}: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState(value)
    const [strength, setStrength] = useState(0)

    // Sync internal state with value prop
    useEffect(() => {
        if (value !== undefined) {
            setPassword(value)
        }
    }, [value])

    // Password requirements
    const requirements = [
        { text: "At least 8 characters", regex: /.{8,}/ },
        { text: "At least one uppercase letter", regex: /[A-Z]/ },
        { text: "At least one lowercase letter", regex: /[a-z]/ },
        { text: "At least one number", regex: /[0-9]/ },
        { text: "At least one special character", regex: /[^A-Za-z0-9]/ },
    ]

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setPassword(newValue)

        if (onChange) {
            onChange(e)
        }
    }

    useEffect(() => {
        // Calculate password strength
        if (!password) {
            setStrength(0)
            return
        }

        let score = 0
        requirements.forEach((req) => {
            if (req.regex.test(password)) {
                score += 1
            }
        })

        // Additional strength factors
        if (password.length > 12) score += 1
        if (password.length > 16) score += 1

        setStrength(Math.min(score, 7))
    }, [password])

    const getStrengthLabel = () => {
        if (strength === 0) return "None"
        if (strength < 3) return "Weak"
        if (strength < 5) return "Medium"
        if (strength < 7) return "Strong"
        return "Very Strong"
    }

    const getStrengthColor = () => {
        if (strength === 0) return "bg-gray-200"
        if (strength < 3) return "bg-red-500"
        if (strength < 5) return "bg-yellow-500"
        if (strength < 7) return "bg-green-500"
        return "bg-emerald-500"
    }

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex justify-between items-center">
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}{" "}
                    {required && <span className="text-destructive">*</span>}
                </Label>
                {showStrengthIndicator && password && (
                    <span
                        className={cn(
                            "text-xs font-medium",
                            strength < 3
                                ? "text-red-500"
                                : strength < 5
                                  ? "text-yellow-500"
                                  : "text-green-500"
                        )}
                    >
                        {getStrengthLabel()}
                    </span>
                )}
            </div>

            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    id={id}
                    name={name}
                    value={value || password}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className="pr-10 h-11"
                    autoComplete={autoComplete}
                    aria-describedby={`${id}-requirements`}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={disabled}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={
                        showPassword ? "Hide password" : "Show password"
                    }
                >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                </button>
            </div>

            {showStrengthIndicator && password && (
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full transition-all duration-300",
                            getStrengthColor()
                        )}
                        style={{ width: `${(strength / 7) * 100}%` }}
                    />
                </div>
            )}

            {showRequirements &&
                password &&
                !requirements.every((req) => req.regex.test(password)) && (
                    <div className="space-y-1" id={`${id}-requirements`}>
                        {requirements.map((req, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                {req.regex.test(password) ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                    <X className="h-3.5 w-3.5 text-red-500" />
                                )}
                                <span
                                    className={cn(
                                        "text-xs",
                                        req.regex.test(password)
                                            ? "text-green-500"
                                            : "text-red-500"
                                    )}
                                >
                                    {req.text}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    )
}
