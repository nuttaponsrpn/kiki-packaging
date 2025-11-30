<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-size-24 font-bold text-gray-900">{{ t("users.title") }}</h1>
        <p class="text-gray-600 mt-1">{{ t("users.adminOnly") }}</p>
      </div>
      <MyButton
        v-if="isAdmin"
        variant="solid"
        icon="heroicons:envelope"
        :label="t('invitations.inviteUser')"
        @click="showInviteModal = true"
      />
    </div>

    <!-- Pending Invitations Section -->
    <div v-if="isAdmin && pendingInvitations.length > 0" class="mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-3">
        {{ t("invitations.pendingInvitations") }}
      </h2>
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ t("users.name") }}
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ t("users.email") }}
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ t("users.role") }}
                </th>

                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ t("invitations.sentAt") }}
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ t("invitations.expiresAt") }}
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ t("common.actions") }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="invitation in pendingInvitations"
                :key="invitation.id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ invitation.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ invitation.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="
                      invitation.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    "
                  >
                    {{ t(`users.${invitation.role}`) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(invitation.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatExpiryDate(invitation.expires_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    class="text-primary-600 hover:text-primary-900 mr-4"
                    @click="resendInvite(invitation.id)"
                  >
                    {{ t("invitations.resend") }}
                  </button>
                  <button
                    class="text-red-600 hover:text-red-900"
                    @click="confirmRevokeInvite(invitation)"
                  >
                    {{ t("invitations.revoke") }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ t("users.name") }}
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ t("users.email") }}
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ t("users.role") }}
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ t("users.status") }}
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ t("users.createdAt") }}
              </th>
              <th
                v-if="isAdmin"
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ t("common.actions") }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                {{ t("common.loading") }}
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                {{ t("common.noData") }}
              </td>
            </tr>
            <tr v-for="user in users" v-else :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 shrink-0">
                    <div
                      class="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold"
                    >
                      {{ getInitials(user.name) }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  "
                >
                  {{ t(`users.${user.role}`) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="
                    user.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  "
                >
                  {{ user.is_active ? t("users.active") : t("users.inactive") }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.created_at) }}
              </td>
              <td v-if="isAdmin" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  class="text-primary-600 hover:text-primary-900 mr-4"
                  @click="editUser(user)"
                >
                  {{ t("common.edit") }}
                </button>
                <button
                  class="text-red-600 hover:text-red-900"
                  :disabled="user.id === currentUserId"
                  @click="confirmDeleteUser(user)"
                >
                  {{ t("common.delete") }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Invite User Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showInviteModal"
          class="fixed inset-0 z-50 overflow-y-auto"
          @click.self="closeInviteModal"
        >
          <Transition name="backdrop">
            <div
              v-if="showInviteModal"
              class="fixed inset-0 bg-black/20 bg-opacity-50 transition-opacity z-0"
              @click="closeInviteModal"
            />
          </Transition>

          <div class="flex items-center justify-center min-h-screen px-4">
            <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ t("invitations.inviteUser") }}
                </h3>
                <button class="text-gray-400 hover:text-gray-600" @click="closeInviteModal">
                  <Icon name="heroicons:x-mark" class="w-6 h-6" />
                </button>
              </div>

              <form class="space-y-4" @submit.prevent="handleInvite">
                <MyTextField
                  v-model="inviteForm.name"
                  :label="t('users.name')"
                  :placeholder="t('users.name')"
                  required
                />

                <MyTextField
                  v-model="inviteForm.email"
                  :label="t('users.email')"
                  type="string"
                  :placeholder="t('users.email')"
                  required
                />

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t("users.role") }}
                  </label>
                  <select
                    v-model="inviteForm.role"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">{{ t("users.selectRole") }}</option>
                    <option value="admin">{{ t("users.admin") }}</option>
                    <option value="staff">{{ t("users.staff") }}</option>
                  </select>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                  <MyButton
                    type="button"
                    variant="outline"
                    :label="t('common.cancel')"
                    @click="closeInviteModal"
                  />
                  <MyButton
                    type="submit"
                    variant="solid"
                    :label="t('invitations.inviteUser')"
                    :loading="submitting"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Edit User Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showEditModal"
          class="fixed inset-0 z-50 overflow-y-auto"
          @click.self="closeEditModal"
        >
          <Transition name="backdrop">
            <div
              v-if="showEditModal"
              class="fixed inset-0 bg-black/20 bg-opacity-50 transition-opacity z-0"
              @click="closeEditModal"
            />
          </Transition>

          <div class="flex items-center justify-center min-h-screen px-4">
            <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ t("users.editUser") }}
                </h3>
                <button class="text-gray-400 hover:text-gray-600" @click="closeEditModal">
                  <Icon name="heroicons:x-mark" class="w-6 h-6" />
                </button>
              </div>

              <form class="space-y-4" @submit.prevent="updateUser">
                <MyTextField
                  v-model="formData.name"
                  :label="t('users.name')"
                  :placeholder="t('users.name')"
                  required
                />

                <MyTextField
                  v-model="formData.email"
                  :label="t('users.email')"
                  type="string"
                  :placeholder="t('users.email')"
                  required
                  disabled
                />

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t("users.role") }}
                  </label>
                  <select
                    v-model="formData.role"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">{{ t("users.selectRole") }}</option>
                    <option value="admin">{{ t("users.admin") }}</option>
                    <option value="staff">{{ t("users.staff") }}</option>
                  </select>
                </div>

                <div>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="formData.is_active"
                      type="checkbox"
                      class="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                    />
                    <span class="text-sm font-medium text-gray-700">{{ t("users.active") }}</span>
                  </label>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                  <MyButton
                    type="button"
                    variant="outline"
                    :label="t('common.cancel')"
                    @click="closeEditModal"
                  />
                  <MyButton
                    type="submit"
                    variant="solid"
                    :label="t('common.save')"
                    :loading="submitting"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Revoke Invitation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showRevokeModal"
          class="fixed inset-0 z-50 overflow-y-auto"
          @click.self="showRevokeModal = false"
        >
          <Transition name="backdrop">
            <div
              v-if="showRevokeModal"
              class="fixed inset-0 bg-black/20 bg-opacity-50 transition-opacity z-0"
              @click="showRevokeModal = false"
            />
          </Transition>

          <div class="flex items-center justify-center min-h-screen px-4">
            <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
              <div class="flex items-start mb-4">
                <div class="shrink-0">
                  <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-red-600" />
                </div>
                <div class="ml-3">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ t("invitations.revoke") }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-2">
                    {{ t("invitations.confirmRevoke") }}
                  </p>
                  <p class="text-sm font-medium text-gray-900 mt-2">
                    {{ inviteToRevoke?.email }}
                  </p>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <MyButton
                  type="button"
                  variant="outline"
                  :label="t('common.cancel')"
                  @click="showRevokeModal = false"
                />
                <MyButton
                  type="button"
                  variant="solid"
                  :label="t('invitations.revoke')"
                  :loading="submitting"
                  @click="handleRevokeInvite"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 overflow-y-auto"
          @click.self="showDeleteModal = false"
        >
          <Transition name="backdrop">
            <div
              v-if="showDeleteModal"
              class="fixed inset-0 bg-black/20 bg-opacity-50 transition-opacity z-0"
              @click="showDeleteModal = false"
            />
          </Transition>

          <div class="flex items-center justify-center min-h-screen px-4">
            <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
              <div class="flex items-start mb-4">
                <div class="shrink-0">
                  <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-red-600" />
                </div>
                <div class="ml-3">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ t("users.deleteUser") }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-2">
                    {{ t("users.confirmDelete") }}
                  </p>
                  <p class="text-sm font-medium text-gray-900 mt-2">
                    {{ userToDelete?.name }}
                  </p>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <MyButton
                  type="button"
                  variant="outline"
                  :label="t('common.cancel')"
                  @click="showDeleteModal = false"
                />
                <MyButton
                  type="button"
                  variant="solid"
                  :label="t('common.delete')"
                  :loading="submitting"
                  @click="handleDelete"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { $toast } = useNuxtApp();
