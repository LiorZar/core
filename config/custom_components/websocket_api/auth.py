"""Handle the auth of a connection."""
import voluptuous as vol
from voluptuous.humanize import humanize_error

from datetime import timedelta
from homeassistant.auth.models import RefreshToken, User
from homeassistant.components.http.ban import process_success_login, process_wrong_login
from homeassistant.auth.providers import homeassistant as auth_ha
from homeassistant.const import __version__

from .connection import ActiveConnection
from .error import Disconnect

# mypy: allow-untyped-calls, allow-untyped-defs

TYPE_AUTH = "auth"
TYPE_USER = "user"
TYPE_AUTH_INVALID = "auth_invalid"
TYPE_AUTH_OK = "auth_ok"
TYPE_AUTH_REQUIRED = "auth_required"

AUTH_MESSAGE_SCHEMA = vol.Schema(
    {
        vol.Required("type"): vol.In([TYPE_AUTH, TYPE_USER]),
        vol.Exclusive("api_password", TYPE_AUTH): str,
        vol.Exclusive("access_token", TYPE_AUTH): str,
        vol.Inclusive("username", TYPE_USER): str,
        vol.Inclusive("password", TYPE_USER): str,
        vol.Inclusive("guid", TYPE_USER): str,
    }
)


def auth_ok_message():
    """Return an auth_ok message."""
    return {"type": TYPE_AUTH_OK, "ha_version": __version__}


def auth_required_message():
    """Return an auth_required message."""
    return {"type": TYPE_AUTH_REQUIRED, "ha_version": __version__}


def auth_invalid_message(message):
    """Return an auth_invalid message."""
    return {"type": TYPE_AUTH_INVALID, "message": message}


class AuthPhase:
    """Connection that requires client to authenticate first."""

    def __init__(self, logger, hass, send_message, request):
        """Initialize the authentiated connection."""
        self._hass = hass
        self._send_message = send_message
        self._logger = logger
        self._request = request
        self._authenticated = False
        self._connection = None
        self._provider = auth_ha.async_get_provider(hass)

    async def async_handle(self, msg):
        """Handle authentication."""
        try:
            msg = AUTH_MESSAGE_SCHEMA(msg)
        except vol.Invalid as err:
            error_msg = (
                f"Auth message incorrectly formatted: {humanize_error(msg, err)}"
            )
            self._logger.warning(error_msg)
            self._send_message(auth_invalid_message(error_msg))
            raise Disconnect from err

        if "access_token" in msg:
            self._logger.debug("Received access_token")
            refresh_token = await self._hass.auth.async_validate_access_token(
                msg["access_token"]
            )
            if refresh_token is not None:
                return await self._async_finish_auth(refresh_token.user, refresh_token)

        if "username" in msg:
            self._logger.debug("Received username")
            try:
                await self._provider.async_validate_login(
                    msg["username"], msg["password"]
                )
            except auth_ha.InvalidAuth:
                self._send_message(
                    auth_invalid_message("Invalid access token or password")
                )
                await process_wrong_login(self._request)
                raise Disconnect

            users = await self._hass.auth.async_get_users()
            for user in users:
                if user.name == msg["username"]:
                    refresh_token: RefreshToken = None
                    for token in user.refresh_tokens.values():
                        if token.client_id == msg["guid"]:
                            refresh_token = token
                            break

                    if refresh_token is None:
                        refresh_token = (
                            await self._hass.auth.async_create_refresh_token(
                                user,
                                msg["guid"],
                                access_token_expiration=timedelta(days=365),
                            )
                        )

                    if refresh_token is not None:
                        access_token = self._hass.auth.async_create_access_token(
                            refresh_token
                        )
                        self._send_message(
                            {"type": "auth_user", "access_token": access_token}
                        )
                        return await self._async_finish_auth(
                            refresh_token.user, refresh_token
                        )

        self._send_message(auth_invalid_message("Invalid access token or password"))
        await process_wrong_login(self._request)
        raise Disconnect

    async def _async_finish_auth(
        self, user: User, refresh_token: RefreshToken
    ) -> ActiveConnection:
        """Create an active connection."""
        self._logger.debug("Auth OK")
        await process_success_login(self._request)
        self._send_message(auth_ok_message())
        return ActiveConnection(
            self._logger, self._hass, self._send_message, user, refresh_token
        )
