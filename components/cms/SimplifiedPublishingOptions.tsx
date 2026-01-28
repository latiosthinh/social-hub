"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { status, container, locale, containerOptions, isLoadingContainers } from '@/lib/cms/store';
import { useZignal } from '@/hooks/cms/useZignal';
import type { PublishStatus, ContainerOption } from '@/lib/cms/store';
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export default function SimplifiedPublishingOptions() {
    const [open, setOpen] = React.useState(false)
    const currentStatus = useZignal(status);
    const currentContainer = useZignal(container);
    const currentLocale = useZignal(locale);
    const currentContainerOptions = useZignal(containerOptions);
    const currentIsLoadingContainers = useZignal(isLoadingContainers);

    return (
        <Card className="hover:border-primary/50 transition-colors p-0 border-none">
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-0">
                <div className="space-y-2">
                    <Label className="block" htmlFor="status">Status</Label>
                    <Select
                        value={currentStatus}
                        onValueChange={(value: PublishStatus) => status.set(value)}
                    >
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">📝 Draft</SelectItem>
                            <SelectItem value="published">✅ Published</SelectItem>
                            <SelectItem value="scheduled">📅 Scheduled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="block" htmlFor="container">Container (Parent Page) <span className="text-destructive">*</span></Label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between font-normal text-muted-foreground hover:text-foreground"
                                disabled={currentIsLoadingContainers}
                            >
                                {currentContainer
                                    ? currentContainerOptions.find((option: ContainerOption) => option.key === currentContainer)?.displayName
                                    : (currentIsLoadingContainers ? "Loading containers..." : "Select parent page")}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search container..." />
                                <CommandList>
                                    <CommandEmpty>No container found.</CommandEmpty>
                                    <CommandGroup>
                                        {currentContainerOptions.map((option: ContainerOption) => (
                                            <CommandItem
                                                key={option.key}
                                                value={option.key}
                                                keywords={[option.displayName]}
                                                onSelect={() => {
                                                    container.set(option.key);
                                                    setOpen(false);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        currentContainer === option.key ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {option.displayName}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label className="block" htmlFor="locale">Locale <span className="text-destructive">*</span></Label>
                    <Select
                        value={currentLocale}
                        onValueChange={(value) => locale.set(value)}
                    >
                        <SelectTrigger id="locale">
                            <SelectValue placeholder="Select locale" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="en-GB">English (UK)</SelectItem>
                            <SelectItem value="sv-SE">Swedish</SelectItem>
                            <SelectItem value="de-DE">German</SelectItem>
                            <SelectItem value="fr-FR">French</SelectItem>
                            <SelectItem value="es-ES">Spanish</SelectItem>
                            <SelectItem value="ja-JP">Japanese</SelectItem>
                            <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
