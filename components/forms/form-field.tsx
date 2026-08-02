import { Field, FieldLabel } from "@/components/ui/field";
import type { FormFieldProps } from "@/types";
import {
  InputGroupInput,
  InputGroupAddon,
  InputGroup,
} from "@/components/ui/input-group";

export function FormField({
  id,
  placeholder,
  icon: Icon,
  type = "text",
  autoComplete,
  value,
  onChange,
  rightAction,
}: FormFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id} className="sr-only">
        {placeholder}
      </FieldLabel>
      <InputGroup className="h-12 rounded-xl border-slate-300 focus-within:ring-2 focus-within:ring-red-200 focus-within:border-red-400">
        <InputGroupAddon align="inline-start" className="pl-4">
          <Icon className="h-5 w-5 text-slate-400" />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          className="text-base"
        />
        {rightAction && (
          <InputGroupAddon align="inline-end" className="pr-2">
            {rightAction}
          </InputGroupAddon>
        )}
      </InputGroup>
    </Field>
  );
}
