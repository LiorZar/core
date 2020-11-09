import asyncio
import socket
import select
import logging
import threading

from typing import Any, Dict

from homeassistant.util import get_local_ip
from homeassistant.core import HomeAssistant

from .db import DB

_LOGGER = logging.getLogger(__name__)


class TCP(threading.Thread):
    def __init__(self, hass: HomeAssistant, db: DB, config: dict):
        threading.Thread.__init__(self)
        self.lock = threading.Lock()

        self.sockets: Dict[str, socket] = {}
        self.connections: Dict[str, Any] = {}
        # host_ip_addr = socket.gethostbyname(socket.getfqdn())
        self.host_ip_addr = get_local_ip()
        self.active = True
        self.start()

    def Connect(self, id: str, ip: str, port: int):
        if id in self.connections:
            return

        self.connections[id] = {"id": id, "addr": (ip, port)}

    def run(self):
        while self.active:
            sockets = []
            for c in self.connections:
                if c not in self.sockets:
                    # s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    # s.connect(self.connections[c].addr)
                    try:
                        s = socket.create_connection(self.connections[c]["addr"], 0.1)
                        if s != None:
                            s.setblocking(0)
                            self.sockets[c] = s
                            self.connections[c]["socket"] = s
                            self._onConnected(self.connections[c])
                    except Exception as ex:
                        pass

            for c in self.sockets:
                sockets.append(self.sockets[c])

            try:
                readable, writable, exceptional = select.select(
                    sockets, sockets, sockets, 1
                )

                for s in readable:
                    self._onRead(s)

                for s in writable:
                    self._onWrite(s)

                for s in exceptional:
                    self._onExp(s)

                # print(writable)
                # print(exceptional)

                # for s in writable:                    s.send(b"")

            except Exception as ex:
                _LOGGER.error(
                    "Conx Responder socket exception occurred: %s", ex.__str__
                )
                # without the following continue, a second exception occurs
                # because the data object has not been initialized
                continue

    def stop(self):
        self.active = False
        self.join()

    def _getConnection(self, s: socket):
        for c in self.connections:
            if s == self.connections[c]["socket"]:
                return self.connections[c]
        return None

    def _onConnected(self, c):
        print(c["id"], "Connected")

    def _onRead(self, s: socket):
        c = self._getConnection(s)
        if None == c:
            return

        data = s.recv(1024)
        if len(data) <= 0:
            self._onExp(s)
            return

        print(c["id"], data)

    def _onWrite(self, s: socket):
        c = self._getConnection(s)
        if None == c:
            return
        pass

    def _onExp(self, s: socket):
        c = self._getConnection(s)
        if None == c:
            return
        del self.sockets[c["id"]]

    def _handle_request(self, data):
        pass

    def _prepare_response(self, search_target, unique_service_name):
        pass

    def onTick(self, elapse: float):
        pass

    def onStop(self):
        self.stop()


class UDP:
    def __init__(self, hass: HomeAssistant, db: DB, config: dict):
        print("Starting UDP server")
        self.db = db
        # host_ip_addr = socket.gethostbyname(socket.getfqdn())
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

    def onStop(self):
        pass

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