const supabase = useSupabase();
const invitations = useInvitations();

// User state
const userProfile = useState<{ id: string; role: string } | null>("userProfile");
const currentUserId = computed(() => userProfile.value?.id);
const isAdmin = computed(() => userProfile.value?.role === "admin");

// Data
const users = ref<any[]>([]);
const pendingInvitations = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);

// Modal states
const showInviteModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showRevokeModal = ref(false);
const userToDelete = ref<any>(null);
const inviteToRevoke = ref<any>(null);
const editingUser = ref<any>(null);

// Form data
const inviteForm = ref<{
  name: string;
  email: string;
  role: "admin" | "staff" | "";
}>({
  name: "",
  email: "",
  role: "",
});

const formData = ref({
  name: "",
  email: "",
  role: "",
  is_active: true,
});

// Check admin access
onMounted(() => {
  if (!isAdmin.value) {
    $toast.error(t("users.adminOnly"));
  } else {
    fetchUsers();
    fetchPendingInvitations();
  }
});

// Fetch users
const fetchUsers = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    users.value = data || [];
  } catch (error: any) {
    console.error("Error fetching users:", error);
    $toast.error(t("common.error"), error.message);
  } finally {
    loading.value = false;
  }
};

// Fetch pending invitations
const fetchPendingInvitations = async () => {
  const result = await invitations.getPendingInvitations();
  if (result.success) {
    pendingInvitations.value = result.data;
  }
};

