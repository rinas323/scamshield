'use client'
import { useActionState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { verifyOtp, resendOtp } from '@/actions/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const emailFromUrl = searchParams.get('email') ?? ''

  // Use local state for email since useActionState doesn't preserve custom properties
  const [email] = useState(emailFromUrl)

  const [verifyState, verifyAction, verifyPending] = useActionState(verifyOtp, { ok: false, error: undefined })
  const [resendState, resendAction, resendPending] = useActionState(resendOtp, undefined)

  // Redirect on successful verification
  useEffect(() => {
    if (verifyState.ok) {
      router.push('/')
    }
  }, [verifyState.ok, router])

  // Countdown timer for resend
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    if (!canResend) {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer)
            setCanResend(true)
            return 0
          }
          return c - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [canResend])

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {verifyState.ok && (
            <div className="text-center text-emerald-600 dark:text-emerald-400">
              <p className="text-lg font-medium">Email verified!</p>
              <p className="mt-1 text-sm">Redirecting...</p>
            </div>
          )}

          {!verifyState.ok && (
            <>
              <form action={verifyAction} className="space-y-4">
                <input type="hidden" name="email" value={email} />
                <div className="grid grid-cols-6 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <Input
                      key={i}
                      name={`otp${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      autoComplete="one-time-code"
                      className="text-center text-2xl font-mono tracking-widest"
                      required
                    />
                  ))}
                </div>
                {verifyState.error && (
                  <p className="text-sm text-rose-600 dark:text-rose-400 text-center">{verifyState.error}</p>
                )}
                <Button type="submit" disabled={verifyPending} className="w-full">
                  {verifyPending ? 'Verifying...' : 'Verify'}
                </Button>
              </form>

              <div className="text-center space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Didn&apos;t receive the code?
                </p>
                <form action={resendAction}>
                  <input type="hidden" name="email" value={email} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    disabled={resendPending || !canResend}
                  >
                    {resendPending
                      ? 'Sending...'
                      : canResend
                        ? 'Resend code'
                        : `Resend in ${countdown}s`}
                  </Button>
                </form>
                {resendState?.error && (
                  <p className="text-sm text-rose-600 dark:text-rose-400">{resendState.error}</p>
                )}
                {resendState?.ok && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    New code sent!
                  </p>
                )}
              </div>

              <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                Wrong email?{' '}
                <Link href="/signup" className="text-indigo-600 hover:underline dark:text-indigo-400">
                  Sign up again
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Auto-focus first input and auto-advance
            document.querySelectorAll('input[name^="otp"]').forEach((input, idx, inputs) => {
              input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && idx < inputs.length - 1) {
                  inputs[idx + 1].focus();
                }
              });
              input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && idx > 0) {
                  inputs[idx - 1].focus();
                }
              });
            });
            // Combine individual inputs into single OTP on submit
            document.querySelector('form')?.addEventListener('submit', (e) => {
              const otp = Array.from(document.querySelectorAll('input[name^="otp"]'))
                .map(i => i.value)
                .join('');
              if (otp.length === 6) {
                const hidden = document.createElement('input');
                hidden.type = 'hidden';
                hidden.name = 'otp';
                hidden.value = otp;
                e.target.appendChild(hidden);
              }
            });
          `,
        }}
      />
    </div>
  )
}