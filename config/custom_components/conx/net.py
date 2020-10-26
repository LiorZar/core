import asyncio
import socket
import logging
from homeassistant.util import get_local_ip
from homeassistant.core import HomeAssistant

from .db import DB

_LOGGER = logging.getLogger(__name__)


class UDP:
    def __init__(self, hass: HomeAssistant, db: DB, config: dict):
        print("Starting UDP server")
        self.db = db
        host_ip_addr = socket.gethostbyname(socket.getfqdn())
        host_ip_addr = get_local_ip()
        print("host ip addr: ", host_ip_addr)
        _LOGGER.debug("host ip addr: %s", host_ip_addr)
        sdp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sdp.setblocking(False)

        # Required for receiving multicast
        sdp.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sdp.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

        sdp.bind((host_ip_addr, 10103))
        self.listen = hass.loop.create_datagram_endpoint(
            lambda: UDPServerProtocol(self, hass.loop, sdp), sock=sdp
        )
        self.task = hass.async_create_task(self.listen)

    def onTick(self, elapse: float):
        pass

    def onMessage(self, data, addr):
        print("onMessage ", data, addr)

    def onError(self, data, addr):
        print("onError ", data, addr)


class UDPServerProtocol:
    def __init__(self, udp, loop, sock):
        """Initialize the UDPServerProtocol."""

        self.transport = None
        self.udp = udp
        self.loop = loop
        self.sock = sock
        udp.protocol = self

    def connection_made(self, transport):
        self.transport = transport

    def connection_lost(self, exc):
        _LOGGER.debug("connection_lost: %s", exc)

    def datagram_received(self, data, addr):
        self.udp.onMessage(data, addr)

    def error_received(self, exc):
        self.udp.onError(exc)

    def close(self):
        if self.transport:
            self.transport.close()
        self.loop.remove_writer(self.sock.fileno())
        self.loop.remove_reader(self.sock.fileno())
        self.sock.close()