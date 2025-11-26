import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8">
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">Verify OTP</h1>
                                <p className="text-muted-foreground text-balance">
                                    Enter the code sent to your email
                                </p>
                            </div>
                            <Field>
                                <FieldLabel htmlFor="otp">One-Time Password</FieldLabel>
                                <Input id="otp" type="text" placeholder="123456" required />
                            </Field>
                            <Field>
                                <Button type="submit">Verify</Button>
                            </Field>
                            <FieldDescription className="text-center">
                                Didn't receive code? <a href="#">Resend</a>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                    <div className="bg-muted relative hidden md:block">
                        <img
                            src="/placeholder.svg"
                            alt="Image"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}


