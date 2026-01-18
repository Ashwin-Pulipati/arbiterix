from __future__ import annotations
from asgiref.sync import async_to_sync
from domain.auth.types import Identity
from integrations.permit_client import permit_client, permit_config

class Authorizer:
    def sync_user(self, user_key: str, email: str, first_name: str) -> None:
        async def _sync():
            await permit_client.api.users.sync({"key": user_key, "email": email, "first_name": first_name})
        async_to_sync(_sync)()

    def assign_admin(self, user_key: str) -> None:
        async def _assign():
            try:
                await permit_client.api.users.unassign_role(
                    {
                        "user": user_key,
                        "role": permit_config.user_role_key,
                        "tenant": permit_config.tenant_key,
                    }
                )
            except Exception:
                pass

            await permit_client.api.users.assign_role(
                {
                    "user": user_key,
                    "role": permit_config.admin_role_key,
                    "tenant": permit_config.tenant_key,
                }
            )
        async_to_sync(_assign)()

    def assign_user(self, user_key: str) -> None:
        async def _assign():
            try:
                await permit_client.api.users.unassign_role(
                    {
                        "user": user_key,
                        "role": permit_config.admin_role_key,
                        "tenant": permit_config.tenant_key,
                    }
                )
            except Exception:
                pass

            await permit_client.api.users.assign_role(
                {
                    "user": user_key,
                    "role": permit_config.user_role_key,
                    "tenant": permit_config.tenant_key,
                }
            )
        async_to_sync(_assign)()

    def check(self, identity: Identity, action: str, resource: str) -> bool:
        async def _check():
            return await permit_client.check(identity.user_key, action, resource)

        try:
            return bool(async_to_sync(_check)())
        except Exception:
            return False