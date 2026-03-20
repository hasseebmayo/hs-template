"use client";

import { Slot } from "@radix-ui/react-slot";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@repo/ui/components/field";
import {
	createFormHook,
	createFormHookContexts,
	useStore,
} from "@tanstack/react-form";
import * as React from "react";

const {
	fieldContext,
	formContext,
	useFieldContext: useFormFieldContext,
	useFormContext,
} = createFormHookContexts();

type FormFieldContextValue = {
	id: string;
};

type FormFieldContextReturn<TData = unknown> = ReturnType<
	typeof useFormFieldContext<TData>
> & {
	id: string;
	formFieldId: string;
	formDescriptionId: string;
	formMessageId: string;
};

const FieldContext = React.createContext<FormFieldContextValue>(
	{} as FormFieldContextValue,
);

const useFieldContext = <TData = unknown>(): FormFieldContextReturn<TData> => {
	const { id } = React.useContext(FieldContext);
	const { name, ...fieldContext } = useFormFieldContext<TData>();

	return {
		id,
		name,
		formFieldId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldContext,
	} as unknown as FormFieldContextReturn<TData>;
};

function FieldWrapper(props: React.ComponentProps<typeof Field>) {
	const id = React.useId();

	return (
		<FieldContext.Provider value={{ id }}>
			<Field {...props} />
		</FieldContext.Provider>
	);
}

function FieldControl({
	valuePropName: _valuePropName,
	...props
}: React.ComponentProps<typeof Slot> & {
	valuePropName?: string;
}) {
	const { formFieldId, formDescriptionId, formMessageId, store } =
		useFieldContext();

	const isInvalid = useStore(
		store,
		(state) => state.meta.isTouched && !state.meta.isValid,
	);

	const describedBy = [formDescriptionId, isInvalid ? formMessageId : null]
		.filter(Boolean)
		.join(" ");

	return (
		<Slot
			data-slot="field-control"
			id={formFieldId}
			aria-invalid={isInvalid || undefined}
			aria-describedby={describedBy || undefined}
			{...props}
		/>
	);
}

function FieldLabelWrapper({
	className,
	...props
}: React.ComponentProps<typeof FieldLabel>) {
	const { formFieldId } = useFieldContext();

	return <FieldLabel htmlFor={formFieldId} className={className} {...props} />;
}

function FieldDescriptionWrapper({
	className,
	...props
}: React.ComponentProps<typeof FieldDescription>) {
	const { formDescriptionId } = useFieldContext();

	return (
		<FieldDescription id={formDescriptionId} className={className} {...props} />
	);
}

function FieldErrorWrapper({
	errors: errorsProps,
	className,
	...props
}: React.ComponentProps<typeof FieldError>) {
	const { store, formMessageId } = useFieldContext();
	const errors = useStore(store, (state) => state.meta.errors);
	const isInvalid = useStore(
		store,
		(state) => state.meta.isTouched && !state.meta.isValid,
	);

	if (!isInvalid) {
		return null;
	}

	return (
		<FieldError
			id={formMessageId}
			errors={
				(errorsProps ?? errors) as React.ComponentProps<
					typeof FieldError
				>["errors"]
			}
			className={className}
			{...props}
		/>
	);
}

const { useAppForm: useBaseAppForm, withForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		Field: FieldWrapper,
		FieldLabel: FieldLabelWrapper,
		FieldDescription: FieldDescriptionWrapper,
		FieldError: FieldErrorWrapper,
		FieldControl,
	},
	formComponents: {},
});

const useAppForm = ((props) => {
	return useBaseAppForm({
		...props,
	} as Parameters<typeof useBaseAppForm>[0]);
}) as typeof useBaseAppForm;

export { useAppForm, useFieldContext, useFormContext, withForm };
