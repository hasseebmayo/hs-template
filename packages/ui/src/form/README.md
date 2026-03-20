# AppForm — TanStack React Form + Zod Validation

A composable form system built on [TanStack React Form](https://tanstack.com/form/latest) with built-in [Zod](https://zod.dev) validation. Zero boolean prop sprawl, fully typed, and accessible.

## Quick Start

```tsx
import { useAppForm } from "@repo/ui/schema-form";
import { Input } from "@repo/ui/components/input";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
});

export function MyForm() {
  const form = useAppForm({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async (values) => {
      console.log("Form submitted:", values.value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="email">
        {(field) => (
          <field.Field>
            <field.FieldLabel>Email</field.FieldLabel>
            <field.FieldControl>
              <Input 
                {...field.inputProps()} 
                type="email"
              />
            </field.FieldControl>
            <field.FieldError />
          </field.Field>
        )}
      </form.AppField>

      <form.AppField name="firstName">
        {(field) => (
          <field.Field>
            <field.FieldLabel>First Name</field.FieldLabel>
            <field.FieldControl>
              <Input {...field.inputProps()} />
            </field.FieldControl>
            <field.FieldError />
          </field.Field>
        )}
      </form.AppField>

      <button type="submit">Submit</button>
    </form>
  );
}
```

## API Reference

### `useAppForm(options)`

Creates a typed form instance with built-in Zod validation.

#### Options

```tsx
interface FormOptions {
  // Initial field values
  defaultValues: Record<string, any>;

  // Validation configuration
  validators?: {
    // Run on form submission
    onSubmit?: ZodSchema;
    // Run on field blur
    onChange?: ZodSchema;
  };

  // Handle form submission
  onSubmit?: (formData: { value: Record<string, any> }) => void;

  // Optional: override the validator adapter (advanced)
  // validatorAdapter?: ValidatorAdapter;
}
```

#### Returns

```tsx
interface FormInstance {
  // State & methods
  state: { values, errors, isSubmitting, ... };
  handleSubmit: () => void;
  getFieldValue: (name: string) => any;
  setFieldValue: (name: string, value: any) => void;

  // Component wrappers
  AppField: Component<{ name: string; children: (field: FieldAPI) => ReactNode }>;
}
```

### `useFieldContext()`

Access field metadata and state within a field component.

```tsx
const field = useFieldContext();
// {
//   name: "email",
//   formFieldId: "fieldId-form-item",
//   formDescriptionId: "fieldId-form-item-description",
//   formMessageId: "fieldId-form-item-message",
//   state: { value, errors, isTouched, isValidating, isDirty },
//   handleChange: (value) => void,
//   handleBlur: () => void,
//   inputProps: () => ({ value, onChange, onBlur }),
// }
```

### `useFormContext()`

Access form-level state.

```tsx
const formState = useFormContext();
// { values, isSubmitting, isTouching, isDirty, ... }
```

### `withForm(Component)`

HOC to wrap a component with form context. Rarely needed—use `AppField` instead.

---

## Field Components

All field components are automatically registered and available via the field instance.

### `field.Field`

Wraps a form field group.

```tsx
<field.Field>
  <field.FieldLabel>Email</field.FieldLabel>
  <field.FieldControl>
    <Input {...field.inputProps()} />
  </field.FieldControl>
  <field.FieldDescription>We'll never share your email.</field.FieldDescription>
  <field.FieldError />
</field.Field>
```

### `field.FieldLabel`

Accessible label. Automatically linked to the control via `htmlFor`.

```tsx
<field.FieldLabel>Email Address</field.FieldLabel>
```

### `field.FieldControl`

Wrapper for the input element. Manages ARIA attributes (`aria-invalid`, `aria-describedby`).

```tsx
<field.FieldControl>
  <Input {...field.inputProps()} />
</field.FieldControl>
```

### `field.FieldDescription`

Optional helper text below the input.

```tsx
<field.FieldDescription>
  Use your work email for faster setup.
</field.FieldDescription>
```

### `field.FieldError`

Displays validation errors. Only renders when the field is **touched AND invalid**.

```tsx
<field.FieldError />
```

---

## Examples

### Basic Login Form

```tsx
import { useAppForm } from "@repo/ui/schema-form";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm() {
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(value),
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.AppField name="email">
        {(field) => (
          <field.Field>
            <field.FieldLabel>Email</field.FieldLabel>
            <field.FieldControl>
              <Input {...field.inputProps()} type="email" placeholder="you@example.com" />
            </field.FieldControl>
            <field.FieldDescription>Your registered email address.</field.FieldDescription>
            <field.FieldError />
          </field.Field>
        )}
      </form.AppField>

      <form.AppField name="password">
        {(field) => (
          <field.Field>
            <field.FieldLabel>Password</field.FieldLabel>
            <field.FieldControl>
              <Input {...field.inputProps()} type="password" />
            </field.FieldControl>
            <field.FieldError />
          </field.Field>
        )}
      </form.AppField>

      <Button type="submit" disabled={form.state.isSubmitting}>
        {form.state.isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
```

### Multi-Step Form

```tsx
const stepOneSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const stepTwoSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
});

export function SignupForm() {
  const [step, setStep] = React.useState(1);

  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    validators: {
      onSubmit: step === 1 ? stepOneSchema : stepTwoSchema,
    },
    onSubmit: async ({ value }) => {
      if (step === 1) {
        setStep(2);
      } else {
        // Final submission
        console.log("Complete form:", value);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {step === 1 ? (
        <>
          <form.AppField name="firstName">
            {(field) => (
              <field.Field>
                <field.FieldLabel>First Name</field.FieldLabel>
                <field.FieldControl>
                  <Input {...field.inputProps()} />
                </field.FieldControl>
                <field.FieldError />
              </field.Field>
            )}
          </form.AppField>

          <form.AppField name="lastName">
            {(field) => (
              <field.Field>
                <field.FieldLabel>Last Name</field.FieldLabel>
                <field.FieldControl>
                  <Input {...field.inputProps()} />
                </field.FieldControl>
                <field.FieldError />
              </field.Field>
            )}
          </form.AppField>
        </>
      ) : (
        <>
          <form.AppField name="email">
            {(field) => (
              <field.Field>
                <field.FieldLabel>Email</field.FieldLabel>
                <field.FieldControl>
                  <Input {...field.inputProps()} type="email" />
                </field.FieldControl>
                <field.FieldError />
              </field.Field>
            )}
          </form.AppField>

          <form.AppField name="phone">
            {(field) => (
              <field.Field>
                <field.FieldLabel>Phone</field.FieldLabel>
                <field.FieldControl>
                  <Input {...field.inputProps()} />
                </field.FieldControl>
                <field.FieldError />
              </field.Field>
            )}
          </form.AppField>
        </>
      )}

      <button type="submit">{step === 1 ? "Next" : "Submit"}</button>
    </form>
  );
}
```

### Custom Validation (Real-time)

```tsx
const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .refine(
      async (val) => {
        const response = await fetch(`/api/username-available?username=${val}`);
        return response.ok;
      },
      { message: "Username is already taken" }
    )
    .catch(() => false),
  bio: z.string().max(160, "Bio must be under 160 characters").optional(),
});

export function ProfileForm() {
  const form = useAppForm({
    defaultValues: {
      username: "",
      bio: "",
    },
    validators: {
      onChange: profileSchema, // Validate on every change
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      await fetch("/api/profile", {
        method: "POST",
        body: JSON.stringify(value),
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="username">
        {(field) => (
          <field.Field>
            <field.FieldLabel>Username</field.FieldLabel>
            <field.FieldControl>
              <Input {...field.inputProps()} />
            </field.FieldControl>
            <field.FieldDescription>3-20 characters. Letters, numbers, underscores only.</field.FieldDescription>
            {field.state.isValidating && <p>Checking availability...</p>}
            <field.FieldError />
          </field.Field>
        )}
      </form.AppField>

      <form.AppField name="bio">
        {(field) => (
          <field.Field>
            <field.FieldLabel>Bio</field.FieldLabel>
            <field.FieldControl>
              <textarea {...field.inputProps()} rows={3} />
            </field.FieldControl>
            <field.FieldDescription>
              {160 - (field.state.value?.length || 0)} characters remaining
            </field.FieldDescription>
            <field.FieldError />
          </field.Field>
        )}
      </form.AppField>

      <button type="submit" disabled={form.state.isSubmitting}>
        Save Profile
      </button>
    </form>
  );
}
```

---

## Tips & Best Practices

### 1. Always Use `field.inputProps()`

Automatically connects the input to the form state:

```tsx
// ✅ Good
<Input {...field.inputProps()} />

// ❌ Avoid
<Input value={field.state.value} onChange={(e) => field.setValue(e.target.value)} />
```

### 2. Errors Only Show When Touched

The `FieldError` component only renders after a field loses focus and has validation errors. This improves UX:

```tsx
<field.FieldError /> // Hidden until user blurs the field
```

### 3. Use TypeScript for Schema Inference

```tsx
const schema = z.object({
  email: z.string().email(),
  age: z.number(),
});

type FormValues = z.infer<typeof schema>;
// FormValues = { email: string; age: number }
```

### 4. Conditional Fields

```tsx
export function ConditionalForm() {
  const form = useAppForm({ /* ... */ });
  const country = form.state.values.country;

  return (
    <form>
      {/* ... country field ... */}
      
      {country === "US" && (
        <form.AppField name="state">
          {(field) => (
            <field.Field>
              <field.FieldLabel>State</field.FieldLabel>
              <field.FieldControl>
                <Select {...field.inputProps()} />
              </field.FieldControl>
              <field.FieldError />
            </field.Field>
          )}
        </form.AppField>
      )}
    </form>
  );
}
```

### 5. Server-Side Errors

```tsx
export function FormWithServerErrors() {
  const form = useAppForm({
    defaultValues: { email: "" },
    validators: { onSubmit: emailSchema },
    onSubmit: async ({ value }) => {
      try {
        await api.submit(value);
      } catch (error) {
        // Populate field errors from server
        form.setFieldValue("email", value.email);
        // You can also use onSubmit error handling in TanStack React Form docs
      }
    },
  });

  return (
    // ...
  );
}
```

---

## Architecture

The form system is built on three layers:

1. **TanStack React Form** — Core form state management & validation
2. **Zod Validator Adapter** — Automatic schema validation (injected by default)
3. **Radix UI Field Components** — Accessible form primitives

No custom factory functions or boolean props—pure composition.

---

## Migration from Other Form Libraries

### From `react-hook-form`

```tsx
// Before
const { register, formState: { errors } } = useForm();
<input {...register("email")} />
{errors.email && <span>{errors.email.message}</span>}

// After
const form = useAppForm({ ... });
<form.AppField name="email">
  {(field) => (
    <field.Field>
      <field.FieldControl>
        <Input {...field.inputProps()} />
      </field.FieldControl>
      <field.FieldError />
    </field.Field>
  )}
</form.AppField>
```

### From `formik`

```tsx
// Before
<Formik
  initialValues={{ email: "" }}
  validationSchema={validationSchema}
  onSubmit={handleSubmit}
>
  {({ values, errors, handleChange }) => (
    <input value={values.email} onChange={handleChange} />
  )}
</Formik>

// After
const form = useAppForm({
  defaultValues: { email: "" },
  validators: { onSubmit: validationSchema },
  onSubmit: handleSubmit,
});
// Much simpler API
```

---

## Resources

- [TanStack React Form Docs](https://tanstack.com/form/latest)
- [Zod Documentation](https://zod.dev)
- [Radix UI Field Component](../../components/field)

---

## License

MIT
