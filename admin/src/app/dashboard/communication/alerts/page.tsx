"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BellRing, CheckCircle, AlertCircle } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import {
  FloatingLabelInput,
  FloatingLabelTextarea,
  FloatingLabelSelect,
  SelectItem,
} from "@/components/floating-input"

export default function SendAlertsPage() {
    const [formData, setFormData] = useState({
        targetAudience: '',
        type: '',
        title: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSubmitStatus('idle');
        setErrorMessage('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting) {
            console.log("Already submitting, ignoring...");
            return;
        }
        
        if (!formData.targetAudience || !formData.type || !formData.title || !formData.message) {
            setErrorMessage('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');
        setErrorMessage('');

        try {
            console.log("Sending alert with data:", formData);
            const response = await fetch('/api/admin/alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    message: formData.message,
                    type: formData.type,
                    targetAudience: formData.targetAudience,
                    createdBy: 'admin' // You might want to get this from auth context
                })
            });

            const result = await response.json();
            console.log("API response:", result);

            if (response.ok) {
                if (result.duplicate) {
                    setSubmitStatus('error');
                    setErrorMessage('This alert was already sent recently. Please wait a few minutes before sending again.');
                } else {
                    setSubmitStatus('success');
                    // Reset form
                    setFormData({
                        targetAudience: '',
                        type: '',
                        title: '',
                        message: ''
                    });
                    // Reset success message after 3 seconds
                    setTimeout(() => setSubmitStatus('idle'), 3000);
                }
            } else {
                setSubmitStatus('error');
                setErrorMessage(result.error || 'Failed to send alert');
            }
        } catch (error) {
            console.error('Submit error:', error);
            setSubmitStatus('error');
            setErrorMessage('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            targetAudience: '',
            type: '',
            title: '',
            message: ''
        });
        setSubmitStatus('idle');
        setErrorMessage('');
    };

    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="Send Alerts" />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                Broadcast important ELIDZ announcements, maintenance notices, and urgent operational updates to the right audience in real time.
            </p>
            
            {submitStatus === 'success' && (
                <div className="flex items-center gap-2 p-4 bg-green-100 border border-green-200 rounded-lg text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span>Alert sent successfully!</span>
                </div>
            )}
            
            {submitStatus === 'error' && (
                <div className="flex items-center gap-2 p-4 bg-red-100 border border-red-200 rounded-lg text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span>{errorMessage}</span>
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <Card className="w-full min-h-[calc(100vh-8rem)] rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                    <CardHeader>
                        <CardTitle>Broadcast Alert</CardTitle>
                        <CardDescription>
                            Send a system-wide alert or notification to specific user groups.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatingLabelSelect
                                label="Target Audience"
                                placeholder="Select audience"
                                className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                                value={formData.targetAudience}
                                onValueChange={(value) => handleInputChange('targetAudience', value)}
                            >
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="tenants">Tenants</SelectItem>
                                <SelectItem value="investors">Investors</SelectItem>
                                <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
                                <SelectItem value="students">Students</SelectItem>
                                <SelectItem value="smmes">SMMES</SelectItem>
                                <SelectItem value="staff">Staff Only</SelectItem>
                            </FloatingLabelSelect>
                            <FloatingLabelSelect
                                label="Alert Type"
                                placeholder="Select type"
                                className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                                value={formData.type}
                                onValueChange={(value) => handleInputChange('type', value)}
                            >
                                <SelectItem value="info">Information</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                            </FloatingLabelSelect>
                        </div>

                        <FloatingLabelInput
                            id="title"
                            label="Title"
                            placeholder="Alert title"
                            className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                        />

                        <FloatingLabelTextarea
                            id="message"
                            label="Message"
                            placeholder="Type your message here..."
                            className="min-h-[140px] rounded-3xl border-transparent bg-orange-100/80 px-4 py-3 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                            value={formData.message}
                            onChange={(e) => handleInputChange('message', e.target.value)}
                        />

                        <div className="pt-4">
                            <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                Delivery Tips
                            </div>
                            <div className="text-sm space-y-2 rounded-2xl bg-gradient-to-br from-orange-100 via-amber-100 to-rose-100 p-4 text-orange-900 ring-1 ring-orange-200/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:from-orange-900/30 dark:via-amber-900/25 dark:to-rose-900/25 dark:text-orange-100 dark:ring-orange-800/40">
                                <p>• Keep alerts short and action-oriented for faster response.</p>
                                <p>• Use Critical only for urgent incidents to avoid alert fatigue.</p>
                                <p>• Include clear time windows and contact details when relevant.</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center gap-2">
                         <div className="text-xs text-muted-foreground flex items-center gap-2 mr-2">
                            <BellRing className="h-4 w-4" />
                            Will push to mobile devices
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 rounded-3xl border-0 bg-red-600 px-5 font-semibold text-white shadow-sm hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <AnimatedDashboardButton 
                            label={isSubmitting ? "Sending..." : "Send Alert"} 
                            className="h-10 rounded-3xl px-5" 
                            disabled={isSubmitting}
                            type="submit"
                        />
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
