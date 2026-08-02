import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Field, FieldLabel } from "@/components/ui/field";
import type { LocationSelectProps } from "@/types";
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  Select,
} from "@/components/ui/select";

export function LocationSelect({
  id,
  placeholder,
  icon: Icon,
  value,
  onChange,
  disabled = false,
  options,
  autoComplete,
}: LocationSelectProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id} className="sr-only">
        {placeholder}
      </FieldLabel>
      <InputGroup className="h-12 rounded-xl border-slate-300 focus-within:ring-2 focus-within:ring-red-200 focus-within:border-red-400">
        <InputGroupAddon align="inline-start" className="pl-4">
          <Icon className="h-5 w-5 text-slate-400" />
        </InputGroupAddon>
        <Select
          name={id}
          autoComplete={autoComplete}
          value={value}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger
            id={id}
            className="w-full h-full border-none shadow-none focus:ring-0 text-base"
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent
            position="popper"
            className="max-h-60 w-[var(--radix-select-trigger-width)]"
          >
            {options.map((opt) => (
              <SelectItem key={opt.code} value={opt.code}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </InputGroup>
    </Field>
  );
}
