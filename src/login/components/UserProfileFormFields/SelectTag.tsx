import { cn } from "@/components/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { assert } from "tsafe/assert";
import type { InputFieldByTypeProps } from "./InputFieldByType";
import { InputLabel } from "./InputLabel";

export function SelectTag(props: InputFieldByTypeProps) {
    const { attribute, dispatchFormAction, displayableErrors, valueOrValues } = props;

    const isMultiple = attribute.annotations.inputType === "multiselect";

    const options = (() => {
        walk: {
            const { inputOptionsFromValidation } = attribute.annotations;

            if (inputOptionsFromValidation === undefined) {
                break walk;
            }

            assert(typeof inputOptionsFromValidation === "string");

            const validator = (
                attribute.validators as Record<string, { options?: string[] }>
            )[inputOptionsFromValidation];

            if (validator === undefined) {
                break walk;
            }

            if (validator.options === undefined) {
                break walk;
            }

            return validator.options;
        }

        return attribute.validators.options?.options ?? [];
    })();

    // For multiselect, fall back to native select as shadcn doesn't support multi-select
    if (isMultiple) {
        return (
            <select
                id={attribute.name}
                name={attribute.name}
                className={cn(
                    "flex min-h-25 h-auto w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    displayableErrors.length !== 0 &&
                        "border-destructive ring-destructive/20 focus:ring-destructive"
                )}
                aria-invalid={displayableErrors.length !== 0}
                disabled={attribute.readOnly}
                multiple={true}
                size={
                    attribute.annotations.inputTypeSize === undefined
                        ? undefined
                        : parseInt(`${attribute.annotations.inputTypeSize}`)
                }
                value={valueOrValues}
                onChange={event =>
                    dispatchFormAction({
                        action: "update",
                        name: attribute.name,
                        valueOrValues: Array.from(event.target.selectedOptions).map(
                            option => option.value
                        )
                    })
                }
                onBlur={() =>
                    dispatchFormAction({
                        action: "focus lost",
                        name: attribute.name,
                        fieldIndex: undefined
                    })
                }
            >
                {options.map(option => (
                    <option key={option} value={option}>
                        <InputLabel attribute={attribute} option={option} />
                    </option>
                ))}
            </select>
        );
    }

    return (
        <Select
            name={attribute.name}
            value={
                typeof valueOrValues === "string" && valueOrValues !== ""
                    ? valueOrValues
                    : undefined
            }
            onValueChange={value =>
                dispatchFormAction({
                    action: "update",
                    name: attribute.name,
                    valueOrValues: value
                })
            }
            disabled={attribute.readOnly}
        >
            <SelectTrigger
                id={attribute.name}
                className={cn(
                    "w-full",
                    displayableErrors.length !== 0 &&
                        "border-destructive ring-destructive/20 focus-visible:ring-destructive"
                )}
                aria-invalid={displayableErrors.length !== 0}
                onBlur={() =>
                    dispatchFormAction({
                        action: "focus lost",
                        name: attribute.name,
                        fieldIndex: undefined
                    })
                }
            >
                <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
                {options.map(option => (
                    <SelectItem key={option} value={option}>
                        <InputLabel attribute={attribute} option={option} />
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
