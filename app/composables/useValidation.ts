import * as v from "valibot";

/**
 * Validation Composable
 * Provides Valibot schemas for form validation
 */

export const useValidation = () => {
  const { t } = useI18n();

  // Packaging Product Validation
  const packagingSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1, t("validationErrors.required"))),
    description: v.optional(v.string()),
    sku: v.pipe(v.string(), v.minLength(1, t("validationErrors.required"))),
    unit: v.pipe(v.string(), v.minLength(1, t("validationErrors.required"))),
    unit_price: v.pipe(v.number(), v.minValue(0, "Price must be 0 or greater")),
    stock_quantity: v.pipe(v.number(), v.integer(), v.minValue(0, "Stock must be 0 or greater")),
    category: v.optional(v.string()),
    image_url: v.optional(v.union([v.pipe(v.string(), v.url()), v.literal("")])),
    is_active: v.optional(v.boolean()),
  });

  // Order Validation
  const orderSchema = v.object({
    packaging_product_id: v.pipe(v.string(), v.uuid()),
    quantity: v.pipe(v.number(), v.integer(), v.minValue(1, "Quantity must be at least 1")),
    notes: v.optional(v.string()),
  });

  // User Validation
  const userSchema = v.object({
    name: v.pipe(v.string(), v.minLength(2, t("validationErrors.nameMinLength"))),
    email: v.pipe(v.string(), v.email(t("validationErrors.emailInvalid"))),
    role: v.picklist(["admin", "staff"]),
  });

  // Login Validation
  const loginSchema = v.object({
    email: v.pipe(v.string(), v.email(t("validationErrors.emailInvalid"))),
    password: v.pipe(v.string(), v.minLength(1, t("validationErrors.required"))),
  });

  // Invitation Validation
  const invitationSchema = v.object({
    email: v.pipe(v.string(), v.email(t("validationErrors.emailInvalid"))),
    role: v.picklist(["admin", "staff"]),
    name: v.pipe(v.string(), v.minLength(2, t("validationErrors.nameMinLength"))),
  });

  // Validate function
  const validate = <T>(schema: v.BaseSchema<T, any, any>, data: unknown) => {
    try {
      const result = v.parse(schema, data);
      return { success: true, data: result, errors: null };
    } catch (error) {
      if (v.isValiError(error)) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const path = issue.path?.map((p) => p.key).join(".") || "_error";
          errors[path] = issue.message;
        });
        return { success: false, data: null, errors };
      }
      return { success: false, data: null, errors: { _error: "Validation failed" } };
    }
  };

  return {
    packagingSchema,
    orderSchema,
    userSchema,
    loginSchema,
    invitationSchema,
    validate,
  };
};
