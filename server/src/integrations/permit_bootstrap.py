from __future__ import annotations
from asgiref.sync import async_to_sync
from integrations.permit_client import permit_client, permit_config

class PermitBootstrapper:
    def bootstrap(self) -> None:
        self._ensure_tenant()
        self._ensure_resource_document()
        self._ensure_role_admin()
        self._ensure_role_user()
        self._ensure_policy_admin_document_full_access()
        self._ensure_policy_user_document_access()

    def _ensure_tenant(self) -> None:
        try:
            async_to_sync(permit_client.api.tenants.create)(
                {"key": permit_config.tenant_key, "name": permit_config.tenant_key}
            )
        except Exception:
            return

    def _ensure_resource_document(self) -> None:
        try:
            async_to_sync(permit_client.api.resources.create)(
                {
                    "key": "document",
                    "name": "Document",
                    "actions": {
                        "create": {"name": "create"},
                        "read": {"name": "read"},
                        "update": {"name": "update"},
                        "delete": {"name": "delete"},
                    },
                }
            )
        except Exception:
            return

    def _ensure_role_admin(self) -> None:
        try:
            async_to_sync(permit_client.api.roles.create)(
                {"key": permit_config.admin_role_key, "name": "Admin"}
            )
        except Exception:
            return

    def _ensure_role_user(self) -> None:
        try:
            async_to_sync(permit_client.api.roles.create)(
                {"key": permit_config.user_role_key, "name": "User"}
            )
        except Exception:
            return

    def _ensure_policy_admin_document_full_access(self) -> None:
        try:
            async_to_sync(permit_client.api.policies.create)(
                {
                    "role": permit_config.admin_role_key,
                    "resource": "document",
                    "actions": ["create", "read", "update", "delete"],
                    "tenant": permit_config.tenant_key,
                }
            )
        except Exception:
            return

    def _ensure_policy_user_document_access(self) -> None:
        try:
            async_to_sync(permit_client.api.roles.assign_permissions)(
                role_key=permit_config.user_role_key,
                permissions=["document:create", "document:read"]
            )
        except Exception as e:
            print(f"Error assigning user permissions: {e}")
            return