// Send invitation
const handleInvite = async () => {
  if (!inviteForm.value.role) return;

  submitting.value = true;
  const result = await invitations.sendInvitation({
    email: inviteForm.value.email,
    name: inviteForm.value.name,
    role: inviteForm.value.role as "admin" | "staff",
  });

  submitting.value = false;

  if (result.success) {
    closeInviteModal();
    await fetchPendingInvitations();
  }
};

// Close invite modal
const closeInviteModal = () => {
  showInviteModal.value = false;
  inviteForm.value = {
    name: "",
    email: "",
    role: "",
  };
};

// Resend invitation
const resendInvite = async (invitationId: string) => {
  await invitations.resendInvitation(invitationId);
  await fetchPendingInvitations();
};

// Confirm revoke invitation
const confirmRevokeInvite = (invitation: any) => {
  inviteToRevoke.value = invitation;
  showRevokeModal.value = true;
};

// Revoke invitation
const handleRevokeInvite = async () => {
  if (!inviteToRevoke.value) return;

  submitting.value = true;
  await invitations.revokeInvitation(inviteToRevoke.value.id);
  submitting.value = false;

  showRevokeModal.value = false;
  inviteToRevoke.value = null;
  await fetchPendingInvitations();
};

// Format expiry date
const formatExpiryDate = (expiresAt: string) => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffInMs = expiry.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return t("invitations.expired");
  } else if (diffInDays === 0) {
    return t("invitations.expiresInHours", { hours: Math.ceil(diffInMs / (1000 * 60 * 60)) });
  } else if (diffInDays === 1) {
    return t("invitations.expiresInOneDay");
  } else {
    return t("invitations.expiresInDays", { days: diffInDays });
  }
};

// Update user
const updateUser = async () => {
  if (!editingUser.value) return;

  submitting.value = true;
  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        name: formData.value.name,
        role: formData.value.role,
        is_active: formData.value.is_active,
      })
      .eq("id", editingUser.value.id);

    if (error) throw error;

    $toast.success(t("users.userUpdated"));
    await fetchUsers();
    closeEditModal();
  } catch (error: any) {
    console.error("Error updating user:", error);
    $toast.error(t("users.updateError"), error.message);
  } finally {
    submitting.value = false;
  }
};

// Edit user
const editUser = (user: any) => {
  editingUser.value = user;
  formData.value = {
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
  };
  showEditModal.value = true;
};

// Close edit modal
const closeEditModal = () => {
  showEditModal.value = false;
  editingUser.value = null;
  formData.value = {
    name: "",
    email: "",
    role: "",
    is_active: true,
  };
};

// Confirm delete user
const confirmDeleteUser = (user: any) => {
  if (user.id === currentUserId.value) {
    $toast.error(t("users.deleteError"), "Cannot delete your own account");
    return;
  }
  userToDelete.value = user;
  showDeleteModal.value = true;
};

// Delete user
const handleDelete = async () => {
  console.log("handleDelete called", userToDelete.value);
  if (!userToDelete.value) return;

  submitting.value = true;
  try {
    console.log("Calling Supabase Edge Function...");
    const { error: invokeError } = await supabase.functions.invoke('delete-user', {
      body: { userId: userToDelete.value.id }
    });

    if (invokeError) throw invokeError;

    $toast.success(t("users.userDeleted"));
    await fetchUsers();
    showDeleteModal.value = false;
    userToDelete.value = null;
  } catch (error: any) {
    console.error("Error deleting user:", error);
    $toast.error(t("users.deleteError"), error.message);
  } finally {
    submitting.value = false;
  }
};

// Utility functions
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
