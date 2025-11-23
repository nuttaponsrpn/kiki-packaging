/**
 * Debounced Validation Composable
 * Provides debounced validation for form fields to reduce expensive validation operations
 */

import { ref, watch, type Ref } from "vue";
import * as v from "valibot";

export const useDebouncedValidation = <T extends Record<string, unknown>>(
  formData: Ref<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: v.BaseSchema<any, any, any>,
  debounceMs = 300
) => {
  const validationErrors = ref<Array<{ field: string; message: string }>>([]);
  const isValidating = ref(false);
  const isValid = ref(false);

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  // Perform validation
  const validate = () => {
    isValidating.value = true;
    try {
      v.parse(schema, formData.value);
      validationErrors.value = [];
      isValid.value = true;
    } catch (error) {
      if (error instanceof v.ValiError) {
        validationErrors.value = error.issues.map((issue) => {
          const fieldPath =
            issue.path
              ?.map((pathItem: { key: string | number }) => String(pathItem.key))
              .join(".") || "unknown";
          return {
            field: fieldPath,
            message: issue.message,
          };
        });
      }
      isValid.value = false;
    } finally {
      isValidating.value = false;
    }
  };

  // Debounced validation
  const debouncedValidate = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      validate();
    }, debounceMs);
  };

  // Watch form data changes
  watch(
    formData,
    () => {
      debouncedValidate();
    },
    { deep: true, immediate: true }
  );

  // Get error for a specific field
  const getFieldError = (fieldName: string) => {
    return validationErrors.value.find((error) => error.field === fieldName);
  };

  return {
    validationErrors,
    isValidating,
    isValid,
    validate, // For immediate validation
    getFieldError,
  };
};
