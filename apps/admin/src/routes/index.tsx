import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useAppForm } from "@repo/ui/schema-form";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/")({ component: App });

const schema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

function App() {
	const form = useAppForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		validators: {
			onChange: schema,
		},
		onSubmit: ({ value }) => {
			console.log("Form submitted with values:", value);
		},
	});
	console.log("Form state:", form.state.errors);

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
			<form
				className="flex flex-col gap-4"
				onSubmit={(event) => {
					event.preventDefault();
					void form.handleSubmit();
				}}
			>
				<form.AppField name="email">
					{(field) => (
						<field.Field>
							<field.FieldLabel>Email</field.FieldLabel>
							<field.FieldControl>
								<Input
									value={String(field.state.value ?? "")}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="Enter email"
								/>
							</field.FieldControl>
							<field.FieldError />
						</field.Field>
					)}
				</form.AppField>
				<form.AppField name="password">
					{(field) => (
						<field.Field>
							<field.FieldLabel>Password</field.FieldLabel>
							<field.FieldControl>
								<Input
									value={String(field.state.value ?? "")}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="Enter password"
								/>
							</field.FieldControl>
							<field.FieldError />
						</field.Field>
					)}
				</form.AppField>

				<Button type="submit" className="w-fit">
					Submit
				</Button>
			</form>
		</div>
	);
}
