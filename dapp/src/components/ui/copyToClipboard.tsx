import React from "react";
import { Tooltip } from "@material-tailwind/react";
import { useCopyToClipboard } from "usehooks-ts";
import { ClipboardCheck, Copy } from "lucide-react";
import { Button } from "./button";

export function ClipboardWithTooltip({ content, bg = "black" }: { content: string, bg: string }) {
    const [value, copy] = useCopyToClipboard();
    const [copied, setCopied] = React.useState(false);

    return (
        <Tooltip className={`p-1 bg-black text-white`} content={copied ? "Copied" : "Copy"}>
            <div
                onMouseLeave={() => setCopied(false)}
                onClick={() => {
                    copy(content);
                    setCopied(true);
                }}
                className="cursor-pointer"
            >
                {copied ? (
                    <ClipboardCheck color={bg} size={16} />
                ) : (
                    <Copy color={bg} size={16} />
                )}
            </div>
        </Tooltip>
    );
}