<template>
  <div
    :class="{
      'cursor-not-allowed!': loading,
    }"
  >
    <UButton
      class="w-full h-full flex items-center justify-center"
      :class="{
        'bg-orange-900! hover:bg-orange-900! pointer-events-none opacity-100!':
          (loading || selected) && variant === 'solid',
        'bg-gray-400!': disabled && variant === 'solid',
        'p-3! w-fit aspect-square': size === 'icon',
        'text-orange-900!': variant === 'link' && (loading || selected),
        'text-gray-400!': variant === 'link' && disabled,
      }"
      :disabled="disabled"
      :leading-icon="variant !== 'link' ? icon : undefined"
      :loading="loading && variant !== 'link'"
      :loading-icon="size === 'icon' && variant !== 'link' ? icon : 'i-heroicons-arrow-path'"
      :size="size === 'sm' ? 'sm' : 'lg'"
      :trailing-icon="variant === 'link' ? icon : undefined"
      :type="type"
      :ui="{
        leadingIcon: variantIconClass + (loading && variant !== 'link' ? '!size-4' : '!size-3'),
        trailingIcon: variantIconClass + (loading && variant !== 'link' ? '!size-4' : '!size-3'),
        ...ui,
      }"
      :variant="variant"
      @click="$emit('click', $event)"
    >
      <template v-if="size !== 'icon'" #default> {{ label }} </template>
    </UButton>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    icon?: string;
    label?: string;
    loading?: boolean;
    selected?: boolean;
    size?: "default" | "sm" | "icon";
    type?: "button" | "submit";
    variant?: "solid" | "outline" | "link";
    ui?: {
      base?: string;
      label?: string;
      leadingIcon?: string;
      leadingAvatar?: string;
      leadingAvatarSize?: string;
      trailingIcon?: string;
    };
  }>(),
  {
    disabled: false,
    icon: "",
    label: "Button",
    loading: false,
    selected: false,
    size: "default",
    type: "button",
    variant: "solid",
    ui: undefined,
  }
);

defineEmits(["click"]);
const variantIconClass = computed(() => {
  if (props.size === "icon" || props.variant === "link") {
    return "!transform-none ";
  }
  return "";
});
</script>

<style lang="css"></style>
